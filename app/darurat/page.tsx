'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { kirimDarurat, type DaruratState } from './actions'
import { createClient } from '@/lib/supabase/client'

const initialState: DaruratState = { error: '', success: false }

const categories = [
  { value: 'kebakaran', label: 'Kebakaran', desc: 'Api / kompor / listrik', emoji: '🔥' },
  { value: 'keamanan', label: 'Maling / Rampok', desc: 'Orang tak dikenal', emoji: '🚨' },
  { value: 'kekerasan', label: 'Kekerasan', desc: 'KDRT / perkelahian', emoji: '✊' },
  { value: 'medis', label: 'Medis', desc: 'Sakit / kecelakaan', emoji: '🏥' },
  { value: 'bencana', label: 'Bencana', desc: 'Banjir / gempa / lain', emoji: '⚠️' },
  { value: 'lainnya', label: 'Lainnya', desc: 'Butuh bantuan segera', emoji: '🆘', light: true },
]

type EmergencyContact = {
  id: string
  name: string
  phone: string
  description: string | null
}

export default function DaruratPage() {
  const [state, formAction, isPending] = useActionState(kirimDarurat, initialState)
  const [phase, setPhase] = useState<'grid' | 'confirm' | 'result'>('grid')
  const [selected, setSelected] = useState<(typeof categories)[number] | null>(null)
  const [countdown, setCountdown] = useState(5)
  const [description, setDescription] = useState('')
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('emergency_contacts')
      .select('id, name, phone, description')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setContacts(data as EmergencyContact[])
      })
  }, [])

  useEffect(() => {
    if (phase !== 'confirm') return
    if (countdown <= 0) {
      const fd = new FormData()
      fd.set('emergency_type', selected?.value ?? 'lainnya')
      fd.set('description', description)
      formAction(fd)
      setPhase('result')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, countdown, selected, description, formAction])

  function pickCategory(cat: (typeof categories)[number]) {
    setSelected(cat)
    setCountdown(5)
    setPhase('confirm')
  }

  function batalkan() {
    setSelected(null)
    setPhase('grid')
  }

  return (
    <main className="w-full" style={{ background: '#fdeeee', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-lg px-6 py-8 md:px-10">
        {phase !== 'confirm' && phase !== 'result' ? (
          <>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-bold"
              style={{ color: '#7a2a20' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Kembali
            </Link>

            <h1 className="mt-4 text-2xl font-bold" style={{ color: '#7a1f16' }}>
              🚨 Panel Darurat
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: '#a54a3e' }}>
              Pilih kategori — bantuan langsung dikirim
            </p>

            <div
              className="mt-4 flex gap-2.5 rounded-xl px-4 py-3.5"
              style={{ background: '#ffffff', border: '1px solid rgba(122,31,22,0.15)' }}
            >
              <span className="text-lg">⚠️</span>
              <p className="text-[12.5px] font-semibold leading-snug" style={{ color: '#5c1f16' }}>
                Hanya untuk kondisi darurat asli. Lokasi & identitasmu otomatis dikirim ke Security dan warga terdekat.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => pickCategory(cat)}
                  className="flex flex-col items-start gap-2 rounded-2xl px-4 py-5 text-left"
                  style={
                    cat.light
                      ? { background: '#ffffff', border: '2px solid #d6423a', color: '#b3392f' }
                      : { background: 'linear-gradient(160deg, #b3392f 0%, #7a1f16 100%)', color: '#ffffff', border: 'none' }
                  }
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-[15px] font-bold">{cat.label}</span>
                  <span className="text-[11.5px] font-medium opacity-90">{cat.desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: '#7a2a20' }}>
                📞 Telepon Langsung
              </div>
              <div className="flex flex-col gap-2">
                {contacts.map((c) => (
                  <a
                    key={c.id}
                    href={`tel:${c.phone}`}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5"
                    style={{ background: '#ffffff', border: '1px solid rgba(122,31,22,0.12)' }}
                  >
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                        {c.name}
                      </div>
                      <div className="text-[11.5px] font-medium" style={{ color: '#8a8c96' }}>
                        {c.phone}{c.description ? ` · ${c.description}` : ''}
                      </div>
                    </div>
                    <span className="text-lg">📞</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {phase === 'confirm' && selected ? (
          <div
            className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl px-6 py-10 text-center"
            style={{ background: 'linear-gradient(160deg, #b3392f 0%, #7a1f16 100%)', color: '#ffffff' }}
          >
            <span className="text-3xl">{selected.emoji}</span>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest opacity-80">
              Mengirim Laporan Darurat
            </p>
            <h2 className="mt-1 text-2xl font-bold">{selected.label}</h2>

            <div
              className="mt-7 flex h-32 w-32 items-center justify-center rounded-full"
              style={{ border: '3px solid rgba(255,255,255,0.35)' }}
            >
              <div>
                <div className="text-4xl font-bold">{countdown}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Detik Lagi</div>
              </div>
            </div>

            <p className="mt-6 max-w-xs text-sm font-medium opacity-90">
              Bantuan akan otomatis dikirim dalam {countdown} detik. Ketuk Batal kalau salah pencet.
            </p>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Info tambahan (opsional)"
              className="mt-5 w-full rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff' }}
            />

            <button
              type="button"
              onClick={batalkan}
              className="mt-6 rounded-xl px-10 py-3 text-sm font-bold"
              style={{ background: '#ffffff', color: '#7a1f16' }}
            >
              Batal
            </button>
          </div>
        ) : null}

        {phase === 'result' ? (
          <div
            className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl px-6 py-10 text-center"
            style={{ background: '#ffffff', border: '1px solid rgba(122,31,22,0.15)' }}
          >
            {isPending ? (
              <p className="text-sm font-bold" style={{ color: '#7a1f16' }}>
                Mengirim laporan...
              </p>
            ) : state.success ? (
              <>
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: 'rgba(179,57,47,0.12)' }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b3392f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold" style={{ color: '#1f1a10' }}>
                  Laporan Darurat Terkirim
                </h2>
                <p className="mt-2 max-w-xs text-sm font-medium" style={{ color: '#5b543f' }}>
                  Tim keamanan dan warga terdekat sudah diberi tahu. Tetap tenang dan ikuti instruksi keamanan.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-block rounded-xl px-8 py-3 text-sm font-bold"
                  style={{ background: '#1a1305', color: '#f5f3ee' }}
                >
                  Kembali ke Beranda
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-bold" style={{ color: '#b3392f' }}>
                  {state.error || 'Gagal mengirim laporan.'}
                </p>
                <button
                  type="button"
                  onClick={() => setPhase('grid')}
                  className="mt-5 rounded-xl px-8 py-3 text-sm font-bold"
                  style={{ background: '#1a1305', color: '#f5f3ee' }}
                >
                  Coba Lagi
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </main>
  )
}
