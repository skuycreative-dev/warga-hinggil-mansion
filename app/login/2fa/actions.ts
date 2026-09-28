'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashKey, maskEmail } from '@/lib/security'

export type Verify2faResult = { ok: boolean; error: string | null; lockedUntil?: string | null }

function waitText(untilIso: string) {
  const seconds = Math.max(1, Math.ceil((new Date(untilIso).getTime() - Date.now()) / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m} menit ${s} detik` : `${s} detik`
}

// Kode 2FA diperiksa di server supaya batas 3x salah / 5 menit tidak bisa dilewati dengan memuat ulang halaman
export async function verify2fa(factorId: string, code: string): Promise<Verify2faResult> {
  const clean = (code ?? '').replace(/\D/g, '')
  if (clean.length !== 6 || !factorId || factorId.length > 64) {
    return { ok: false, error: 'Masukkan 6 digit kode dari aplikasi Authenticator.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sesi berakhir. Silakan login ulang.' }

  const key = hashKey('2fa', user.id)
  let admin: ReturnType<typeof createAdminClient> | null = null
  try {
    admin = createAdminClient()
    const { data: lockedUntil } = await admin.rpc('auth_lock_status', { p_keys: [key] })
    if (lockedUntil) {
      return { ok: false, error: `Kode salah 3 kali. Coba lagi dalam ${waitText(lockedUntil as string)}.`, lockedUntil: lockedUntil as string }
    }
  } catch {
    admin = null
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: clean })
  if (error) {
    let lockedUntil: string | null = null
    let remaining: number | null = null
    if (admin) {
      try {
        const { data } = await admin.rpc('auth_register_failure', {
          p_account_key: key,
          p_account_label: `2FA ${maskEmail(user.email ?? '')}`,
          p_ip_key: null,
        })
        const row = Array.isArray(data) ? data[0] : data
        lockedUntil = (row?.locked_until as string) ?? null
        remaining = typeof row?.remaining === 'number' ? row.remaining : null
      } catch {
        // abaikan
      }
    }
    if (lockedUntil) {
      return { ok: false, error: `Kode salah 3 kali. Demi keamanan, tunggu ${waitText(lockedUntil)}.`, lockedUntil }
    }
    return {
      ok: false,
      error: remaining !== null && remaining > 0 ? `Kode salah atau sudah kedaluwarsa. Sisa percobaan: ${remaining}.` : 'Kode salah atau sudah kedaluwarsa.',
    }
  }

  if (admin) {
    try {
      await admin.rpc('auth_register_success', { p_account_key: key })
    } catch {
      // abaikan
    }
  }
  return { ok: true, error: null }
}