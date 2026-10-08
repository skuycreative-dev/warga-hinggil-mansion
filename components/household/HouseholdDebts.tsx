'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteDebt, deleteHouseholdTransaction, payDebt, saveDebt, type HhFormState } from '@/app/keuangan-rumah/actions'
import { daysUntil, debtRatio, nextDueDate, paidForDue, type HhAccount, type HhDebt } from '@/lib/household-finance'
import { cardStyle, dateLabel, formatAmountInput, inputStyle, labelStyle, parseAmount, rupiah, todayWib } from '@/lib/format'
import { useConfirm } from '@/components/ModalProvider'

const initialState: HhFormState = { error: '', success: false }

export type DebtPayment = { id: string; debt_id: string; amount: number; transaction_date: string; account_name: string | null }

const LEVEL: Record<string, { label: string; color: string; bg: string; text: string }> = {
  aman: { label: 'Aman', color: '#2f6b4f', bg: 'rgba(47,107,79,0.1)', text: 'Cicilan masih dalam batas sehat (maks. 30% pemasukan).' },
  waspada: { label: 'Waspada', color: '#7a5a1f', bg: 'rgba(212,175,106,0.2)', text: 'Cicilan 30-40% pemasukan. Tunda hutang baru dan perkuat dana darurat.' },
  berat: { label: 'Berat', color: '#b3392f', bg: 'rgba(179,57,47,0.1)', text: 'Cicilan di atas 40% pemasukan. Pertimbangkan pelunasan dipercepat atau restrukturisasi.' },
  tidak_diketahui: { label: 'Belum bisa dihitung', color: '#5b543f', bg: '#faf7f0', text: 'Catat pemasukan bulanan dulu supaya rasio cicilan bisa dihitung.' },
}

