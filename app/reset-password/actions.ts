'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashKey, passwordProblem } from '@/lib/security'

export type SimpleResult = { ok: boolean; error: string | null; needs2fa?: boolean }

// Langkah 1: link dari Superadmin berisi token sekali pakai. Token baru dipakai saat tombol ditekan
// (bukan saat halaman dibuka), supaya pratinjau link di WhatsApp/Gmail tidak menghanguskannya.
export async function openRecoveryLink(tokenHash: string): Promise<SimpleResult> {
  const token = (tokenHash ?? '').trim()
  if (!/^[A-Za-z0-9_-]{20,200}$/.test(token)) {
    return { ok: false, error: 'Link tidak valid. Minta link baru lewat halaman Lupa Password.' }
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: token })
  if (error) {
    return { ok: false, error: 'Link sudah dipakai atau kedaluwarsa. Minta link baru lewat halaman Lupa Password.' }
  }
  return { ok: true, error: null }
}

// Langkah 2: simpan password baru, tutup permintaan, keluarkan semua perangkat
export async function saveNewPassword(password: string, confirm: string): Promise<SimpleResult> {
  if (password !== confirm) return { ok: false, error: 'Konfirmasi password tidak sama.' }
  const weak = passwordProblem(password ?? '')
  if (weak) return { ok: false, error: weak }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sesi atur ulang berakhir. Buka lagi link dari Superadmin atau minta link baru.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    if (error.code === 'insufficient_aal' || /aal2|AAL2/.test(error.message)) {
      return { ok: false, error: 'Akun ini memakai 2FA. Masukkan kode 6 digit dulu.', needs2fa: true }
    }
    if (error.code === 'same_password') return { ok: false, error: 'Password baru tidak boleh sama dengan password lama.' }
    if (error.code === 'weak_password') return { ok: false, error: 'Password terlalu lemah. Pakai minimal 8 karakter berisi huruf dan angka.' }
    return { ok: false, error: 'Password belum tersimpan. Coba lagi.' }
  }

  try {
    await supabase.rpc('complete_my_password_reset')
  } catch {
    // abaikan
  }
  try {
    if (user.email) await createAdminClient().rpc('auth_register_success', { p_account_key: hashKey('akun', user.email) })
  } catch {
    // abaikan
  }

  // Semua sesi lama (termasuk yang mungkin dipakai orang lain) dikeluarkan
  await supabase.auth.signOut({ scope: 'global' })
  return { ok: true, error: null }
}