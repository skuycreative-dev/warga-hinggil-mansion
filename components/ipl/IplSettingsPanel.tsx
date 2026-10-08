'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveIplSettings, setHouseRate, type IplFormState } from '@/app/iuran-ipl/actions'
import type { IplHouseRate, IplSettings } from '@/lib/ipl'
import { cardStyle, formatAmountInput, inputStyle, labelStyle, parseAmount, rupiah } from '@/lib/format'

const initialState: IplFormState = { error: '', success: false }

export default function IplSettingsPanel({ settings, rates }: { settings: IplSettings; rates: IplHouseRate[] }) {
  const router = useRouter()
  const [state, formAction, isSaving] = useActionState(saveIplSettings, initialState)
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState(formatAmountInput(String(settings.default_amount || '')))
  const [fee, setFee] = useState(formatAmountInput(String(settings.late_fee || '')))
  const [editing, setEditing] = useState<string | null>(null)
  const [rateText, setRateText] = useState('')
  const [rateNote, setRateNote] = useState('')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state, router])

  function startEdit(r: IplHouseRate) {
    setError('')
    setEditing(r.house_id)
    setRateText(r.amount ? formatAmountInput(String(r.amount)) : '')
    setRateNote(r.note ?? '')
  }

  function saveRate(houseId: string, clear = false) {
    startTransition(async () => {
      const value = clear ? null : parseAmount(rateText)
      if (!clear && !value) {
        setError('Isi nominal khusus, atau pilih "Pakai standar".')
        return
      }
      const result = await setHouseRate(houseId, value, rateNote)
      if (result.error) {
        setError(result.error)
        return
      }
      setEditing(null)
      router.refresh()
    })
  }

  const custom = rates.filter((r) => r.amount)
  const shown = rates.filter((r) => !query || r.nomor_rumah.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
        <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Pengaturan IPL</div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="set-amount">Nominal standar / bulan</label>
            <input id="set-amount" name="default_amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(formatAmountInput(e.target.value))} placeholder="150.000" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="set-due">Jatuh tempo tiap tanggal</label>
            <input id="set-due" name="due_day" type="number" min={1} max={28} defaultValue={settings.due_day} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="set-fee">Denda telat (sekali per tagihan)</label>
            <input id="set-fee" name="late_fee" inputMode="numeric" value={fee} onChange={(e) => setFee(formatAmountInput(e.target.value))} placeholder="0" style={inputStyle} />
          </div>
        </div>
        {state.error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
        {state.success && state.message ? <p className="text-[12px] font-semibold" style={{ color: '#2f6b4f' }}>{state.message}</p> : null}
        <button type="submit" disabled={isSaving} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isSaving ? 0.7 : 1 }}>
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>

      <div className="rounded-2xl px-5 py-4" style={cardStyle}>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Nominal Khusus per Rumah</div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari rumah" aria-label="Cari rumah" style={{ ...inputStyle, width: '140px', padding: '6px 10px', fontSize: '12.5px' }} />
        </div>
        <p className="mb-3 text-[11.5px]" style={{ color: '#5b543f' }}>
          Untuk rumah dengan tarif berbeda (mis. hook / luas tanah lebih besar). {custom.length} rumah memakai nominal khusus; sisanya memakai nominal standar.
        </p>
        {error ? <p className="mb-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
        <div className="flex max-h-[420px] flex-col overflow-y-auto">
          {shown.map((r) =>
            editing === r.house_id ? (
              <div key={r.house_id} className="flex flex-col gap-2 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>Rumah {r.nomor_rumah}</span>
                <div className="grid grid-cols-2 gap-2">
                  <input inputMode="numeric" value={rateText} placeholder="Nominal khusus" onChange={(e) => setRateText(formatAmountInput(e.target.value))} style={inputStyle} />
                  <input value={rateNote} maxLength={120} placeholder="Alasan (opsional)" onChange={(e) => setRateNote(e.target.value)} style={inputStyle} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>Batal</button>
                  {r.amount ? (
                    <button type="button" disabled={isPending} onClick={() => saveRate(r.house_id, true)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#b3392f' }}>
                      Pakai standar
                    </button>
                  ) : null}
                  <button type="button" disabled={isPending} onClick={() => saveRate(r.house_id)} className="flex-1 rounded-lg py-1.5 text-[12px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              <div key={r.house_id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                <div>
                  <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>Rumah {r.nomor_rumah}</span>
                  <div className="text-[11.5px]" style={{ color: r.amount ? '#7a5a1f' : '#9c7a3f' }}>
                    {r.amount ? `Khusus ${rupiah(r.amount)}${r.note ? ` · ${r.note}` : ''}` : `Standar ${rupiah(parseAmount(amount))}`}
                  </div>
                </div>
                <button type="button" onClick={() => startEdit(r)} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                  Ubah
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}