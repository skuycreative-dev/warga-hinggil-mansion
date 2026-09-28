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
import type { HhAccount } from '@/lib/household-finance'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'

export type HouseholdTx = {
  id: string
  type: 'pemasukan' | 'pengeluaran' | 'transfer'
  account_id: string | null
  to_account_id: string | null
  debt_id: string | null
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

type TxType = 'pemasukan' | 'pengeluaran' | 'transfer'

const TYPE_LABEL: Record<TxType, string> = { pengeluaran: 'Pengeluaran', pemasukan: 'Pemasukan', transfer: 'Transfer' }
const TYPE_COLOR: Record<TxType, string> = { pengeluaran: '#b3392f', pemasukan: '#2f6b4f', transfer: '#3b5b8a' }

export default function HouseholdFinance({
  transactions,
  houseLabel,
  accounts,
  totalBalance,
}: {
  transactions: HouseholdTx[]
  houseLabel: string | null
  accounts: HhAccount[]
  totalBalance: number
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isSaving] = useActionState(addHouseholdTransaction, initialState)
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()
  const [newType, setNewType] = useState<TxType>('pengeluaran')
  const [newAmount, setNewAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(monthKey(todayWib()))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<HouseholdTxInput & { amountText: string; locked: boolean }>({
    type: 'pengeluaran',
    category: '',
    amount: 0,
    amountText: '',
    description: '',
    transactionDate: todayWib(),
    accountId: '',
    toAccountId: '',
    locked: false,
  })

  const activeAccounts = accounts.filter((a) => !a.is_archived)
  const accountName = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts])
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
    return { masuk, keluar, saldo: totalBalance }
  }, [transactions, totalBalance])

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
      accountId: t.account_id ?? '',
      toAccountId: t.to_account_id ?? '',
      locked: !!t.debt_id || t.type === 'transfer',
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
        accountId: draft.accountId,
        toAccountId: draft.toAccountId,
      })
      if (result.error) {
        setRowError(result.error)
        return
      }
      setEditingId(null)
      router.refresh()
    })
  }

  async function remove(t: HouseholdTx) {
    const extra = t.debt_id ? ' Pembayaran hutang/piutang ini juga akan dibatalkan.' : ''
    if (!(await confirmModal(`Hapus ${t.category} ${rupiah(Number(t.amount))}?${extra}`, { danger: true }))) return
    startTransition(async () => {
      const result = await deleteHouseholdTransaction(t.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Saldo Rumah {houseLabel ?? ''}</div>
          <div className="mt-1 text-xl font-bold" style={{ color: totals.saldo >= 0 ? 'var(--brand-accent)' : '#f2b8b0' }}>{rupiah(totals.saldo)}</div>
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
        <div className="grid grid-cols-3 gap-2">
          {(['pengeluaran', 'pemasukan', 'transfer'] as const).map((type) => (
            <label
              key={type}
              className="cursor-pointer rounded-xl py-2.5 text-center text-[13px] font-bold"
              style={
                newType === type
                  ? { background: TYPE_COLOR[type], color: '#ffffff' }
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
              {TYPE_LABEL[type]}
            </label>
          ))}
        </div>
        {newType === 'transfer' && activeAccounts.length < 2 ? (
          <p className="rounded-xl px-3 py-2.5 text-[12px] font-semibold" style={{ background: '#faf7f0', color: '#7a5a1f' }}>
            Transfer butuh minimal 2 rekening. Tambahkan rekening di tab Rekening &amp; Pos Tujuan.
          </p>
        ) : null}
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
            <label style={labelStyle}>{newType === 'transfer' ? 'Dari rekening' : newType === 'pemasukan' ? 'Masuk ke rekening' : 'Dibayar dari rekening'}</label>
            <select name="account_id" required={newType === 'transfer'} defaultValue="" key={`acc-${newType}`} style={inputStyle}>
              <option value="">{newType === 'transfer' ? 'Pilih rekening' : 'Tanpa rekening'}</option>
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {newType === 'transfer' ? (
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Ke rekening</label>
              <select name="to_account_id" required defaultValue="" style={inputStyle}>
                <option value="">Pilih rekening</option>
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Kategori</label>
              <input name="category" list={`kategori-${newType}`} required maxLength={40} placeholder="Pilih atau ketik" style={inputStyle} />
              <datalist id={`kategori-${newType}`}>
                {CATEGORY_SUGGESTIONS[newType].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          )}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label style={labelStyle}>Keterangan (opsional)</label>
            <input name="description" maxLength={200} style={inputStyle} />
          </div>
        </div>
        {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isSaving ? 0.7 : 1 }}
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
                  {draft.locked ? (
                    <div className="flex items-center rounded-[10px] px-3 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: TYPE_COLOR[draft.type as TxType] }}>
                      {TYPE_LABEL[draft.type as TxType]}
                      {t.debt_id ? ' · hutang/piutang' : ''}
                    </div>
                  ) : (
                    <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={inputStyle}>
                      <option value="pengeluaran">Pengeluaran</option>
                      <option value="pemasukan">Pemasukan</option>
                    </select>
                  )}
                  <input
                    value={draft.amountText}
                    inputMode="numeric"
                    onChange={(e) => setDraft({ ...draft, amountText: formatAmountInput(e.target.value) })}
                    style={inputStyle}
                  />
                  <select value={draft.accountId ?? ''} onChange={(e) => setDraft({ ...draft, accountId: e.target.value })} aria-label="Rekening" style={inputStyle}>
                    {draft.type === 'transfer' ? null : <option value="">Tanpa rekening</option>}
                    {accounts
                      .filter((a) => !a.is_archived || a.id === draft.accountId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {draft.type === 'transfer' ? `Dari: ${a.name}` : a.name}
                        </option>
                      ))}
                  </select>
                  {draft.type === 'transfer' ? (
                    <select value={draft.toAccountId ?? ''} onChange={(e) => setDraft({ ...draft, toAccountId: e.target.value })} aria-label="Ke rekening" style={inputStyle}>
                      {accounts
                        .filter((a) => !a.is_archived || a.id === draft.toAccountId)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            Ke: {a.name}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <input value={draft.category} maxLength={40} onChange={(e) => setDraft({ ...draft, category: e.target.value })} style={inputStyle} />
                  )}
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
                      style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ) : (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>
                      {t.type === 'transfer'
                        ? `${accountName.get(t.account_id ?? '') ?? '?'} → ${accountName.get(t.to_account_id ?? '') ?? '?'}`
                        : t.category}
                      {t.debt_id ? (
                        <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(59,91,138,0.12)', color: '#3b5b8a' }}>
                          {t.type === 'pengeluaran' ? 'cicilan' : 'piutang'}
                        </span>
                      ) : null}
                    </div>
                    <div className="truncate text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                      {new Date(`${t.transaction_date}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {t.type !== 'transfer' && t.account_id ? ` · ${accountName.get(t.account_id) ?? ''}` : ''}
                      {t.description ? ` · ${t.description}` : ''}
                      {t.author_name ? ` · oleh ${t.author_name}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[13.5px] font-bold" style={{ color: TYPE_COLOR[t.type] }}>
                      {t.type === 'pemasukan' ? '+' : t.type === 'pengeluaran' ? '-' : '⇄ '}
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