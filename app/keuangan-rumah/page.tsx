import Link from 'next/link'
import { after } from 'next/server'
import { getMyHousehold } from '@/lib/household-access'
import { displayName } from '@/lib/display-name'
import ClientTabs from '@/components/ClientTabs'
import HouseholdFinance, { type HouseholdTx } from '@/components/HouseholdFinance'
import HouseholdAccounts from '@/components/household/HouseholdAccounts'
import HouseholdDebts, { type DebtPayment } from '@/components/household/HouseholdDebts'
import { daysUntil, debtRatio, nextDueDate, paidForDue, type HhAccount, type HhDebt, type HhGoal } from '@/lib/household-finance'
import { dateLabel, rupiah, todayWib } from '@/lib/format'

export const dynamic = 'force-dynamic'

const TABS = [
  { key: 'transaksi', label: 'Ringkasan & Transaksi' },
  { key: 'rekening', label: 'Rekening & Pos Tujuan' },
  { key: 'hutang', label: 'Hutang & Piutang' },
]

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

function monthKeyShift(today: string, delta: number) {
  const [y, m] = today.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7)
}

export default async function KeuanganRumahPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const ctx = await getMyHousehold()
  const { tab: tabParam } = await searchParams

  if (!ctx.isManager || !ctx.houseId) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Khusus Kepala & Ibu Rumah Tangga</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Keuangan Rumah Tangga hanya bisa dibuka Kepala Keluarga dan Ibu Rumah Tangga (yang sudah dikonfirmasi Kepala Keluarga) di rumah yang sama.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const tab = TABS.some((t) => t.key === tabParam) ? (tabParam as string) : 'transaksi'
  const supabase = ctx.supabase
  const houseId = ctx.houseId
  const today = todayWib()

  // Kirim pengingat jatuh tempo cicilan (tidak dobel, dicek database) SETELAH halaman terkirim,
  // supaya tidak memperlambat tampilan
  after(async () => {
    await supabase.rpc('refresh_my_debt_reminders')
  })

  const [
    { data: txRaw },
    { data: accRaw },
    { data: balRaw },
    { data: unassignedRaw },
    { data: goalRaw },
    { data: goalBalRaw },
    { data: entryRaw },
    { data: debtRaw },
    { data: progressRaw },
  ] = await Promise.all([
    supabase
      .from('household_transactions')
      .select('id, type, category, amount, description, transaction_date, account_id, to_account_id, debt_id, author:profiles!household_transactions_created_by_fkey(full_name, nickname)')
      .eq('house_id', houseId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase.from('household_accounts').select('id, name, kind, opening_balance, is_archived').eq('house_id', houseId).order('created_at'),
    supabase.from('household_account_balances').select('account_id, balance').eq('house_id', houseId),
    supabase.from('household_unassigned_balance').select('balance').eq('house_id', houseId).maybeSingle(),
    supabase
      .from('household_goals')
      .select('id, name, category, target_amount, target_date, monthly_plan, account_id, note, is_done')
      .eq('house_id', houseId)
      .order('is_done')
      .order('created_at'),
    supabase.from('household_goal_balances').select('goal_id, saved').eq('house_id', houseId),
    supabase
      .from('household_goal_entries')
      .select('id, goal_id, amount, entry_date, note')
      .eq('house_id', houseId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase
      .from('household_debts')
      .select('id, direction, name, counterparty, principal, installment_amount, tenor_months, due_day, start_date, remind_days, account_id, note, status')
      .eq('house_id', houseId)
      .order('status')
      .order('created_at'),
    supabase.from('household_debt_progress').select('debt_id, paid, remaining, last_paid_date, payment_count').eq('house_id', houseId),
  ])

  // ---- Rekening
  const balanceMap = new Map((balRaw ?? []).map((b: any) => [b.account_id as string, Number(b.balance)]))
  const accounts: HhAccount[] = (accRaw ?? []).map((a: any) => ({
    id: a.id,
    name: a.name,
    kind: a.kind,
    opening_balance: Number(a.opening_balance),
    is_archived: !!a.is_archived,
    balance: balanceMap.get(a.id) ?? Number(a.opening_balance),
  }))
  const unassigned = Number((unassignedRaw as any)?.balance ?? 0)
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0) + unassigned
  const accountName = new Map(accounts.map((a) => [a.id, a.name]))

  // ---- Transaksi
  const transactions: HouseholdTx[] = (txRaw ?? []).map((t: any) => {
    const author = one<any>(t.author)
    return {
      id: t.id,
      type: t.type,
      account_id: t.account_id,
      to_account_id: t.to_account_id,
      debt_id: t.debt_id,
      category: t.category,
      amount: Number(t.amount),
      description: t.description,
      transaction_date: t.transaction_date,
      author_name: author ? displayName(author) : null,
    }
  })

  // ---- Pos tujuan
  const savedMap = new Map((goalBalRaw ?? []).map((g: any) => [g.goal_id as string, Number(g.saved)]))
  const goals: HhGoal[] = (goalRaw ?? []).map((g: any) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    target_amount: Number(g.target_amount),
    target_date: g.target_date,
    monthly_plan: g.monthly_plan === null ? null : Number(g.monthly_plan),
    account_id: g.account_id,
    note: g.note,
    is_done: !!g.is_done,
    saved: savedMap.get(g.id) ?? 0,
    entries: (entryRaw ?? [])
      .filter((e: any) => e.goal_id === g.id)
      .map((e: any) => ({ id: e.id, amount: Number(e.amount), entry_date: e.entry_date, note: e.note })),
  }))

  // ---- Hutang & piutang
  const progressMap = new Map((progressRaw ?? []).map((p: any) => [p.debt_id as string, p]))
  const debts: HhDebt[] = (debtRaw ?? []).map((d: any) => {
    const p: any = progressMap.get(d.id)
    const principal = Number(d.principal)
    return {
      id: d.id,
      direction: d.direction,
      name: d.name,
      counterparty: d.counterparty,
      principal,
      installment_amount: d.installment_amount === null ? null : Number(d.installment_amount),
      tenor_months: d.tenor_months,
      due_day: d.due_day,
      start_date: d.start_date,
      remind_days: Number(d.remind_days ?? 3),
      account_id: d.account_id,
      note: d.note,
      status: d.status,
      paid: Number(p?.paid ?? 0),
      remaining: Number(p?.remaining ?? principal),
      last_paid_date: p?.last_paid_date ?? null,
      payment_count: Number(p?.payment_count ?? 0),
    }
  })
  const payments: DebtPayment[] = transactions
    .filter((t) => t.debt_id)
    .map((t) => ({
      id: t.id,
      debt_id: t.debt_id as string,
      amount: t.amount,
      transaction_date: t.transaction_date,
      account_name: t.account_id ? accountName.get(t.account_id) ?? null : null,
    }))

  // Rata-rata pemasukan 3 bulan penuh terakhir (tanpa transfer & penerimaan piutang)
  const incomeMonths = [monthKeyShift(today, -3), monthKeyShift(today, -2), monthKeyShift(today, -1)]
  const incomeByMonth = incomeMonths.map((m) =>
    transactions.filter((t) => t.type === 'pemasukan' && !t.debt_id && t.transaction_date.startsWith(m)).reduce((s, t) => s + t.amount, 0)
  )
  const monthsWithData = incomeByMonth.filter((v) => v > 0).length
  const avgMonthlyIncome = monthsWithData ? Math.round(incomeByMonth.reduce((s, v) => s + v, 0) / monthsWithData) : 0

  // Ringkasan singkat di tab pertama
  const activeHutang = debts.filter((d) => d.status === 'aktif' && d.direction === 'hutang')
  const monthlyInstallments = activeHutang.reduce((s, d) => s + Math.min(d.installment_amount ?? 0, d.remaining), 0)
  const ratio = debtRatio(monthlyInstallments, avgMonthlyIncome)
  const earmarked = goals.filter((g) => !g.is_done).reduce((s, g) => s + Math.max(g.saved, 0), 0)
  const upcoming = debts
    .filter((d) => d.status === 'aktif' && d.due_day)
    .map((d) => {
      const due = nextDueDate(d.due_day, today) as string
      return { d, due, days: daysUntil(due, today) }
    })
    .filter((x) => x.days <= 14 && !paidForDue(x.d.last_paid_date, x.due))
    .sort((a, b) => a.days - b.days)

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah {ctx.houseLabel ?? ''}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Keuangan Rumah Tangga
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Hanya terlihat oleh Kepala Keluarga dan Ibu Rumah Tangga rumah ini. Pengurus pun tidak bisa melihatnya.
            </p>
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <ClientTabs
          basePath="/keuangan-rumah"
          initial={tab}
          tabs={TABS.map((t) => (t.key === 'hutang' ? { ...t, badge: upcoming.length || undefined } : t))}
          panels={{
            transaksi: (
              <>
                {upcoming.length > 0 || monthlyInstallments > 0 || earmarked > 0 ? (
                  <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Dana Bebas</div>
                      <div className="mt-1 text-lg font-bold" style={{ color: totalBalance - earmarked >= 0 ? '#2f6b4f' : '#b3392f' }}>{rupiah(totalBalance - earmarked)}</div>
                      <div className="text-[11.5px]" style={{ color: '#5b543f' }}>{rupiah(earmarked)} sudah disisihkan di pos tujuan</div>
                    </div>
                    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Cicilan / Bulan</div>
                      <div className="mt-1 text-lg font-bold" style={{ color: '#1f1a10' }}>
                        {rupiah(monthlyInstallments)}
                        {ratio.ratio !== null && monthlyInstallments > 0 ? (
                          <span className="ml-2 text-[12px]" style={{ color: ratio.level === 'aman' ? '#2f6b4f' : ratio.level === 'waspada' ? '#7a5a1f' : '#b3392f' }}>
                            {Math.round(ratio.ratio * 100)}% pemasukan
                          </span>
                        ) : null}
                      </div>
                      <div className="text-[11.5px]" style={{ color: upcoming.length ? '#b3392f' : '#5b543f' }}>
                        {upcoming.length
                          ? `${upcoming[0].d.name} jatuh tempo ${dateLabel(upcoming[0].due, false)}${upcoming.length > 1 ? ` (+${upcoming.length - 1} lainnya)` : ''}`
                          : 'Tidak ada jatuh tempo 14 hari ke depan'}
                      </div>
                    </div>
                  </div>
                ) : null}
                <HouseholdFinance transactions={transactions} houseLabel={ctx.houseLabel} accounts={accounts} totalBalance={totalBalance} />
              </>
            ),
            rekening: <HouseholdAccounts accounts={accounts} goals={goals} unassigned={unassigned} totalBalance={totalBalance} />,
            hutang: <HouseholdDebts debts={debts} payments={payments} accounts={accounts} avgMonthlyIncome={avgMonthlyIncome} />,
          }}
        />
      </div>
    </main>
  )
}