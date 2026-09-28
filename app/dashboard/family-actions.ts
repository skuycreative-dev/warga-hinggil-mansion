'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Kepala Keluarga mengonfirmasi / menolak penghuni rumahnya (verifikasi tahap 1).
// Semua pengecekan (harus Kepala Keluarga terverifikasi, rumah yang sama) dilakukan di database.
export async function confirmFamilyMember(memberId: string, approve: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('confirm_family_member', { member_id: memberId, approve })

  if (error) return { error: publicError(error) }

  revalidatePath('/dashboard')
  revalidatePath('/verifikasi-akun')
  return { error: null }
}

// Kepala Keluarga menyetujui / menolak penghuni rumahnya yang mengajukan jadi Ibu Rumah Tangga.
// Pengecekan (Kepala Keluarga terverifikasi, rumah yang sama) dilakukan di database.
export async function reviewRoleRequest(requestId: string, approve: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('review_family_role_request', { request_id: requestId, approve })

  if (error) return { error: publicError(error) }

  revalidatePath('/dashboard')
  revalidatePath('/verifikasi-akun')
  return { error: null }
}