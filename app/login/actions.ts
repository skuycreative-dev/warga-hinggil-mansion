'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, hashKey, maskEmail } from '@/lib/security'

export type LoginState = { error: string | null; lockedUntil?: string | null }

function waitText(untilIso: string) {
  const seconds = Math.max(1, Math.ceil((new Date(untilIso).getTime() - Date.now()) / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m} menit ${s} detik` : `${s} detik`
}

export async function loginUser(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase()
  const password = (formData.get('password') as string) ?? ''

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }
  if (email.length > 120 || password.length > 200) {
    return { error: 'Email atau password salah.' }
  }

  const accountKey = hashKey('akun', email)
  const ip = await clientIp()
  const ipKey = ip ? hashKey('ip', ip) : ''

  // Sistem kunci dibuat "gagal-terbuka": kalau database kunci bermasalah, login tetap bisa
  // (supaya tidak ada kejadian semua akun terkunci karena gangguan teknis).
  let admin: ReturnType<typeof createAdminClient> | null = null
  try {
    admin = createAdminClient()
    const { data: lockedUntil } = await admin.rpc('auth_lock_status', { p_keys: ipKey ? [accountKey, ipKey] : [accountKey] })
    if (lockedUntil) {
      return {
        error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${waitText(lockedUntil as string)}.`,
        lockedUntil: lockedUntil as string,
      }
    }
  } catch {
    admin = null
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    let lockedUntil: string | null = null
    let remaining: number | null = null
    if (admin) {
      try {
        const { data } = await admin.rpc('auth_register_failure', {
          p_account_key: accountKey,
          p_account_label: maskEmail(email),
          p_ip_key: ipKey || null,
        })
        const row = Array.isArray(data) ? data[0] : data
        lockedUntil = (row?.locked_until as string) ?? null
        remaining = typeof row?.remaining === 'number' ? row.remaining : null
      } catch {
        // abaikan, login tetap berjalan normal
      }
    }
    if (lockedUntil) {
      return { error: `Password salah 3 kali. Demi keamanan, tunggu ${waitText(lockedUntil)} sebelum mencoba lagi.`, lockedUntil }
    }
    if (error.code === 'email_not_confirmed') {
      return { error: 'Email belum dikonfirmasi. Hubungi Pengurus Paguyuban.' }
    }
    return {
      error: remaining !== null && remaining > 0 ? `Email atau password salah. Sisa percobaan: ${remaining}.` : 'Email atau password salah.',
    }
  }

  if (admin) {
    try {
      await admin.rpc('auth_register_success', { p_account_key: accountKey })
    } catch {
      // abaikan
    }
  }

  // Admin yang sudah memasang 2FA wajib memasukkan kode 6 digit
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    redirect('/login/2fa')
  }

  redirect('/dashboard')
}