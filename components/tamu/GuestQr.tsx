'use client'

import { useEffect, useState } from 'react'
import { useBranding } from '@/components/BrandingProvider'

const PURPOSE_LABEL: Record<string, string> = {
  keluarga: 'Keluarga / Kerabat',
  kurir: 'Kurir / Ojek Online',
  tukang: 'Tukang / Jasa',
  delivery: 'Delivery / Pengantaran',
  lainnya: 'Lainnya',
}

export function guestQrUrl(token: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/keamanan/scan-tamu?t=${token}`
}

// Gambar kartu undangan (QR + nama + kode) untuk dibagikan ke tamu lewat WhatsApp
async function renderCard(qrDataUrl: string, guestName: string, code: string, houseLabel: string | null, purpose: string, community: string, accent: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 1000
  const c = canvas.getContext('2d')!
  c.fillStyle = '#0a0b0f'
  c.fillRect(0, 0, 720, 1000)
  c.fillStyle = accent
  c.font = 'bold 30px Georgia, serif'
  c.textAlign = 'center'
  c.fillText(community.toUpperCase().slice(0, 32), 360, 80)
  c.fillStyle = '#b8ad92'
  c.font = '22px sans-serif'
  c.fillText('Undangan Tamu · tunjukkan ke Security di gerbang', 360, 120)

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('QR gagal dibuat'))
    img.src = qrDataUrl
  })
  c.fillStyle = '#ffffff'
  c.fillRect(110, 160, 500, 500)
  c.drawImage(img, 125, 175, 470, 470)

  c.fillStyle = '#ffffff'
  c.font = 'bold 38px sans-serif'
  c.fillText(guestName.slice(0, 28), 360, 740)
  c.fillStyle = '#d8cfb8'
  c.font = '24px sans-serif'
  c.fillText(`${PURPOSE_LABEL[purpose] ?? purpose}${houseLabel ? ` · tujuan Rumah ${houseLabel}` : ''}`, 360, 785)
  c.fillStyle = '#9c7a3f'
  c.font = '22px sans-serif'
  c.fillText('Kode cadangan (kalau QR tidak terbaca)', 360, 860)
  c.fillStyle = '#e6c98a'
  c.font = 'bold 56px monospace'
  c.fillText(code.split('').join(' '), 360, 925)
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal membuat gambar'))), 'image/png'))
}

export default function GuestQr({
  token,
  code,
  guestName,
  purpose,
  houseLabel,
  compact = false,
}: {
  token: string
  code: string
  guestName: string
  purpose: string
  houseLabel: string | null
  compact?: boolean
}) {
  const brand = useBranding()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    import('qrcode')
      .then((QR) => QR.toDataURL(guestQrUrl(token), { width: 512, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1a1305', light: '#ffffff' } }))
      .then((url) => {
        if (alive) setDataUrl(url)
      })
      .catch(() => setMsg('QR gagal dibuat. Gunakan kode 6 digit.'))
    return () => {
      alive = false
    }
  }, [token])

  const text = `Halo ${guestName}, ini undangan masuk ${brand.community_name}${houseLabel ? ` ke Rumah ${houseLabel}` : ''}. Tunjukkan QR ini ke Security di gerbang. Kode cadangan: ${code}`

  async function share() {
    if (!dataUrl) return
    setMsg('')
    try {
      const blob = await renderCard(dataUrl, guestName, code, houseLabel, purpose, brand.community_name, brand.accent_color)
      const file = new File([blob], `undangan-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: `Undangan Tamu ${brand.community_name}` })
        return
      }
      // Browser tanpa fitur bagikan file (mis. laptop): unduh gambar lalu buka WhatsApp dengan teks
      download(blob)
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      setMsg('Gambar QR sudah diunduh. Lampirkan gambar itu di WhatsApp.')
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') setMsg('Gagal membagikan. Coba tombol Simpan Gambar.')
    }
  }

  function download(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `undangan-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  async function save() {
    if (!dataUrl) return
    download(await renderCard(dataUrl, guestName, code, houseLabel, purpose, brand.community_name, brand.accent_color))
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${compact ? '' : 'rounded-2xl px-5 py-6'}`} style={compact ? undefined : { background: 'var(--brand-theme)' }}>
      {!compact ? <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>QR Undangan · {guestName}</span> : null}
      <div className="rounded-xl bg-white p-2.5" style={{ width: compact ? 180 : 230, height: compact ? 180 : 230 }}>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`QR undangan untuk ${guestName}`} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px]" style={{ color: '#9c7a3f' }}>Membuat QR...</div>
        )}
      </div>
      <div className="text-center">
        <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: compact ? '#9c7a3f' : '#b8ad92' }}>Kode cadangan</div>
        <div className="text-2xl font-bold tracking-[0.3em]" style={{ fontFamily: 'var(--font-fraunces), serif', color: compact ? '#1f1a10' : '#e6c98a' }}>{code}</div>
      </div>
      <div className="grid w-full max-w-xs grid-cols-2 gap-2">
        <button type="button" onClick={() => void share()} disabled={!dataUrl} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#1f7a45', color: '#ffffff' }}>
          Bagikan ke WA
        </button>
        <button type="button" onClick={() => void save()} disabled={!dataUrl} className="rounded-xl py-2.5 text-[13px] font-bold" style={compact ? { background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' } : { background: '#e6c98a', color: '#1a1305' }}>
          Simpan Gambar
        </button>
      </div>
      {msg ? <p className="text-center text-[12px] font-semibold" style={{ color: compact ? '#9c7a3f' : '#e6c98a' }}>{msg}</p> : null}
    </div>
  )
}