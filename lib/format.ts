import type { CSSProperties } from 'react'

// Format angka & tanggal yang dipakai berulang (Rupiah, bulan, tanggal WIB).

export function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

export function todayWib() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export function periodLabel(period: string) {
  const [y, m] = period.split('-').map(Number)
  if (!y || !m) return period
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function dateLabel(date: string | null | undefined, withYear = true) {
  if (!date) return '-'
  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  })
}

// "1500000" / "1.500.000" -> "1.500.000" (untuk input nominal)
export function formatAmountInput(raw: string) {
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}

export function parseAmount(raw: unknown) {
  const digits = String(raw ?? '').replace(/[^0-9]/g, '')
  return digits ? Number(digits) : 0
}

export function monthsBetween(from: string, to: string) {
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  return (ty - fy) * 12 + (tm - fm)
}

export const inputStyle: CSSProperties = {
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

export const labelStyle: CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export const cardStyle: CSSProperties = { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }