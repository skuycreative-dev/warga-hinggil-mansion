'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'
import { getMyAccess } from '@/lib/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/log-error'

async function requireVerifier() {
  const access = await getMyAccess()
  if (!access.canVerifyAccounts) return null
  return access
}

// Tahap 1: nonaktifkan akun warga yang pindah. Rumah dilepas (house_id dikosongkan) supaya
// pemilik/penyewa baru bisa didaftarkan ke rumah itu, tapi akun & riwayatnya masih ada
// sampai dihapus permanen di tahap 2 (dua tahap supaya tidak salah pencet).
export async function deactivateWarga(id: string, reason: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menonaktifkan akun.' }

  const finalReason = reason.trim() || 'Pindah dari perumahan'

  try {
    const admin = createAdminClient()
    const { data: target } = await admin.from('profiles').select('role, house_id, full_name').eq('id', id).maybeSingle()
    if (!target || target.role !== 'warga') {
      return { error: 'Hanya akun warga yang bisa ditandai pindah dari sini.' }
    }
    const houseId = target.house_id as string | null

    const { data, error } = await admin
      .from('profiles')
      .update({
        account_status: 'pindah',
        house_id: null,
        deactivated_at: new Date().toISOString(),
        deactivated_by: requester.userId,
        deactivated_reason: finalReason,
      })
      .eq('id', id)
      .eq('role', 'warga')
      .eq('account_status', 'aktif')
      .select('id')

    if (error) return { error: publicError(error) }
    if (!data || data.length === 0) return { error: 'Akun ini sudah tidak aktif.' }

    // Kalau tidak ada lagi warga aktif di rumah itu, tandai rumah kosong supaya bisa didaftarkan ulang.
    if (houseId) {
      const { count } = await admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('house_id', houseId)
        .eq('account_status', 'aktif')
      if (!count) {
        await admin.from('houses').update({ occupancy_status: 'kosong' }).eq('id', houseId)
      }
    }

    await logAdminAction(requester.userId, 'ubah', 'akun', id, `Menandai warga pindah: ${target.full_name} (${finalReason})`)
    revalidatePath('/kelola-warga')
    revalidatePath('/verifikasi-akun')
    return { error: null }
  } catch (err) {
    await logError('kelola-warga: deactivateWarga', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

// Batalkan status pindah (salah pencet / warga batal pindah) -- akun dikembalikan aktif,
// tapi rumahnya harus dipilih ulang lewat Layanan Surat / Status Hunian karena sudah dilepas.
export async function restoreWarga(id: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses.' }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .update({ account_status: 'aktif', deactivated_at: null, deactivated_by: null, deactivated_reason: null })
      .eq('id', id)
      .eq('role', 'warga')
      .eq('account_status', 'pindah')
      .select('id, full_name')

    if (error) return { error: publicError(error) }
    if (!data || data.length === 0) return { error: 'Akun ini bukan status pindah.' }

    await logAdminAction(requester.userId, 'ubah', 'akun', id, `Membatalkan status pindah: ${data[0].full_name}`)
    revalidatePath('/kelola-warga')
    return { error: null }
  } catch (err) {
    await logError('kelola-warga: restoreWarga', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

// Tahap 2: hapus permanen. NIK & email dibebaskan supaya pemilik rumah baru bisa daftar,
// TAPI baris profil TIDAK benar-benar dihapus (supaya postingan forum, transaksi IPL, log admin,
// dsb yang mengarah ke akun ini tidak ikut hilang) -- datanya diarsipkan dulu lalu dikosongkan (anonim).
export async function permanentlyDeleteMovedWarga(id: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses untuk menghapus akun.' }

  try {
    const admin = createAdminClient()
    const { data: target } = await admin
      .from('profiles')
      .select('id, role, full_name, nik, phone, family_role, account_status, deactivated_reason, house:houses(nomor_rumah)')
      .eq('id', id)
      .maybeSingle()

    if (!target || target.role !== 'warga') {
      return { error: 'Hanya akun warga yang bisa dihapus dari sini.' }
    }
    if (target.account_status !== 'pindah') {
      return { error: 'Tandai akun ini pindah dulu sebelum menghapusnya permanen.' }
    }

    const house = Array.isArray((target as any).house) ? (target as any).house[0] : (target as any).house

    const { error: arsipError } = await admin.from('warga_arsip').insert({
      profile_id: id,
      full_name: target.full_name,
      nik: target.nik,
      phone: target.phone,
      nomor_rumah: house?.nomor_rumah ?? null,
      family_role: target.family_role,
      status_sebelum: target.account_status,
      alasan: target.deactivated_reason ?? 'Dihapus permanen setelah pindah',
      dihapus_oleh: requester.userId,
      dihapus_oleh_nama: requester.fullName,
    })
    if (arsipError) return { error: publicError(arsipError) }

    // Bebaskan email & matikan login TANPA menghapus baris auth.users/profiles
    // (id tetap sama, jadi semua data yang mengarah ke akun ini -- forum, IPL, log -- tetap utuh).
    const freedEmail = `pindah.${id}@akun-dihapus.local`
    const { error: authError } = await admin.auth.admin.updateUserById(id, { email: freedEmail, ban_duration: '876000h' })
    if (authError) return { error: 'Gagal membebaskan email akun ini. Hubungi developer.' }

    const { error } = await admin
      .from('profiles')
      .update({
        full_name: 'Warga (akun dihapus)',
        nickname: null,
        phone: null,
        nik: null,
        avatar_url: null,
        account_status: 'dihapus',
      })
      .eq('id', id)

    if (error) return { error: publicError(error) }

    await logAdminAction(requester.userId, 'hapus', 'akun', id, `Menghapus permanen akun warga pindah: ${target.full_name}`)
    revalidatePath('/kelola-warga')
    return { error: null }
  } catch (err) {
    await logError('kelola-warga: permanentlyDeleteMovedWarga', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

// Paket V (30 Sep 2026): setujui/tolak pengajuan status hunian dari penghuni yang BUKAN pemilik
// rumah. Pengecekan siapa yang boleh menyetujui dilakukan di database (RPC
// review_house_occupancy_request), jadi cukup panggil lewat client biasa (bukan admin client).
export async function approveOccupancyRequest(id: string, note: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('review_house_occupancy_request', { p_id: id, p_approve: true, p_review_note: note.trim() || null })
  if (error) return { error: publicError(error) }
  revalidatePath('/kelola-warga')
  revalidatePath('/status-hunian')
  return { error: null }
}

export async function rejectOccupancyRequest(id: string, note: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('review_house_occupancy_request', { p_id: id, p_approve: false, p_review_note: note.trim() || null })
  if (error) return { error: publicError(error) }
  revalidatePath('/kelola-warga')
  revalidatePath('/status-hunian')
  return { error: null }
}

// Paket V: Pengurus bisa menghapus catatan Anggota Keluarga Tanpa Akun (mis. data keliru/duplikat
// atau orangnya sudah tidak tinggal di sana lagi) -- beda dari penghapusan oleh Kepala/Ibu Rumah
// Tangga sendiri (yang sudah ada lewat app/keluarga), ini lewat admin client karena RLS
// family_members hanya mengizinkan pengurus RUMAH itu sendiri, bukan Pengurus Paguyuban.
export async function deleteFamilyMemberAdmin(id: string) {
  const requester = await requireVerifier()
  if (!requester) return { error: 'Kamu tidak punya akses.' }

  try {
    const admin = createAdminClient()
    const { data: target } = await admin.from('family_members').select('name, house:houses(nomor_rumah)').eq('id', id).maybeSingle()
    if (!target) return { error: 'Data tidak ditemukan.' }

    const { error } = await admin.from('family_members').delete().eq('id', id)
    if (error) return { error: publicError(error) }

    const house = Array.isArray((target as any).house) ? (target as any).house[0] : (target as any).house
    await logAdminAction(requester.userId, 'hapus', 'anggota_keluarga', id, `Menghapus data Anggota Keluarga Tanpa Akun: ${target.name} (Rumah ${house?.nomor_rumah ?? '-'})`)
    revalidatePath('/kelola-warga')
    return { error: null }
  } catch (err) {
    await logError('kelola-warga: deleteFamilyMemberAdmin', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}