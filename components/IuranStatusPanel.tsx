'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createIuranPeriod, markIuranPaid, unmarkIuranPaid, type IuranPeriodState } from '@/app/anggaran/actions'

export type IuranRow = {
  id: string
  period: string
  amount_due: number
  status: string
  paid_at: string | null
  nomor_rumah: string
}

const initialState: IuranPeriodState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function periodLabel(period: string) {
  const [y, m] = period.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const paid = status === 'lunas'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
      style={paid ? { background: 'rgba(47,107,79,0.12)', color: '#2f6b4f' } : { background: 'rgba(179,57,47,0.1)', color: '#b3392f' }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {paid ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 8v5M12 16h.01" />}
      </svg>
      {paid ? 'Lunas' : 'Belum bayar'}
    </span>
  )
}

// canManage: Ketua/Bendahara/Superadmin (buat tagihan & tandai lunas). canSeeAll: pengurus lain (mis. Sekretaris) hanya melihat.
export default function IuranStatusPanel({
  rows,
  canManage,
  canSeeAll = false,
  houseLabel,
}: {
  rows: IuranRow[]
  canManage: boolean
  canSeeAll?: boolean
  houseLabel: string | null
}) {
  const router = useRouter()
  const [state, formAction, isCreating] = useActionState(createIuranPeriod, initialState)
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'semua' | 'belum' | 'lunas'>('semua')

  const periods = useMemo(() => Array.from(new Set(rows.map((r) => r.period))).sort().reverse(), [rows])
  const [period, setPeriod] = useState(periods[0] ?? '')

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state, router])

  useEffect(() => {
    if (!periods.includes(period)) setPeriod(periods[0] ?? '')
  }, [periods, period])

  function run(id: string, fn: () => Promise<{ error: string | null }>) {
    setBusyId(id)
    startTransition(async () => {
      const result = await fn()
      if (result.error) alert(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  // Tampilan warga: status iuran rumahnya sendiri
  if (!canManage && !canSeeAll) {
    const mine = rows.slice().sort((a, b) => b.period.localeCompare(a.period)).slice(0, 6)
    return (
      <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Status Iuran Rumah {houseLabel ?? ''}</div>
        {mine.length === 0 ? (
          <p className="text-[13px]" style={{ color: '#5b543f' }}>Belum ada tagihan iuran untuk rumahmu.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {mine.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5" style={{ background: '#faf7f0' }}>
                <div>
                  <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{periodLabel(r.period)}</div>
                  <div className="text-[11.5px]" style={{ color: '#5b543f' }}>{rupiah(Number(r.amount_due))}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const periodRows = rows.filter((r) => r.period === period).sort((a, b) => a.nomor_rumah.localeCompare(b.nomor_rumah, 'id', { numeric: true }))
  const paidRows = periodRows.filter((r) => r.status === 'lunas')
  const shown = filter === 'semua' ? periodRows : periodRows.filter((r) => (filter === 'lunas' ? r.status === 'lunas' : r.status !== 'lunas'))
  const collected = paidRows.reduce((sum, r) => sum + Number(r.amount_due), 0)

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
      <form action={formAction} className="flex flex-col gap-2.5 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
        <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Buat Tagihan Iuran Bulanan</div>
        <div className="grid grid-cols-2 gap-2.5">
          <input type="month" name="period" required style={inputStyle} />
          <input name="amount_due" inputMode="numeric" required placeholder="Nominal, mis. 100000" style={inputStyle} />
        </div>
        {state.error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
        {state.success && state.message ? <p className="text-[12px] font-semibold" style={{ color: '#2f6b4f' }}>{state.message}</p> : null}
        <button type="submit" disabled={isCreating} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#1a1305', color: '#e6c98a', opacity: isCreating ? 0.7 : 1 }}>
          {isCreating ? 'Membuat...' : 'Buat Tagihan untuk Semua Rumah'}
        </button>
      </form>
      ) : null}

      {periods.length === 0 ? (
        <div className="rounded-2xl px-5 py-6 text-center text-sm" style={{ background: '#ffffff', color: '#5b543f' }}>
          {canManage ? 'Belum ada tagihan iuran. Buat tagihan bulan pertama di atas.' : 'Belum ada tagihan iuran.'}
        </div>
      ) : (
        <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 10px' }}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {periodLabel(p)}
                </option>
              ))}
            </select>
            <div className="text-[12px] font-semibold" style={{ color: '#5b543f' }}>
              {paidRows.length}/{periodRows.length} rumah lunas · terkumpul {rupiah(collected)}
            </div>
          </div>

          <div className="mb-3 flex gap-1.5">
            {(['semua', 'belum', 'lunas'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="rounded-full px-3 py-1 text-[11.5px] font-bold"
                style={filter === f ? { background: '#1a1305', color: '#e6c98a' } : { background: '#faf7f0', color: '#5b543f' }}
              >
                {f === 'semua' ? 'Semua' : f === 'belum' ? 'Belum bayar' : 'Lunas'}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            {shown.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Rumah {r.nomor_rumah}</span>
                  <StatusBadge status={r.status} />
                </div>
                {!canManage ? null : r.status === 'lunas' ? (
                  <button
                    type="button"
                    disabled={isPending && busyId === r.id}
                    onClick={() => {
                      if (!confirm(`Batalkan status lunas Rumah ${r.nomor_rumah}? Pemasukan iuran yang tercatat otomatis juga akan dihapus.`)) return
                      run(r.id, () => unmarkIuranPaid(r.id))
                    }}
                    className="text-[11.5px] font-bold"
                    style={{ color: '#9c7a3f' }}
                  >
                    Batalkan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPending && busyId === r.id}
                    onClick={() => {
                      if (!confirm(`Tandai Rumah ${r.nomor_rumah} sudah bayar ${rupiah(Number(r.amount_due))}? Otomatis tercatat sebagai pemasukan kas.`)) return
                      run(r.id, () => markIuranPaid(r.id))
                    }}
                    className="rounded-lg px-3 py-1.5 text-[11.5px] font-bold"
                    style={{ background: '#1a1305', color: '#e6c98a' }}
                  >
                    {isPending && busyId === r.id ? 'Menyimpan...' : 'Tandai Lunas'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}