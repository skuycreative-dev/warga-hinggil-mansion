'use server'

import { revalidatePath } from 'next/cache'
import { getMyAccess } from '@/lib/access'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireVerifier() {
  const access = await getMyAccess()
  if (!access.canVerifyAccounts) return null
  return { userId: access.userId }
}

export async function approveAccount(id: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menyetujui akun.' }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({
        account_status: 'aktif',
        verified_at: new Date().toISOString(),
        verified_by: requester.userId,
      })
      .eq('id', id)
      .eq('role', 'warga')
      .in('account_status', ['menunggu_verifikasi', 'ditolak'])

    if (error) return { error: error.message }

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    console.error('approveAccount gagal:', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function rejectAccount(id: string, reason: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menolak akun.' }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({
        account_status: 'ditolak',
        verified_at: new Date().toISOString(),
        verified_by: requester.userId,
        deactivated_at: new Date().toISOString(),
        deactivated_by: requester.userId,
        deactivated_reason: reason || 'Data tidak sesuai / bukan warga Hinggil Mansion.',
      })
      .eq('id', id)
      .eq('role', 'warga')
      .eq('account_status', 'menunggu_verifikasi')

    if (error) return { error: error.message }

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    console.error('rejectAccount gagal:', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function deleteWargaAccount(id: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menghapus akun.' }

  try {
    const admin = createAdminClient()

    const { data: target } = await admin.from('profiles').select('role').eq('id', id).maybeSingle()
    if (!target || target.role !== 'warga') {
      return { error: 'Hanya akun warga yang bisa dihapus dari halaman ini.' }
    }

    await admin.auth.admin.deleteUser(id)
    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    console.error('deleteWargaAccount gagal:', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}