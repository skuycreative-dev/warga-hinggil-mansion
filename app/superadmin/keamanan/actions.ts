'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccess } from '@/lib/access'
import { siteOrigin } from '@/lib/security'
import { MFA_ROLES } from '@/lib/mfa'
import { logAdminAction } from '@/lib/audit'

type Result = { ok: boolean; error: string | null }
export type ResetLinkResult = Result & { link?: string; email?: string | null; phone?: string | null; name?: string | null }

async function requireSuperadmin() {
  const access = await getMyAccess()
  return access.isSuperadmin ? access : null
}

// Membuat link atur ulang sekali pakai. Link TIDAK dikirim otomatis: Superadmin memilih WhatsApp atau Gmail.
export async function createResetLink(requestId: string): Promise<ResetLinkResult> {
  const me = await requireSuperadmin()
  if (!me) return { ok: false, error: 'Hanya Superadmin.' }
  const supabase = await createClient()
  // Fungsi database ini ikut memeriksa Superadmin + 2FA
  const { data, error } = await supabase.rpc('get_reset_target', { p_request: requestId })
  const target = Array.isArray(data) ? data[0] : data
  if (error || !target?.email) return { ok: false, error: 'Akun untuk permintaan ini tidak ditemukan.' }

  const { data: link, error: linkError } = await createAdminClient().auth.admin.generateLink({ type: 'recovery', email: target.email as string })
  const hashed = link?.properties?.hashed_token
  if (linkError || !hashed) return { ok: false, error: 'Gagal membuat link. Coba lagi.' }

  const url = `${await siteOrigin()}/reset-password?token_hash=${encodeURIComponent(hashed)}`
  await logAdminAction(me.userId, 'ubah', 'keamanan', requestId, `Membuat link reset password untuk ${String(target.name ?? target.email)}`)
  return {
    ok: true,
    error: null,
    link: url,
    email: target.email as string,
    phone: (target.phone as string | null) ?? null,
    name: (target.name as string | null) ?? null,
  }
}

export async function setResetStatus(requestId: string, status: 'dikirim' | 'selesai' | 'ditolak', via: string | null): Promise<Result> {
  if (!(await requireSuperadmin())) return { ok: false, error: 'Hanya Superadmin.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('set_reset_request_status', { p_request: requestId, p_status: status, p_via: via ?? '' })
  revalidatePath('/superadmin/keamanan')
  return error ? { ok: false, error: 'Status belum tersimpan.' } : { ok: true, error: null }
}

export async function unlockLogin(key: string): Promise<Result> {
  const me = await requireSuperadmin()
  if (!me) return { ok: false, error: 'Hanya Superadmin.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('unlock_auth_lockout', { p_key: key })
  if (!error) await logAdminAction(me.userId, 'ubah', 'keamanan', null, 'Membuka kunci login')
  revalidatePath('/superadmin/keamanan')
  return error ? { ok: false, error: 'Gagal membuka kunci.' } : { ok: true, error: null }
}

// Reset 2FA admin lain (HP hilang). Superadmin tidak bisa mereset 2FA dirinya sendiri dari sini.
export async function resetAdmin2fa(userId: string): Promise<Result> {
  const me = await requireSuperadmin()
  if (!me) return { ok: false, error: 'Hanya Superadmin.' }
  if (userId === me.userId) return { ok: false, error: 'Tidak bisa mereset 2FA akun sendiri. Pakai perangkat cadangan.' }

  const supabase = await createClient()
  const { data: target } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (!target || !MFA_ROLES.includes(target.role as string)) return { ok: false, error: 'Akun bukan admin.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId })
  if (error) return { ok: false, error: 'Gagal membaca perangkat 2FA.' }
  for (const f of data?.factors ?? []) {
    const { error: delError } = await admin.auth.admin.mfa.deleteFactor({ userId, id: f.id })
    if (delError) return { ok: false, error: 'Sebagian perangkat gagal dihapus. Coba lagi.' }
  }
  await admin.from('notifications').insert({
    user_id: userId,
    type: 'keamanan',
    title: '2FA akunmu direset Superadmin',
    body: 'Pasang ulang 2FA di menu Keamanan Akun. Kalau kamu tidak memintanya, segera hubungi Superadmin.',
    link: '/keamanan-akun',
  })
  await logAdminAction(me.userId, 'ubah', 'keamanan', userId, 'Mereset 2FA akun admin')
  revalidatePath('/superadmin/keamanan')
  return { ok: true, error: null }
}