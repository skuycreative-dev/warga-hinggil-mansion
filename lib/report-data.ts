import { periodLabel, dateLabel } from '@/lib/format'
import { IPL_METHOD_LABEL, IPL_STATUS_LABEL, billOutstanding, billTotal, sortHouse } from '@/lib/ipl'

// Data laporan yang sama dipakai untuk Excel dan PDF
export type ReportColumn = { label: string; width: number; align?: 'left' | 'right'; money?: boolean }
export type Report = {
  fileBase: string
  title: string
  subtitle: string
  columns: ReportColumn[]
  rows: (string | number)[][]
  summary: [string, string | number][]
  landscape?: boolean
}

type Supa = any

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/

export function cleanRange(dari: string | null, sampai: string | null) {
  const now = new Date(Date.now() + 7 * 3600 * 1000)
  const thisMonth = now.toISOString().slice(0, 7)
  let to = sampai && PERIOD.test(sampai) ? sampai : thisMonth
  let from = dari && PERIOD.test(dari) ? dari : `${Number(to.slice(0, 4))}-01`
  if (from > to) [from, to] = [to, from]
  return { from, to }
}

function rangeLabel(from: string, to: string) {
  return from === to ? periodLabel(from) : `${periodLabel(from)} - ${periodLabel(to)}`
}

function lastDay(period: string) {
  const [y, m] = period.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}

async function fetchAll(q: () => any) {
  const out: any[] = []
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await q().range(from, from + 999)
    if (error || !data) break
    out.push(...data)
    if (data.length < 1000) break
  }
  return out
}

// Kas Paguyuban (pemasukan & pengeluaran)
export async function anggaranReport(supabase: Supa, from: string, to: string): Promise<Report> {
  const rows = await fetchAll(() =>
    supabase
      .from('iuran_transactions')
      .select('transaction_date, type, category, description, amount')
      .gte('transaction_date', `${from}-01`)
      .lte('transaction_date', lastDay(to))
      .order('transaction_date', { ascending: true })
      .order('created_at', { ascending: true })
  )
  let masuk = 0
  let keluar = 0
  const out = rows.map((r) => {
    const amt = Number(r.amount) || 0
    const isIn = r.type === 'pemasukan'
    if (isIn) masuk += amt
    else keluar += amt
    return [dateLabel(r.transaction_date), isIn ? 'Pemasukan' : 'Pengeluaran', r.category ?? '-', r.description ?? '', isIn ? amt : 0, isIn ? 0 : amt]
  })
  return {
    fileBase: `laporan-kas-${from}${from === to ? '' : `_${to}`}`,
    title: 'Laporan Kas Paguyuban',
    subtitle: `Periode ${rangeLabel(from, to)}`,
    columns: [
      { label: 'Tanggal', width: 62 },
      { label: 'Jenis', width: 62 },
      { label: 'Kategori', width: 80 },
      { label: 'Keterangan', width: 136 },
      { label: 'Pemasukan (Rp)', width: 80, align: 'right', money: true },
      { label: 'Pengeluaran (Rp)', width: 84, align: 'right', money: true },
    ],
    rows: out,
    summary: [
      ['Total pemasukan', masuk],
      ['Total pengeluaran', keluar],
      ['Selisih periode ini', masuk - keluar],
      ['Jumlah transaksi', out.length],
    ],
  }
}

