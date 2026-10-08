'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import QrScanner from '@/components/tamu/QrScanner'
import { checkInGuestById, checkOutGuestById, lookupGuest, type GuestLookup } from '@/app/keamanan/scan-tamu/actions'

const PURPOSE_LABEL: Record<string, string> = {
  keluarga: 'Keluarga / Kerabat',
  kurir: 'Kurir / Ojek Online',
  tukang: 'Tukang / Jasa',
  delivery: 'Delivery / Pengantaran',
  lainnya: 'Lainnya',
}

// Wireframe screen 32: scan QR -> cek data tamu -> Tandai MASUK. Ada input manual 6 digit sebagai cadangan.
export default function ScanTamuPanel({ initialToken }: { initialToken: string | null }) {
  const router = useRouter()
  const [guest, setGuest] = useState<GuestLookup | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [manual, setManual] = useState('')
  const [isPending, startTransition] = useTransition()

  const lookup = useCallback((raw: string) => {
    setError('')
    setDone('')
    startTransition(async () => {
      const r = await lookupGuest(raw)
      if (r.error || !r.guest) {
        setGuest(null)
        setError(r.error ?? 'Tidak ditemukan.')
        return
      }
      setGuest(r.guest)
    })
  }, [])

  useEffect(() => {
    if (initialToken) lookup(initialToken)
  }, [initialToken, lookup])

  function act(kind: 'masuk' | 'keluar') {
    if (!guest) return
    startTransition(async () => {
      const r = kind === 'masuk' ? await checkInGuestById(guest.id) : await checkOutGuestById(guest.id)
      if (r.error) {
        setError(r.error)
        return
      }
      setDone(kind === 'masuk' ? `${guest.guest_name} tercatat MASUK.` : `${guest.guest_name} tercatat KELUAR.`)
      setGuest(null)
      setManual('')
      router.refresh()
    })
  }

  const statusInfo: Record<string, { label: string; color: string; bg: string }> = {
    menunggu: { label: '✓ QR VALID · Silakan masuk', color: '#2f6b4f', bg: 'rgba(47,107,79,0.1)' },
    masuk: { label: 'Tamu sedang di dalam', color: '#3b5b8a', bg: 'rgba(59,91,138,0.1)' },
    keluar: { label: 'Undangan sudah dipakai (tamu sudah keluar)', color: '#b3392f', bg: 'rgba(179,57,47,0.1)' },
    dibatalkan: { label: 'Undangan DIBATALKAN warga', color: '#b3392f', bg: 'rgba(179,57,47,0.1)' },
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Scan QR Tamu</div>
      <QrScanner onResult={lookup} paused={!!guest || isPending} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (manual.replace(/\D/g, '').length === 6) lookup(manual)
          else setError('Kode manual harus 6 digit.')
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          placeholder="Kode 6 digit"
          aria-label="Kode tamu 6 digit"
          className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-center text-lg font-bold tracking-[0.3em]"
          style={{ background: '#f2f1ec', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', outline: 'none' }}
        />
        <button type="submit" disabled={isPending} className="rounded-xl px-4 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
          Cek
        </button>
      </form>

      {isPending && !guest ? <p className="text-[12.5px] font-semibold" style={{ color: '#9c7a3f' }}>Mengecek...</p> : null}
      {error ? <p className="rounded-xl px-3 py-2.5 text-[13px] font-bold" style={{ background: 'rgba(179,57,47,0.1)', color: '#b3392f' }}>⚠ {error}</p> : null}
      {done ? <p className="rounded-xl px-3 py-2.5 text-[13px] font-bold" style={{ background: 'rgba(47,107,79,0.1)', color: '#2f6b4f' }}>{done}</p> : null}

      {guest ? (
        <div className="flex flex-col gap-3 rounded-2xl px-4 py-4" style={{ background: statusInfo[guest.status]?.bg ?? '#faf7f0', border: `1.5px solid ${statusInfo[guest.status]?.color ?? '#9c7a3f'}` }}>
          <div className="text-[14px] font-bold" style={{ color: statusInfo[guest.status]?.color }}>{statusInfo[guest.status]?.label ?? guest.status}</div>
          <table className="text-[13px]">
            <tbody>
              {[
                ['Tamu', guest.guest_name + (guest.guest_phone ? ` · ${guest.guest_phone}` : '')],
                ['Tujuan', `${guest.host_name ?? 'Warga'}${guest.nomor_rumah ? ` · Rumah ${guest.nomor_rumah}` : ''}`],
                ['Keperluan', PURPOSE_LABEL[guest.purpose] ?? guest.purpose],
                ['Dibuat', new Date(guest.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td className="w-24 py-0.5 pr-2 align-top font-bold" style={{ color: '#5b543f' }}>{k}</td>
                  <td className="py-0.5" style={{ color: '#1f1a10' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setGuest(null); setError('') }} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: '#ffffff', color: '#5b543f' }}>
              Batal
            </button>
            {guest.status === 'menunggu' ? (
              <button type="button" disabled={isPending} onClick={() => act('masuk')} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold" style={{ background: '#2f6b4f', color: '#ffffff' }}>
                {isPending ? 'Menyimpan...' : 'Tandai MASUK'}
              </button>
            ) : guest.status === 'masuk' ? (
              <button type="button" disabled={isPending} onClick={() => act('keluar')} className="flex-1 rounded-xl py-2.5 text-[14px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
                {isPending ? 'Menyimpan...' : 'Tandai KELUAR'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}