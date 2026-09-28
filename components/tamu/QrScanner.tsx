'use client'

import { useEffect, useRef, useState } from 'react'

// Pemindai QR pakai kamera belakang HP/tablet. Butuh HTTPS & izin kamera.
export default function QrScanner({ onResult, paused }: { onResult: (text: string) => void; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const lastRef = useRef<{ text: string; at: number } | null>(null)

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setActive(false)
  }

  async function start() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Browser ini tidak mendukung kamera. Ketik kode 6 digit di bawah.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch (e) {
      const name = (e as Error)?.name
      setError(
        name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Buka pengaturan browser → izinkan kamera untuk situs ini, lalu coba lagi.'
          : 'Kamera tidak bisa dibuka. Ketik kode 6 digit di bawah.'
      )
      stop()
    }
  }

  useEffect(() => () => stop(), [])

  useEffect(() => {
    if (!active || paused) return
    let raf = 0
    let last = 0
    let decode: ((data: Uint8ClampedArray, w: number, h: number) => { data: string } | null) | null = null
    let alive = true

    import('jsqr').then((m) => {
      decode = (m.default as unknown as typeof decode) ?? null
    })

    const tick = (t: number) => {
      if (!alive) return
      raf = requestAnimationFrame(tick)
      if (t - last < 200 || !decode) return
      last = t
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return
      const w = 480
      const h = Math.round((video.videoHeight / video.videoWidth) * w) || 360
      canvas.width = w
      canvas.height = h
      const c = canvas.getContext('2d', { willReadFrequently: true })
      if (!c) return
      c.drawImage(video, 0, 0, w, h)
      const img = c.getImageData(0, 0, w, h)
      const found = decode(img.data, w, h)
      if (found?.data) {
        const now = Date.now()
        if (lastRef.current && lastRef.current.text === found.data && now - lastRef.current.at < 4000) return
        lastRef.current = { text: found.data, at: now }
        try {
          navigator.vibrate?.(80)
        } catch {
          // tidak didukung
        }
        onResult(found.data)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
  }, [active, paused, onResult])

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-2xl" style={{ background: '#0a0b0f', aspectRatio: '4 / 3' }}>
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ display: active ? 'block' : 'none' }} />
        <canvas ref={canvasRef} className="hidden" />
        {active ? (
          <div aria-hidden className="pointer-events-none absolute inset-[18%] rounded-2xl" style={{ border: '3px solid var(--brand-accent)', boxShadow: '0 0 0 9999px rgba(10,11,15,0.35)' }} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[13px]" style={{ color: '#d8cfb8' }}>Arahkan kamera ke QR undangan tamu.</p>
            <button type="button" onClick={() => void start()} className="rounded-xl px-5 py-2.5 text-[13.5px] font-bold" style={{ background: 'var(--brand-accent)', color: '#1a1305' }}>
              Buka Kamera
            </button>
          </div>
        )}
        {active && paused ? (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,11,15,0.6)' }}>
            <span className="text-[13px] font-bold" style={{ color: 'var(--brand-accent)' }}>QR terbaca</span>
          </div>
        ) : null}
      </div>
      {active ? (
        <button type="button" onClick={stop} className="self-end text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
          Tutup kamera
        </button>
      ) : null}
      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </div>
  )
}