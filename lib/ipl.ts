// Tipe & label untuk Iuran IPL (dipakai halaman dan komponen)

export type IplBill = {
  id: string
  house_id: string
  nomor_rumah: string
  period: string
  amount_due: number
  late_fee: number
  amount_paid: number
  status: 'belum' | 'sebagian' | 'lunas'
  due_date: string | null
  paid_at: string | null
  payment_method: string | null
  note: string | null
  has_proof: boolean
}

export type IplDisbursement = {
  id: string
  period: string | null
  amount: number
  note: string | null
  status: 'dikirim' | 'diterima' | 'ditolak'
  reject_reason: string | null
  created_at: string
  confirmed_at: string | null
  created_by_name: string | null
  confirmed_by_name: string | null
}

export type IplSettings = { default_amount: number; due_day: number; late_fee: number }

export type IplHouseRate = { house_id: string; nomor_rumah: string; amount: number | null; note: string | null }

export const IPL_STATUS_LABEL: Record<string, string> = { belum: 'Belum bayar', sebagian: 'Sebagian', lunas: 'Lunas' }

export const IPL_METHOD_LABEL: Record<string, string> = { transfer: 'Transfer', tunai: 'Tunai', qris: 'QRIS', lainnya: 'Lainnya' }

export function billTotal(b: Pick<IplBill, 'amount_due' | 'late_fee'>) {
  return Number(b.amount_due) + Number(b.late_fee || 0)
}

export function billOutstanding(b: Pick<IplBill, 'amount_due' | 'late_fee' | 'amount_paid' | 'status'>) {
  if (b.status === 'lunas') return 0
  return Math.max(billTotal(b) - Number(b.amount_paid || 0), 0)
}

export function isOverdue(b: Pick<IplBill, 'due_date' | 'status'>, today: string) {
  return b.status !== 'lunas' && !!b.due_date && b.due_date < today
}

export function sortHouse(a: string, b: string) {
  return a.localeCompare(b, 'id', { numeric: true })
}