'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addTeamEvent, closeAlert, escalateAlert, takeAlert } from '@/app/keamanan/darurat/actions'
import { RESOLUTION_LABEL } from '@/lib/emergency'
import { inputStyle } from '@/lib/format'

// Tombol aksi petugas: ambil, menuju, tiba, eskalasi, tutup dengan kategori.
export default function AlertActions({
  alertId,
  status,
  handledByMe,
  handledByName,
  escalated,
  compact = false,
}: {
  alertId: string
  status: string
  handledByMe: boolean
  handledByName: string | null
  escalated: boolean
  compact?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'none' | 'close' | 'escalate'>('none')
  const [resolution, setResolution] = useState('asli')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    setError('')
    startTransition(async () => {
      const result = await fn()
      if (result.error) {
        setError(result.error)
        return
      }
      after?.()
      router.refresh()
    })
  }

  if (status === 'selesai') return null

  if (compact) {
    return status === 'aktif' ? (
      <button type="button" disabled={isPending} onClick={() => run(() => takeAlert(alertId))} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-white" style={{ background: '#b3392f' }}>
        {isPending ? 'Mengambil...' : '✋ Ambil Alert'}
      </button>
    ) : null
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-2">
        {status === 'aktif' || !handledByMe ? (
          <button type="button" disabled={isPending} onClick={() => run(() => takeAlert(alertId))} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold text-white" style={{ background: '#b3392f' }}>
            {status === 'aktif' ? '✋ Ambil Alert' : `Ambil alih${handledByName ? ` dari ${handledByName}` : ''}`}
          </button>
        ) : null}
        {status === 'ditangani' ? (
          <>
            <button type="button" disabled={isPending} onClick={() => run(() => addTeamEvent(alertId, 'menuju', ''))} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#eef2f8', color: '#3b5b8a' }}>
              Menuju lokasi
            </button>
            <button type="button" disabled={isPending} onClick={() => run(() => addTeamEvent(alertId, 'tiba', ''))} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#eef2f8', color: '#3b5b8a' }}>
              Tiba di lokasi
            </button>
          </>
        ) : null}
        <button type="button" onClick={() => setMode(mode === 'escalate' ? 'none' : 'escalate')} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#fdf1ef', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
          ⬆ Eskalasi{escalated ? ' lagi' : ''}
        </button>
        <button type="button" onClick={() => setMode(mode === 'close' ? 'none' : 'close')} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
          ✓ Tandai Selesai
        </button>
      </div>

      {mode === 'escalate' ? (
        <div className="flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: '#fdf1ef' }}>
          <p className="text-[12px]" style={{ color: '#5b543f' }}>Notifikasi prioritas dikirim ke Ketua Paguyuban & Superadmin.</p>
          <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Butuh bantuan apa? (mis. perlu tambahan personel)" style={{ ...inputStyle, background: '#fff' }} />
          <button type="button" disabled={isPending} onClick={() => run(() => escalateAlert(alertId, note), () => { setMode('none'); setNote('') })} className="rounded-lg py-2 text-[12.5px] font-bold text-white" style={{ background: '#b3392f' }}>
            Kirim Eskalasi
          </button>
        </div>
      ) : null}

      {mode === 'close' ? (
        <div className="flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: '#faf7f0', border: '1px solid rgba(212,175,106,0.45)' }}>
          <div className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>Kategori penutupan</div>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
            {(['asli', 'alarm_palsu', 'polisi'] as const).map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold" style={resolution === r ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#fff', color: '#3d3727' }}>
                <input type="radio" name={`res-${alertId}`} value={r} checked={resolution === r} onChange={() => setResolution(r)} className="sr-only" />
                {RESOLUTION_LABEL[r]}
              </label>
            ))}
          </div>
          <textarea value={note} maxLength={1000} rows={2} onChange={(e) => setNote(e.target.value)} placeholder="Ringkasan penanganan untuk laporan (opsional)" style={{ ...inputStyle, background: '#fff' }} />
          <button type="button" disabled={isPending} onClick={() => run(() => closeAlert(alertId, resolution, note), () => { setMode('none'); setNote('') })} className="rounded-lg py-2 text-[12.5px] font-bold" style={{ background: '#2f6b4f', color: '#fff' }}>
            {isPending ? 'Menyimpan...' : 'Tutup Alert'}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </div>
  )
}