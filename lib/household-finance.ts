// Tipe & hitungan Keuangan Rumah Tangga (rekening, pos tujuan, hutang/piutang)

export type HhAccount = {
  id: string
  name: string
  kind: string
  opening_balance: number
  is_archived: boolean
  balance: number
}

export type HhGoal = {
  id: string
  name: string
  category: string
  target_amount: number
  target_date: string | null
  monthly_plan: number | null
  account_id: string | null
  note: string | null
  is_done: boolean
  saved: number
  entries: { id: string; amount: number; entry_date: string; note: string | null }[]
}

export type HhDebt = {
  id: string
  direction: 'hutang' | 'piutang'
  name: string
  counterparty: string | null
  principal: number
  installment_amount: number | null
  tenor_months: number | null
  due_day: number | null
  start_date: string
  remind_days: number
  account_id: string | null
  note: string | null
  status: 'aktif' | 'lunas'
  paid: number
  remaining: number
  last_paid_date: string | null
  payment_count: number
}

export const ACCOUNT_KIND_LABEL: Record<string, string> = {
  bank: 'Rekening Bank',
  tunai: 'Uang Tunai',
  ewallet: 'E-Wallet',
  investasi: 'Investasi / Deposito',
  lainnya: 'Lainnya',
}

export const GOAL_CATEGORY_LABEL: Record<string, string> = {
  pendidikan: 'Pendidikan',
  tabungan: 'Tabungan',
  dana_darurat: 'Dana Darurat',
  ibadah: 'Ibadah (Haji/Umrah/Qurban)',
  rumah: 'Rumah & Renovasi',
  kendaraan: 'Kendaraan',
  kesehatan: 'Kesehatan',
  liburan: 'Liburan',
  lainnya: 'Lainnya',
}

// Tanggal jatuh tempo berikutnya (tanggal 31 di bulan pendek -> hari terakhir bulan itu)
export function nextDueDate(dueDay: number | null, today: string): string | null {
  if (!dueDay) return null
  const [y, m, d] = today.split('-').map(Number)
  const make = (yy: number, mm: number) => {
    const last = new Date(Date.UTC(yy, mm, 0)).getUTCDate()
    const day = Math.min(dueDay, last)
    return `${yy}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  const thisMonth = make(y, m)
  if (thisMonth >= `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`) return thisMonth
  return m === 12 ? make(y + 1, 1) : make(y, m + 1)
}

function utcDay(date: string) {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function daysUntil(date: string, today: string) {
  return Math.round((utcDay(date) - utcDay(today)) / 86400000)
}

// Rasio cicilan terhadap pemasukan bulanan (Debt Service Ratio).
// Patokan umum: <= 30% aman, 30-40% waspada, > 40% berat.
export function debtRatio(monthlyInstallments: number, monthlyIncome: number) {
  if (monthlyInstallments <= 0) return { ratio: 0, level: 'aman' as const }
  if (monthlyIncome <= 0) return { ratio: null, level: 'tidak_diketahui' as const }
  const ratio = monthlyInstallments / monthlyIncome
  return { ratio, level: ratio <= 0.3 ? ('aman' as const) : ratio <= 0.4 ? ('waspada' as const) : ('berat' as const) }
}

// Geser tanggal N bulan, sama seperti Postgres: 31 Mar - 1 bulan = 28/29 Feb
export function shiftMonth(date: string, delta: number) {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  const last = new Date(Date.UTC(y, m - 1 + delta + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m - 1 + delta, Math.min(d, last))).toISOString().slice(0, 10)
}

// Sudah ada pembayaran untuk jatuh tempo ini? (pembayaran setelah jatuh tempo bulan sebelumnya — sama dengan aturan pengingat di database)
export function paidForDue(lastPaidDate: string | null, due: string) {
  return !!lastPaidDate && lastPaidDate > shiftMonth(due, -1)
}