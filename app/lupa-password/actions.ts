'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, hashKey, isRateLimitError } from '@/lib/security'

export type ResetRequestState = { sent: boolean; error: string | null }

// Permintaan reset dikirim ke Superadmin. Jawaban selalu sama (akun ada atau tidak)
// supaya halaman ini tidak bisa dipakai untuk menebak email/nomor HP yang terdaftar.
export async function requestPasswordReset(_prev: ResetRequestState, formData: FormData): Promise<ResetRequestState> {
  const identifier = ((formData.get('identifier') as string) ?? '').trim()
  const note = ((formData.get('note') as string) ?? '').trim().slice(0, 300)
  const trap = ((formData.get('website') as string) ?? '').trim()

  if (trap) return { sent: true, error: null } // isian jebakan robot
  if (identifier.length < 5 || identifier.length > 120) {
    return { sent: false, error: 'Isi email atau nomor HP yang terdaftar.' }
  }

  const ip = await clientIp()
  try {
    const { error } = await createAdminClient().rpc('create_password_reset_request', {
      p_identifier: identifier,
      p_note: note,
      p_ip_key: ip ? hashKey('ip', ip) : null,
    })
    if (error) {
      if (isRateLimitError(error)) return { sent: false, error: 'Terlalu banyak permintaan dari jaringan ini. Coba lagi 1 jam lagi.' }
      return { sent: false, error: 'Permintaan belum terkirim. Coba lagi beberapa saat lagi.' }
    }
  } catch {
    return { sent: false, error: 'Permintaan belum terkirim. Coba lagi beberapa saat lagi.' }
  }
  return { sent: true, error: null }
}