export default function HouseholdDebts({
  debts,
  payments,
  accounts,
  avgMonthlyIncome,
}: {
  debts: HhDebt[]
  payments: DebtPayment[]
  accounts: HhAccount[]
  avgMonthlyIncome: number
}) {
  const router = useRouter()
  const today = todayWib()
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const [state, formAction, isSaving] = useActionState(saveDebt, initialState)
  const [form, setForm] = useState<{ open: boolean; debt: HhDebt | null; direction: 'hutang' | 'piutang' }>({ open: false, debt: null, direction: 'hutang' })
  const [principal, setPrincipal] = useState('')
  const [installment, setInstallment] = useState('')
  const [pay, setPay] = useState<{ debtId: string; amount: string; date: string; accountId: string; note: string } | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (state.success) {
      setForm((f) => ({ ...f, open: false, debt: null }))
      router.refresh()
    }
  }, [state, router])

  const active = debts.filter((d) => d.status === 'aktif')
  const hutang = active.filter((d) => d.direction === 'hutang')
  const piutang = active.filter((d) => d.direction === 'piutang')
  const totalHutang = hutang.reduce((s, d) => s + d.remaining, 0)
  const totalPiutang = piutang.reduce((s, d) => s + d.remaining, 0)
  const monthlyInstallments = hutang.reduce((s, d) => s + Math.min(d.installment_amount ?? 0, d.remaining), 0)
  const ratio = debtRatio(monthlyInstallments, avgMonthlyIncome)
  const level = LEVEL[ratio.level]
  const doneCount = debts.length - active.length
  const shown = debts.filter((d) => showDone || d.status === 'aktif')
  const activeAccounts = accounts.filter((a) => !a.is_archived)

  function openForm(debt: HhDebt | null, direction: 'hutang' | 'piutang') {
    setPrincipal(debt ? formatAmountInput(String(debt.principal)) : '')
    setInstallment(debt?.installment_amount ? formatAmountInput(String(debt.installment_amount)) : '')
    setForm({ open: true, debt, direction: debt?.direction ?? direction })
  }

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

  async function submitPay(d: HhDebt) {
    if (!pay) return
    const amount = parseAmount(pay.amount)
    if (amount > d.remaining && !(await confirmModal(`Nominal melebihi sisa ${rupiah(d.remaining)}. Tetap simpan?`))) return
    run(() => payDebt(d.id, amount, pay.date, pay.accountId, pay.note), () => setPay(null))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl px-5 py-4" style={{ background: 'var(--brand-theme)' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Sisa Hutang</div>
          <div className="mt-1 text-xl font-bold" style={{ color: '#f2b8b0' }}>{rupiah(totalHutang)}</div>
          <div className="text-[11px]" style={{ color: '#9c7a3f' }}>{hutang.length} hutang aktif</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Piutang (uang di orang lain)</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#2f6b4f' }}>{rupiah(totalPiutang)}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>{piutang.length} piutang aktif</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Cicilan / Bulan</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#1f1a10' }}>{rupiah(monthlyInstallments)}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>Rata-rata pemasukan {rupiah(avgMonthlyIncome)}</div>
        </div>
      </div>

      <div className="rounded-2xl px-5 py-4" style={{ background: level.bg, border: `1px solid ${level.color}33` }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>Rasio cicilan terhadap pemasukan</span>
          <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: '#ffffff', color: level.color }}>
            {ratio.ratio === null ? level.label : `${Math.round(ratio.ratio * 100)}% · ${level.label}`}
          </span>
        </div>
        {ratio.ratio !== null && monthlyInstallments > 0 ? (
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: '#ffffff' }} aria-hidden>
            <div className="h-full rounded-full" style={{ width: `${Math.min(ratio.ratio, 1) * 100}%`, background: level.color }} />
          </div>
        ) : null}
        <p className="mt-2 text-[12px]" style={{ color: '#5b543f' }}>
          {level.text} Pemasukan dihitung dari rata-rata 3 bulan terakhir (tanpa transfer & penerimaan piutang).
        </p>
      </div>

      {error ? <p className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Daftar</span>
        <div className="flex flex-wrap items-center gap-2">
          {doneCount > 0 ? (
            <button type="button" onClick={() => setShowDone(!showDone)} className="text-[11.5px] font-bold" style={{ color: '#5b543f' }}>
              {showDone ? 'Sembunyikan yang lunas' : `Lihat yang lunas (${doneCount})`}
            </button>
          ) : null}
          <button type="button" onClick={() => openForm(null, 'hutang')} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
            + Hutang / Cicilan
          </button>
          <button type="button" onClick={() => openForm(null, 'piutang')} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#ffffff', color: '#2f6b4f', border: '1px solid rgba(47,107,79,0.3)' }}>
            + Piutang
          </button>
        </div>
      </div>

      {form.open ? (
        <form key={form.debt?.id ?? form.direction} action={formAction} className="grid grid-cols-1 gap-2.5 rounded-2xl px-4 py-4 sm:grid-cols-2" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
          <input type="hidden" name="id" value={form.debt?.id ?? ''} />
          <div className="grid grid-cols-2 gap-2 sm:col-span-2">
            {(['hutang', 'piutang'] as const).map((dir) => (
              <label
                key={dir}
                className="cursor-pointer rounded-xl py-2.5 text-center text-[13px] font-bold"
                style={
                  form.direction === dir
                    ? { background: dir === 'hutang' ? '#b3392f' : '#2f6b4f', color: '#fff' }
                    : { background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.12)' }
                }
              >
                <input type="radio" name="direction" value={dir} checked={form.direction === dir} onChange={() => setForm({ ...form, direction: dir })} className="sr-only" />
                {dir === 'hutang' ? 'Hutang / Cicilan (kita bayar)' : 'Piutang (orang lain bayar ke kita)'}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-name">Nama</label>
            <input id="debt-name" name="name" required maxLength={60} defaultValue={form.debt?.name ?? ''} placeholder={form.direction === 'hutang' ? 'mis. KPR BTN, Cicilan Motor' : 'mis. Pinjaman ke Pak Budi'} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-party">{form.direction === 'hutang' ? 'Pemberi pinjaman (opsional)' : 'Peminjam (opsional)'}</label>
            <input id="debt-party" name="counterparty" maxLength={60} defaultValue={form.debt?.counterparty ?? ''} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-principal">{form.direction === 'hutang' ? 'Total yang harus dibayar (Rp)' : 'Total yang dipinjamkan (Rp)'}</label>
            <input id="debt-principal" name="principal" inputMode="numeric" required value={principal} onChange={(e) => setPrincipal(formatAmountInput(e.target.value))} placeholder="30.000.000" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-inst">Cicilan per bulan (opsional)</label>
            <input id="debt-inst" name="installment_amount" inputMode="numeric" value={installment} onChange={(e) => setInstallment(formatAmountInput(e.target.value))} placeholder="1.500.000" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-due">Jatuh tempo tiap tanggal (opsional)</label>
            <input id="debt-due" name="due_day" type="number" min={1} max={31} defaultValue={form.debt?.due_day ?? ''} placeholder="mis. 25" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-remind">Ingatkan sebelum jatuh tempo</label>
            <select id="debt-remind" name="remind_days" defaultValue={String(form.debt?.remind_days ?? 3)} style={inputStyle}>
              {[0, 1, 2, 3, 5, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? 'Di hari jatuh tempo' : `${n} hari sebelumnya`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-tenor">Tenor (bulan, opsional)</label>
            <input id="debt-tenor" name="tenor_months" type="number" min={1} max={600} defaultValue={form.debt?.tenor_months ?? ''} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-start">Mulai</label>
            <input id="debt-start" name="start_date" type="date" required defaultValue={form.debt?.start_date ?? today} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-acc">{form.direction === 'hutang' ? 'Biasanya dibayar dari' : 'Biasanya diterima di'}</label>
            <select id="debt-acc" name="account_id" defaultValue={form.debt?.account_id ?? ''} style={inputStyle}>
              <option value="">Tidak ditentukan</option>
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="debt-note">Catatan (opsional)</label>
            <input id="debt-note" name="note" maxLength={200} defaultValue={form.debt?.note ?? ''} placeholder="mis. bunga fix 5 tahun" style={inputStyle} />
          </div>
          {state.error ? <p className="text-[12px] font-bold sm:col-span-2" style={{ color: '#b3392f' }}>{state.error}</p> : null}
          <div className="flex gap-2 sm:col-span-2">
            <button type="button" onClick={() => setForm({ ...form, open: false, debt: null })} className="rounded-lg px-4 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
              Batal
            </button>
            <button type="submit" disabled={isSaving} className="flex-1 rounded-lg py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {shown.length === 0 ? (
          <div className="rounded-2xl px-5 py-6 text-center text-[13px]" style={{ ...cardStyle, color: '#5b543f' }}>
            Belum ada hutang atau piutang yang dicatat.
          </div>
        ) : null}
        {shown.map((d) => {
          const isHutang = d.direction === 'hutang'
          const pct = Math.min(d.paid / d.principal, 1)
          const due = d.status === 'aktif' ? nextDueDate(d.due_day, today) : null
          const dueIn = due ? daysUntil(due, today) : null
          // sama dengan aturan pengingat di database: ada pembayaran setelah jatuh tempo bulan sebelumnya
          const paidThisCycle = !!due && paidForDue(d.last_paid_date, due)
          const monthsLeft = d.installment_amount ? Math.ceil(d.remaining / d.installment_amount) : null
          const color = isHutang ? '#b3392f' : '#2f6b4f'
          const myPayments = payments.filter((p) => p.debt_id === d.id)
          const isPaying = pay?.debtId === d.id

          return (
            <div key={d.id} className="rounded-2xl px-4 py-4" style={{ ...cardStyle, opacity: d.status === 'lunas' ? 0.65 : 1 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{d.name}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: `${color}14`, color }}>
                      {isHutang ? 'Hutang' : 'Piutang'}
                    </span>
                    {d.status === 'lunas' ? <span className="text-[10.5px] font-bold" style={{ color: '#2f6b4f' }}>LUNAS</span> : null}
                  </div>
                  <div className="mt-0.5 text-[11.5px]" style={{ color: '#5b543f' }}>
                    {d.counterparty ? `${d.counterparty} · ` : ''}
                    {rupiah(d.paid)} dari {rupiah(d.principal)} {isHutang ? 'terbayar' : 'kembali'}
                    {d.installment_amount ? ` · ${rupiah(d.installment_amount)}/bulan` : ''}
                    {monthsLeft && d.status === 'aktif' ? ` · ±${monthsLeft} bulan lagi` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] font-bold uppercase" style={{ color: '#9c7a3f' }}>Sisa</div>
                  <div className="text-[15px] font-bold" style={{ color }}>{rupiah(d.remaining)}</div>
                </div>
              </div>

              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: '#f1ece0' }} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres ${d.name}`}>
                <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
              </div>

              {due && dueIn !== null ? (
                <div
                  className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={
                    paidThisCycle
                      ? { background: 'rgba(47,107,79,0.1)', color: '#2f6b4f' }
                      : dueIn <= d.remind_days
                        ? { background: 'rgba(179,57,47,0.1)', color: '#b3392f' }
                        : { background: '#faf7f0', color: '#5b543f' }
                  }
                >
                  {paidThisCycle
                    ? `Sudah ${isHutang ? 'dibayar' : 'diterima'} untuk jatuh tempo ${dateLabel(due, false)}`
                    : `Jatuh tempo ${dateLabel(due, false)} · ${dueIn === 0 ? 'hari ini' : `${dueIn} hari lagi`}`}
                </div>
              ) : null}
              {d.note ? <div className="mt-1 text-[11.5px] italic" style={{ color: '#7a6f55' }}>{d.note}</div> : null}

              {isPaying && pay ? (
                <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl px-3 py-3 sm:grid-cols-2" style={{ background: '#faf7f0' }}>
                  <input inputMode="numeric" autoFocus value={pay.amount} onChange={(e) => setPay({ ...pay, amount: formatAmountInput(e.target.value) })} placeholder="Nominal" style={{ ...inputStyle, background: '#fff' }} />
                  <input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                  <select value={pay.accountId} onChange={(e) => setPay({ ...pay, accountId: e.target.value })} aria-label="Rekening" style={{ ...inputStyle, background: '#fff' }}>
                    <option value="">Tanpa rekening</option>
                    {activeAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {isHutang ? `Dari ${a.name}` : `Ke ${a.name}`}
                      </option>
                    ))}
                  </select>
                  <input value={pay.note} maxLength={120} placeholder="Catatan (opsional)" onChange={(e) => setPay({ ...pay, note: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                  <p className="text-[11px] sm:col-span-2" style={{ color: '#5b543f' }}>
                    Otomatis tercatat sebagai {isHutang ? 'pengeluaran "Cicilan / Hutang"' : 'pemasukan "Piutang Diterima"'} di Transaksi.
                  </p>
                  <div className="flex gap-2 sm:col-span-2">
                    <button type="button" onClick={() => setPay(null)} className="rounded-lg px-3 py-2 text-[12px] font-bold" style={{ background: '#fff', color: '#5b543f' }}>
                      Batal
                    </button>
                    <button type="button" disabled={isPending || !parseAmount(pay.amount)} onClick={() => submitPay(d)} className="flex-1 rounded-lg py-2 text-[12px] font-bold" style={{ background: color, color: '#fff' }}>
                      {isHutang ? 'Catat Pembayaran' : 'Catat Penerimaan'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {d.status === 'aktif' ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPay({
                        debtId: d.id,
                        amount: formatAmountInput(String(Math.min(d.installment_amount ?? d.remaining, d.remaining))),
                        date: today,
                        accountId: d.account_id ?? '',
                        note: '',
                      })
                    }
                    className="text-[12px] font-bold"
                    style={{ color }}
                  >
                    {isHutang ? 'Bayar Cicilan' : 'Terima Pembayaran'}
                  </button>
                ) : null}
                <button type="button" onClick={() => setHistoryId(historyId === d.id ? null : d.id)} className="text-[12px] font-bold" style={{ color: '#5b543f' }}>
                  Riwayat ({d.payment_count})
                </button>
                <button type="button" onClick={() => openForm(d, d.direction)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>Ubah</button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={async () => {
                    if (!(await confirmModal(`Hapus ${d.name}? Riwayat pembayarannya tetap ada di Transaksi.`, { danger: true }))) return
                    run(() => deleteDebt(d.id))
                  }}
                  className="text-[12px] font-bold"
                  style={{ color: '#b3392f' }}
                >
                  Hapus
                </button>
              </div>

              {historyId === d.id ? (
                <div className="mt-3 flex flex-col" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                  {myPayments.length === 0 ? <p className="pt-2 text-[12px]" style={{ color: '#5b543f' }}>Belum ada pembayaran.</p> : null}
                  {myPayments.slice(0, 24).map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-2 py-1.5 text-[12px]">
                      <span style={{ color: '#5b543f' }}>
                        {dateLabel(p.transaction_date)}
                        {p.account_name ? ` · ${p.account_name}` : ''}
                      </span>
                      <span className="flex items-center gap-2">
                        <b style={{ color }}>{rupiah(p.amount)}</b>
                        <button
                          type="button"
                          aria-label="Batalkan pembayaran"
                          disabled={isPending}
                          onClick={async () => {
                            if (!(await confirmModal('Batalkan pembayaran ini? Transaksinya juga dihapus.', { danger: true }))) return
                            run(() => deleteHouseholdTransaction(p.id))
                          }}
                          className="text-[11px] font-bold"
                          style={{ color: '#b3392f' }}
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}