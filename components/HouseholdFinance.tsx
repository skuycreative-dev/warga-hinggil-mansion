'use client'

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  addHouseholdTransaction,
  updateHouseholdTransaction,
  deleteHouseholdTransaction,
  type HouseholdTxState,
  type HouseholdTxInput,
} from '@/app/keuangan-rumah/actions'

export type HouseholdTx = {
  id: string
  type: 'pemasukan' | 'pengeluaran'
  category: string
  amount: number
  description: string | null
  transaction_date: string
  author_name: string | null
}

const CATEGORY_SUGGESTIONS = {
  pemasukan: ['Gaji', 'Usaha', 'Bonus', 'Hadiah', 'Lainnya'],
  pengeluaran: ['Belanja Dapur', 'Listrik', 'Air', 'Internet & Pulsa', 'Pendidikan', 'Kesehatan', 'Transportasi', 'Iuran Warga', 'Cicilan', 'Lainnya'],
}

const initialState: HouseholdTxState = { error: '', success: false }

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

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function todayWib() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

function monthKey(date: string) {
  return date.slice(0, 7)
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function formatAmountInput(raw: string) {
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}

export default function HouseholdFinance({ transactions, houseLabel }: { transactions: HouseholdTx[]; houseLabel: string | null }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isSaving] = useActionState(addHouseholdTransaction, initialState)
  const [isPending, startTransition] = useTransition()
  const [newType, setNewType] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran')
  const [newAmount, setNewAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(monthKey(todayWib()))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<HouseholdTxInput & { amountText: string }>({
    type: 'pengeluaran',
    category: '',
    amount: 0,
    amountText: '',
    description: '',
    transactionDate: todayWib(),
  })
  const [rowError, setRowError] = useState('')

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setNewAmount('')
      router.refresh()
    }
  }, [state, router])

  const totals = useMemo(() => {
    const masuk = transactions.filter((t) => t.type === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0)
    const keluar = transactions.filter((t) => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0)
    return { masuk, keluar, saldo: masuk - keluar }
  }, [transactions])

  const months = useMemo(() => {
    const keys = new Set<string>([monthKey(todayWib())])
    transactions.forEach((t) => keys.add(monthKey(t.transaction_date)))
    return Array.from(keys).sort().reverse()
  }, [transactions])

  const monthly = useMemo(
    () =>
      months.slice(0, 6).map((key) => {
        const rows = transactions.filter((t) => monthKey(t.transaction_date) === key)
        const masuk = rows.filter((t) => t.type === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0)
        const keluar = rows.filter((t) => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0)
        return { key, masuk, keluar }
      }),
    [months, transactions]
  )

  const monthRows = transactions.filter((t) => monthKey(t.transaction_date) === selectedMonth)
  const current = monthly.find((m) => m.key === selectedMonth) ?? { masuk: 0, keluar: 0 }

  function startEdit(t: HouseholdTx) {
    setRowError('')
    setEditingId(t.id)
    setDraft({
      type: t.type,
      category: t.category,
      amount: Number(t.amount),
      amountText: Number(t.amount).toLocaleString('id-ID'),
      description: t.description ?? '',
      transactionDate: t.transaction_date,
    })
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const result = await updateHouseholdTransaction(id, {
        type: draft.type,
        category: draft.category,
        amount: Number(draft.amountText.replace(/[^0-9]/g, '')),
        description: draft.description,
        transactionDate: draft.transactionDate,
      })
      if (result.error) {
        setRowError(result.error)
        return
      }
      setEditingId(null)
      router.refresh()
    })
  }

  function remove(t: HouseholdTx) {
    if (!confirm(`Hapus ${t.category} ${rupiah(Number(t.amount))}?`)) return
    startTransition(async () => {
      const result = await deleteHouseholdTransaction(t.id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Saldo Rumah {houseLabel ?? ''}</div>
          <div className="mt-1 text-xl font-bold" style={{ color: totals.saldo >= 0 ? '#e6c98a' : '#f2b8b0' }}>{rupiah(totals.saldo)}</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Masuk {monthLabel(selectedMonth)}</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#2f6b4f' }}>{rupiah(current.masuk)}</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keluar {monthLabel(selectedMonth)}</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#b3392f' }}>{rupiah(current.keluar)}</div>
        </div>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl px-5 py-5"
        style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
      >
        <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Catat Transaksi</div>
        <div className="grid grid-cols-2 gap-2">
          {(['pengeluaran', 'pemasukan'] as const).map((type) => (
            <label
              key={type}
              className="cursor-pointer rounded-xl py-2.5 text-center text-[13px] font-bold"
              style={
                newType === type
                  ? { background: type === 'pemasukan' ? '#2f6b4f' : '#b3392f', color: '#ffffff' }
                  : { background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.12)' }
              }
            >
              <input
                type="radio"
                name="type"
                value={type}
                checked={newType === type}
                onChange={() => setNewType(type)}
                className="sr-only"
              />
              {type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Nominal (Rp)</label>
            <input
              name="amount"
              inputMode="numeric"
              required
              placeholder="150.000"
              value={newAmount}
              onChange={(e) => setNewAmount(formatAmountInput(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Tanggal</label>
            <input type="date" name="transaction_date" defaultValue={todayWib()} required style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Kategori</label>
            <input name="category" list={`kategori-${newType}`} required maxLength={40} placeholder="Pilih atau ketik" style={inputStyle} />
            <datalist id={`kategori-${newType}`}>
              {CATEGORY_SUGGESTIONS[newType].map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Keterangan (opsional)</label>
            <input name="description" maxLength={200} style={inputStyle} />
          </div>
        </div>
        {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: '#e6c98a', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Riwayat</span>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '7px 10px' }}>
            {months.map((key) => (
              <option key={key} value={key}>
                {monthLabel(key)}
              </option>
            ))}
          </select>
        </div>
        {rowError ? <p className="mb-2 text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{rowError}</p> : null}
        <div className="flex flex-col gap-2">
          {monthRows.length === 0 ? (
            <div className="rounded-2xl px-5 py-6 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
              Belum ada transaksi di bulan ini.
            </div>
          ) : (
            monthRows.map((t) =>
              editingId === t.id ? (
                <div key={t.id} className="grid grid-cols-1 gap-2 rounded-2xl px-4 py-4 sm:grid-cols-2" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={inputStyle}>
                    <option value="pengeluaran">Pengeluaran</option>
                    <option value="pemasukan">Pemasukan</option>
                  </select>
                  <input
                    value={draft.amountText}
                    inputMode="numeric"
                    onChange={(e) => setDraft({ ...draft, amountText: formatAmountInput(e.target.value) })}
                    style={inputStyle}
                  />
                  <input value={draft.category} maxLength={40} onChange={(e) => setDraft({ ...draft, category: e.target.value })} style={inputStyle} />
                  <input type="date" value={draft.transactionDate} onChange={(e) => setDraft({ ...draft, transactionDate: e.target.value })} style={inputStyle} />
                  <input
                    value={draft.description}
                    maxLength={200}
                    placeholder="Keterangan"
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    style={{ ...inputStyle, gridColumn: '1 / -1' }}
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                      style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveEdit(t.id)}
                      className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                      style={{ background: '#1a1305', color: '#e6c98a' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{t.category}</div>
                    <div className="truncate text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                      {new Date(`${t.transaction_date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {t.description ? ` · ${t.description}` : ''}
                      {t.author_name ? ` · oleh ${t.author_name}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[13.5px] font-bold" style={{ color: t.type === 'pemasukan' ? '#2f6b4f' : '#b3392f' }}>
                      {t.type === 'pemasukan' ? '+' : '-'}
                      {rupiah(Number(t.amount))}
                    </span>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => startEdit(t)} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                        Edit
                      </button>
                      <button type="button" disabled={isPending} onClick={() => remove(t)} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Ringkasan 6 Bulan</div>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                <th className="px-4 py-2.5 font-bold" style={{ color: '#9c7a3f' }}>Bulan</th>
                <th className="px-4 py-2.5 text-right font-bold" style={{ color: '#9c7a3f' }}>Masuk</th>
                <th className="px-4 py-2.5 text-right font-bold" style={{ color: '#9c7a3f' }}>Keluar</th>
                <th className="px-4 py-2.5 text-right font-bold" style={{ color: '#9c7a3f' }}>Selisih</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.key} style={{ borderBottom: '1px solid rgba(26,19,5,0.05)' }}>
                  <td className="px-4 py-2.5 font-bold" style={{ color: '#1f1a10' }}>{monthLabel(m.key)}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: '#2f6b4f' }}>{rupiah(m.masuk)}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: '#b3392f' }}>{rupiah(m.keluar)}</td>
                  <td className="px-4 py-2.5 text-right font-bold" style={{ color: m.masuk - m.keluar >= 0 ? '#1f1a10' : '#b3392f' }}>
                    {rupiah(m.masuk - m.keluar)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}