// Tagihan IPL per rumah per periode
export async function iplReport(supabase: Supa, from: string, to: string): Promise<Report> {
  const rows = await fetchAll(() =>
    supabase
      .from('iuran_payment_status')
      .select('period, amount_due, late_fee, amount_paid, status, due_date, paid_at, payment_method, house:houses(nomor_rumah)')
      .gte('period', from)
      .lte('period', to)
      .order('period', { ascending: true })
  )
  const sorted = rows
    .map((r) => ({ ...r, nomor: (Array.isArray(r.house) ? r.house[0] : r.house)?.nomor_rumah ?? '-' }))
    .sort((a, b) => a.period.localeCompare(b.period) || sortHouse(a.nomor, b.nomor))
  let tagihan = 0
  let dibayar = 0
  let sisa = 0
  const out = sorted.map((r) => {
    const total = billTotal(r)
    const paid = Number(r.amount_paid) || 0
    const left = billOutstanding(r)
    tagihan += total
    dibayar += paid
    sisa += left
    return [periodLabel(r.period), r.nomor, Number(r.amount_due) || 0, Number(r.late_fee) || 0, paid, left, IPL_STATUS_LABEL[r.status] ?? r.status, r.paid_at ? dateLabel(r.paid_at) : '-', IPL_METHOD_LABEL[r.payment_method] ?? '-']
  })
  const lunas = sorted.filter((r) => r.status === 'lunas').length
  return {
    fileBase: `laporan-ipl-${from}${from === to ? '' : `_${to}`}`,
    title: 'Laporan Tagihan IPL',
    subtitle: `Periode ${rangeLabel(from, to)}`,
    landscape: true,
    columns: [
      { label: 'Periode', width: 80 },
      { label: 'Rumah', width: 55 },
      { label: 'Tagihan (Rp)', width: 72, align: 'right', money: true },
      { label: 'Denda (Rp)', width: 62, align: 'right', money: true },
      { label: 'Dibayar (Rp)', width: 72, align: 'right', money: true },
      { label: 'Sisa (Rp)', width: 72, align: 'right', money: true },
      { label: 'Status', width: 70 },
      { label: 'Tgl bayar', width: 70 },
      { label: 'Cara bayar', width: 70 },
    ],
    rows: out,
    summary: [
      ['Total tagihan + denda', tagihan],
      ['Total dibayar', dibayar],
      ['Total belum dibayar', sisa],
      ['Tagihan lunas', `${lunas} dari ${sorted.length}`],
    ],
  }
}

// Tunggakan per rumah (semua tagihan yang belum lunas sampai periode akhir)
export async function tunggakanReport(supabase: Supa, to: string): Promise<Report> {
  const rows = await fetchAll(() =>
    supabase
      .from('iuran_payment_status')
      .select('period, amount_due, late_fee, amount_paid, status, due_date, house_id, house:houses(nomor_rumah)')
      .neq('status', 'lunas')
      .lte('period', to)
      .order('period', { ascending: true })
  )
  const byHouse = new Map<string, { nomor: string; periods: string[]; total: number; oldest: string }>()
  type Row = { period: string; house_id: string; house: any; amount_due: number; late_fee: number; amount_paid: number; status: 'lunas' | 'belum' | 'sebagian' }
  for (const r of rows as Row[]) {
    const nomor = (Array.isArray(r.house) ? r.house[0] : r.house)?.nomor_rumah ?? '-'
    const left = billOutstanding(r)
    if (left <= 0) continue
    const cur = byHouse.get(r.house_id) ?? { nomor, periods: [] as string[], total: 0, oldest: r.period }
    cur.periods.push(r.period)
    cur.total += left
    if (r.period < cur.oldest) cur.oldest = r.period
    byHouse.set(r.house_id, cur)
  }
  const list = Array.from(byHouse.values()).sort((a, b) => b.total - a.total || sortHouse(a.nomor, b.nomor))
  const total = list.reduce((s, h) => s + h.total, 0)
  return {
    fileBase: `laporan-tunggakan-ipl-${to}`,
    title: 'Laporan Tunggakan IPL',
    subtitle: `Per ${periodLabel(to)}`,
    columns: [
      { label: 'Rumah', width: 70 },
      { label: 'Jumlah bulan', width: 70, align: 'right' },
      { label: 'Tunggakan sejak', width: 100 },
      { label: 'Periode belum lunas', width: 150 },
      { label: 'Total (Rp)', width: 90, align: 'right', money: true },
    ],
    rows: list.map((h) => [h.nomor, h.periods.length, periodLabel(h.oldest), h.periods.map((p) => periodLabel(p)).join(', '), h.total]),
    summary: [
      ['Rumah menunggak', list.length],
      ['Total tunggakan', total],
    ],
  }
}