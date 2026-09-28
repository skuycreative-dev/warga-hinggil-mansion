'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { getMyAccess, type MyAccess } from '@/lib/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/log-error'

async function requireVerifier() {
  const access = await getMyAccess()
  if (!access.canVerifyAccounts) return null
  return access
}

type AdminClient = ReturnType<typeof createAdminClient>

async function notify(admin: AdminClient, userId: string, title: string, body: string, link: string) {
  // Notifikasi hanya pelengkap: kalau gagal, proses utama tetap dianggap berhasil.
  const { error } = await admin.from('notifications').insert({ user_id: userId, type: 'akun', title, body, link })
  if (error) console.error('notifikasi gagal:', error.message)
}

// force = true: Pengurus tetap menyetujui walau Kepala Keluarga belum/tidak mengonfirmasi
// (misalnya Kepala Keluarga tidak memakai aplikasi). Pengurus sudah diberi peringatan di layar.
export async function approveAccount(id: string, force = false): Promise<{ error: string | null; needsForce?: boolean }> {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menyetujui akun.' }

  try {
    const admin = createAdminClient()

    const { data: target } = await admin.from('profiles').select('family_role, family_status').eq('id', id).maybeSingle()
    const needsKepala =
      !!target && target.family_role !== 'kepala_keluarga' && !!target.family_status && target.family_status !== 'dikonfirmasi'

    if (needsKepala && !force) {
      return {
        error:
          target?.family_status === 'ditolak_kepala'
            ? 'Kepala Keluarga rumah ini MENOLAK orang ini sebagai penghuni.'
            : 'Kepala Keluarga rumah ini BELUM mengonfirmasi orang ini sebagai penghuni.',
        needsForce: true,
      }
    }
    const { data, error } = await admin
      .from('profiles')
      .update({
        account_status: 'aktif',
        verified_at: new Date().toISOString(),
        verified_by: requester.userId,
      })
      .eq('id', id)
      .eq('role', 'warga')
      .in('account_status', ['menunggu_verifikasi', 'ditolak'])
      .select('id')

    if (error) return { error: publicError(error) }
    if (!data || data.length === 0) return { error: 'Akun ini sudah diproses atau bukan akun warga.' }

    await notify(admin, id, 'Akun kamu sudah diverifikasi', 'Selamat datang! Semua fitur aplikasi warga sekarang sudah bisa dipakai.', '/dashboard')

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    await logError('verifikasi-akun: approveAccount', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function rejectAccount(id: string, reason: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menolak akun.' }

  const finalReason = reason.trim() || 'Data tidak sesuai / bukan warga Hinggil Mansion.'

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .update({
        account_status: 'ditolak',
        verified_at: new Date().toISOString(),
        verified_by: requester.userId,
        deactivated_at: new Date().toISOString(),
        deactivated_by: requester.userId,
        deactivated_reason: finalReason,
      })
      .eq('id', id)
      .eq('role', 'warga')
      .eq('account_status', 'menunggu_verifikasi')
      .select('id')

    if (error) return { error: publicError(error) }
    if (!data || data.length === 0) return { error: 'Akun ini sudah diproses sebelumnya.' }

    await notify(admin, id, 'Pendaftaran belum disetujui', `Alasan: ${finalReason}`, '/dashboard')

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    await logError('verifikasi-akun: rejectAccount', err)
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
    await logError('verifikasi-akun: deleteWargaAccount', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

// ---------------------------------------------------------------------
// Pengajuan perubahan data profil
//   full_name        -> Ketua Paguyuban / Superadmin
//   occupancy_status -> Ketua / Sekretaris Paguyuban / Superadmin
// ---------------------------------------------------------------------
const FIELD_LABEL: Record<string, string> = {
  full_name: 'Nama Lengkap',
  occupancy_status: 'Status Hunian',
  family_role: 'Peran Keluarga',
}

function canReviewField(access: MyAccess, field: string) {
  if (field === 'full_name') return access.isSuperadmin || access.isKetuaPaguyuban
  if (field === 'occupancy_status') return access.canVerifyAccounts
  if (field === 'family_role') return access.canVerifyAccounts
  return false
}

async function loadPendingRequest(admin: AdminClient, id: string) {
  const { data } = await admin
    .from('profile_change_requests')
    .select('id, user_id, field, new_value, status')
    .eq('id', id)
    .maybeSingle()
  if (!data || data.status !== 'menunggu') return null
  return data as { id: string; user_id: string; field: string; new_value: string; status: string }
}

export async function approveChangeRequest(id: string) {
  const access = await requireVerifier()
  if (!access) return { error: 'Kamu tidak punya akses.' }

  try {
    const admin = createAdminClient()
    const request = await loadPendingRequest(admin, id)
    if (!request) return { error: 'Pengajuan ini sudah diproses atau dibatalkan.' }
    if (!canReviewField(access, request.field)) {
      return { error: `Perubahan ${FIELD_LABEL[request.field] ?? request.field} hanya bisa disetujui Admin Paguyuban atau Superadmin.` }
    }

    // Disetujui Pengurus menjadi Ibu Rumah Tangga = sekaligus terkonfirmasi sebagai penghuni rumah itu
    const extra =
      request.field === 'family_role' && request.new_value === 'ibu_rumah_tangga'
        ? { family_status: 'dikonfirmasi', family_confirmed_by: access.userId, family_confirmed_at: new Date().toISOString() }
        : {}

    const { error: profileError } = await admin
      .from('profiles')
      .update({ [request.field]: request.new_value, ...extra })
      .eq('id', request.user_id)
    if (profileError) return { error: publicError(profileError) }

    const { error } = await admin
      .from('profile_change_requests')
      .update({ status: 'disetujui', reviewed_by: access.userId, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: publicError(error) }

    await notify(
      admin,
      request.user_id,
      `${FIELD_LABEL[request.field] ?? 'Data'} disetujui`,
      `Perubahan ${FIELD_LABEL[request.field] ?? 'data'} kamu sudah disetujui Pengurus.`,
      '/profile'
    )

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    await logError('verifikasi-akun: approveChangeRequest', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function rejectChangeRequest(id: string, note: string) {
  const access = await requireVerifier()
  if (!access) return { error: 'Kamu tidak punya akses.' }

  try {
    const admin = createAdminClient()
    const request = await loadPendingRequest(admin, id)
    if (!request) return { error: 'Pengajuan ini sudah diproses atau dibatalkan.' }
    if (!canReviewField(access, request.field)) {
      return { error: `Perubahan ${FIELD_LABEL[request.field] ?? request.field} hanya bisa diproses Admin Paguyuban atau Superadmin.` }
    }

    const { error } = await admin
      .from('profile_change_requests')
      .update({
        status: 'ditolak',
        review_note: note.trim() || null,
        reviewed_by: access.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return { error: publicError(error) }

    await notify(
      admin,
      request.user_id,
      `${FIELD_LABEL[request.field] ?? 'Data'} tidak disetujui`,
      note.trim() ? `Alasan: ${note.trim()}` : 'Hubungi Pengurus Paguyuban untuk informasi lebih lanjut.',
      '/profile'
    )

    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    await logError('verifikasi-akun: rejectChangeRequest', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}