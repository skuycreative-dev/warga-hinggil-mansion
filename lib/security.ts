// Hanya untuk kode server (server actions / route / proxy). Jangan diimpor ke komponen 'use client'.
import { createHash } from 'crypto'
import { headers } from 'next/headers'

// Alamat IP pengunjung (Vercel mengisi x-forwarded-for / x-real-ip)
export async function clientIp(): Promise<string> {
  const h = await headers()
  // Header yang diisi platform Vercel sendiri (tidak bisa dipalsukan pengunjung) lebih diutamakan
  const vercel = h.get('x-vercel-forwarded-for')
  if (vercel) return vercel.split(',')[0].trim()
  const real = h.get('x-real-ip')
  if (real) return real.trim()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return ''
}

// Kunci tersamar: email & IP tidak disimpan apa adanya di database
export function hashKey(prefix: string, value: string) {
  return `${prefix}:${createHash('sha256').update(value.trim().toLowerCase()).digest('hex').slice(0, 40)}`
}

export function maskEmail(email: string) {
  const [user, domain] = email.trim().toLowerCase().split('@')
  if (!domain) return '***'
  const shown = user.slice(0, Math.min(2, user.length))
  return `${shown}${'*'.repeat(Math.max(3, user.length - shown.length))}@${domain}`
}

// Aturan password baru (daftar, reset, akun admin)
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password minimal 8 karakter.'
  if (password.length > 72) return 'Password maksimal 72 karakter.'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password harus berisi huruf dan angka.'
  if (/^(.)\1+$/.test(password)) return 'Password terlalu mudah ditebak.'
  const common = ['password1', 'qwerty123', '12345678a', 'hinggil123', 'admin1234', 'bismillah1']
  if (common.includes(password.toLowerCase())) return 'Password terlalu mudah ditebak.'
  return null
}

// Alamat situs untuk link (mis. link reset password).
// Host dari permintaan hanya dipakai kalau termasuk daftar resmi, supaya link tidak bisa dibelokkan ke situs lain.
const CANONICAL_ORIGIN = 'https://warga.hinggilmansion.com'
export async function siteOrigin(): Promise<string> {
  const h = await headers()
  const host = (h.get('x-forwarded-host') || h.get('host') || '').toLowerCase()
  if (/^localhost(:\d+)?$/.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host)) return `http://${host}`
  if (host === 'warga.hinggilmansion.com') return CANONICAL_ORIGIN
  return CANONICAL_ORIGIN
}

export function isRateLimitError(error: { message?: string; hint?: string } | null | undefined) {
  return !!error && (error.hint === 'RATE_LIMIT' || /Terlalu banyak/.test(error.message ?? ''))
}