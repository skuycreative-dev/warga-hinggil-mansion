'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { triggerEmergency, resolveOwnEmergency, addReporterInfo } from '@/app/darurat/actions'
import AlertTimeline from '@/components/darurat/AlertTimeline'
import type { EmergencyEvent } from '@/lib/emergency'

type Alert = {
  id: string
  message: string | null
  status: string
  emergency_type: string
  created_at: string
  reporter_id: string
  house?: { nomor_rumah: string } | null
  reporter?: { full_name: string } | null
}

type Contact = {
  id: string
  name: string
  phone: string
  description: string | null
}

const CATEGORIES = [
  { value: 'kebakaran', label: 'Kebakaran', path: 'M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-3 1.5-4.5 2.5-6 .5 2 1.5 3 2.5 3 0-3-1-5 0-8Z' },
  { value: 'maling', label: 'Maling', path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6M8 7h8' },
  { value: 'perampokan', label: 'Perampokan', path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4ZM12 8v5M12 16h.01' },
  { value: 'kekerasan', label: 'Kekerasan', path: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z' },
  { value: 'medis', label: 'Darurat Medis', path: 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z' },
  { value: 'bencana', label: 'Bencana Alam', path: 'M3 20h18M5 20l4-8 3 5 2-3 5 6M12 4v3M6.5 6.5l2 2M17.5 6.5l-2 2' },
  { value: 'lainnya', label: 'Lainnya', path: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12h.01M12 12h.01M16 12h.01' },
]

const COUNTDOWN_SECONDS = 5

function typeLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`
}

export default function EmergencyPanel({
  alerts,
  canResolve,
  currentUserId,
  contacts,
  myEvents = {},
}: {
  alerts: Alert[]
  canResolve: boolean
  currentUserId: string
  contacts: Contact[]
  myEvents?: Record<string, EmergencyEvent[]>
}) {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'pilih' | 'countdown'>('idle')
  const [category, setCategory] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)
  const [error, setError] = useState('')
  const [justSent, setJustSent] = useState(false)
  const [isPending, startTransition] = useTransition()
  const sentRef = useRef(false)
  const [infoFor, setInfoFor] = useState<string | null>(null)
  const [infoText, setInfoText] = useState('')

  const openAlerts = alerts.filter((a) => a.status === 'aktif' || a.status === 'ditangani')
  const myOpenAlerts = openAlerts.filter((a) => a.reporter_id === currentUserId)

  function send(type: string) {
    if (sentRef.current) return
    sentRef.current = true
    const formData = new FormData()
    formData.set('emergency_type', type)
    formData.set('message', message)
    startTransition(async () => {
      const result = await triggerEmergency({ error: '', success: false }, formData)
      if (result.success) {
        setJustSent(true)
        setStep('idle')
        setCategory(null)
        setMessage('')
        router.refresh()
      } else {
        setError(result.error || 'Gagal mengirim alert. Coba lagi atau telepon nomor darurat di bawah.')
        setStep('pilih')
        sentRef.current = false
      }
    })
  }

  useEffect(() => {
    if (step !== 'countdown' || !category) return
    if (secondsLeft <= 0) {
      send(category)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, secondsLeft, category])

  function pickCategory(value: string) {
    setCategory(value)
    setSecondsLeft(COUNTDOWN_SECONDS)
    setError('')
    sentRef.current = false
    setStep('countdown')
  }

  function cancelCountdown() {
    if (isPending) return
    setStep('idle')
    setCategory(null)
    setSecondsLeft(COUNTDOWN_SECONDS)
  }

  function runAction(fn: (id: string) => Promise<{ error: string | null }>, id: string) {
    startTransition(async () => {
      const result = await fn(id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-7">
      {myOpenAlerts.length > 0 ? (
        <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(179,57,47,0.08)', border: '1px solid rgba(179,57,47,0.3)' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>
            Alert Darurat Kamu ({myOpenAlerts.length})
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {myOpenAlerts.map((a) => (
              <div key={a.id} className="rounded-xl px-3.5 py-2.5" style={{ background: '#ffffff' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{typeLabel(a.emergency_type)}</div>
                  <div className="text-[11.5px] font-semibold" style={{ color: a.status === 'ditangani' ? '#2f6b4f' : '#9c7a3f' }}>
                    {a.status === 'ditangani' ? 'Sedang ditangani Security / Pengurus' : 'Terkirim, menunggu respon'} · {timeAgo(a.created_at)}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm(`Reset alert ${typeLabel(a.emergency_type)}? Tekan OK kalau kamu sudah aman atau alert ini tidak sengaja terkirim.`)) return
                    runAction(resolveOwnEmergency, a.id)
                  }}
                  className="flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
                >
                  Saya Sudah Aman
                </button>
              </div>
              <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.08)' }}>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Response Log</div>
                <AlertTimeline events={myEvents[a.id] ?? []} showInternalBadge={false} />
                {infoFor === a.id ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <textarea
                      value={infoText}
                      maxLength={500}
                      rows={2}
                      onChange={(e) => setInfoText(e.target.value)}
                      placeholder="mis. pelaku 2 orang, motor merah, ke arah utara"
                      className="w-full rounded-lg px-3 py-2 text-[13px]"
                      style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setInfoFor(null)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isPending || !infoText.trim()}
                        onClick={() =>
                          startTransition(async () => {
                            const r = await addReporterInfo(a.id, infoText)
                            if (r.error) {
                              alert(r.error)
                              return
                            }
                            setInfoText('')
                            setInfoFor(null)
                            router.refresh()
                          })
                        }
                        className="flex-1 rounded-lg py-1.5 text-[12px] font-bold"
                        style={{ background: '#b3392f', color: '#fff' }}
                      >
                        Kirim ke Petugas
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => { setInfoFor(a.id); setInfoText('') }} className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>
                    + Tambah info untuk petugas
                  </button>
                )}
              </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] font-medium" style={{ color: '#5b543f' }}>
            Ada keadaan darurat lain? Tombol di bawah tetap bisa ditekan lagi.
          </p>
        </div>
      ) : null}

      {step === 'idle' ? (
        <div className="flex flex-col items-center">
          {justSent ? (
            <p className="mb-3 text-center text-sm font-bold" style={{ color: '#2f6b4f' }}>Alert terkirim ke seluruh warga, Security, dan Pengurus.</p>
          ) : null}
          <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full"
              style={{ background: 'rgba(179,57,47,0.22)', animationDuration: '2.2s' }}
            />
            <span aria-hidden className="absolute rounded-full" style={{ inset: 12, background: 'rgba(179,57,47,0.14)' }} />
            <button
              type="button"
              aria-label="Tombol darurat. Tekan untuk memilih jenis darurat"
              onClick={() => {
                setJustSent(false)
                setError('')
                setStep('pilih')
              }}
              className="relative flex flex-col items-center justify-center gap-1 rounded-full transition active:scale-95"
              style={{
                width: 184,
                height: 184,
                border: '6px solid #ffffff',
                background: 'radial-gradient(circle at 35% 30%, #e25a4d 0%, #b3392f 55%, #7c2118 100%)',
                boxShadow: '0 16px 36px rgba(179,57,47,0.45), inset 0 -10px 18px rgba(0,0,0,0.25), inset 0 8px 14px rgba(255,255,255,0.25)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <span className="text-xl font-bold tracking-wider text-white">DARURAT</span>
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Tekan
              </span>
            </button>
          </div>
          <p className="mt-2 text-center text-[12.5px] font-semibold" style={{ color: '#5b543f' }}>
            Pilih jenis darurat, lalu ada 5 detik untuk membatalkan.
          </p>
        </div>
      ) : step === 'pilih' ? (
        <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.3)' }}>
          <p className="mb-3 text-sm font-bold" style={{ color: '#b3392f' }}>Apa yang terjadi?</p>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => pickCategory(c.value)}
                className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition hover:-translate-y-0.5"
                style={{ background: '#faf7f0', border: '1px solid rgba(179,57,47,0.25)' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b3392f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={c.path} />
                </svg>
                <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{c.label}</span>
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Keterangan singkat (opsional), isi dulu sebelum memilih jenis darurat"
            rows={2}
            maxLength={300}
            className="mt-3 w-full"
            style={{
              background: '#faf7f0',
              border: '1px solid rgba(26,19,5,0.12)',
              borderRadius: '11px',
              padding: '11px 13px',
              color: '#1f1a10',
              fontSize: '13.5px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          {error ? (
            <p className="mt-2 text-[13px] font-bold" style={{ color: '#b3392f' }}>{error}</p>
          ) : null}
          <button
            type="button"
            onClick={() => setStep('idle')}
            className="mt-3 w-full rounded-xl py-3 text-sm font-bold"
            style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
          >
            Batal
          </button>
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-6 text-center" style={{ background: '#b3392f' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {category ? typeLabel(category) : ''}
          </div>
          <div
            className="mx-auto my-4 flex h-28 w-28 items-center justify-center rounded-full text-5xl font-bold text-white"
            style={{ border: '4px solid rgba(255,255,255,0.85)' }}
          >
            {isPending ? '...' : Math.max(secondsLeft, 0)}
          </div>
          <p className="text-sm font-bold text-white">
            {isPending ? 'Mengirim alert...' : `Alert akan dikirim dalam ${Math.max(secondsLeft, 0)} detik`}
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={cancelCountdown}
              className="w-full rounded-xl py-3.5 text-base font-bold"
              style={{ background: '#ffffff', color: '#b3392f', opacity: isPending ? 0.6 : 1 }}
            >
              BATALKAN
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => category && send(category)}
              className="w-full rounded-xl py-2.5 text-[13px] font-bold"
              style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)' }}
            >
              Kirim Sekarang
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Nomor Darurat
        </div>
        {contacts.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {contacts.map((c) => (
              <a
                key={c.id}
                href={telHref(c.phone)}
                className="flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{c.name}</div>
                  {c.description ? (
                    <div className="text-[12px] font-medium" style={{ color: '#9c7a3f' }}>{c.description}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ background: '#1a1305' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                  <span className="text-[13px] font-bold" style={{ color: 'var(--brand-accent)' }}>{c.phone}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#5b543f' }}>Nomor darurat belum diisi pengurus.</p>
        )}
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Darurat Aktif di Perumahan ({openAlerts.length})
        </div>
        {openAlerts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {openAlerts.map((a) => (
              <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.25)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white"
                        style={{ background: '#b3392f' }}
                      >
                        {typeLabel(a.emergency_type)}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                        style={{
                          background: a.status === 'ditangani' ? 'rgba(47,107,79,0.12)' : 'rgba(212,175,106,0.18)',
                          color: a.status === 'ditangani' ? '#2f6b4f' : '#9c7a3f',
                        }}
                      >
                        {a.status === 'ditangani' ? 'Sedang ditangani' : 'Menunggu respon'}
                      </span>
                    </div>
                    <div className="mt-1.5 text-sm font-bold" style={{ color: '#1f1a10' }}>
                      {a.reporter?.full_name ?? 'Warga'}
                      {a.house?.nomor_rumah ? ` · Rumah ${a.house.nomor_rumah}` : ''}
                    </div>
                    {a.message ? <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>{a.message}</p> : null}
                    <span className="mt-1 block text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(a.created_at)}</span>
                  </div>
                  {canResolve ? (
                    <Link
                      href={`/keamanan/darurat/${a.id}`}
                      className="flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
                      style={{ background: '#b3392f' }}
                    >
                      {a.status === 'aktif' ? 'Tangani' : 'Detail'}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada darurat aktif saat ini.</p>
        )}
      </div>
    </div>
  )
}