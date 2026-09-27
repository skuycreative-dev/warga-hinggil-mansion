'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UpdateProfileState = {
  error: string
  success: boolean
  message?: string
}

const FAMILY_ROLES = ['kepala_keluarga', 'anggota_keluarga', 'asisten_rumah_tangga', 'lainnya']
const OCCUPANCY = ['pemilik', 'penyewa', 'sementara']

// Aturan (keputusan 27 Sep 2026):
// - Bebas diubah sendiri: Nama Panggilan, Nomor HP, Bio, peran keluarga (kecuali status Kepala Keluarga).
// - Lewat pengajuan: Nama Lengkap (Ketua Paguyuban / Superadmin), Status Hunian (Ketua / Sekretaris / Superadmin).
// - Masa pengisian data (NIK belum ada / akun masih menunggu verifikasi): semua boleh diisi langsung.
export async function updateProfile(prevState: UpdateProfileState, formData: FormData): Promise<UpdateProfileState> {
  const nickname = ((formData.get('nickname') as string) ?? '').trim()
  const phone = ((formData.get('phone') as string) ?? '').trim()
  const bio = ((formData.get('bio') as string) ?? '').trim()
  const fullName = ((formData.get('full_name') as string) ?? '').trim()
  const nik = ((formData.get('nik') as string) ?? '').trim()
  const familyRole = (formData.get('family_role') as string) ?? ''
  const occupancyStatus = (formData.get('occupancy_status') as string) ?? ''

  if (!phone) return { error: 'Nomor HP wajib diisi.', success: false }
  if (nickname.length > 30) return { error: 'Nama Panggilan maksimal 30 karakter.', success: false }
  if (bio.length > 300) return { error: 'Bio maksimal 300 karakter.', success: false }
  if (!fullName) return { error: 'Nama Lengkap wajib diisi.', success: false }
  if (fullName.length > 100) return { error: 'Nama Lengkap maksimal 100 karakter.', success: false }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: current } = await supabase
    .from('profiles')
    .select('full_name, nik, account_status, family_role, occupancy_status')
    .eq('id', user.id)
    .maybeSingle()

  if (!current) return { error: 'Profil tidak ditemukan.', success: false }

  const inCompletion = !current.nik || current.account_status === 'menunggu_verifikasi'

  const update: Record<string, string | null> = {
    nickname: nickname || null,
    phone,
    bio: bio || null,
  }

  if (familyRole && familyRole !== current.family_role) {
    if (!FAMILY_ROLES.includes(familyRole)) return { error: 'Peran keluarga tidak valid.', success: false }
    const touchesKepala = familyRole === 'kepala_keluarga' || current.family_role === 'kepala_keluarga'
    if (touchesKepala && !inCompletion) {
      return { error: 'Status Kepala Keluarga hanya bisa diubah dengan persetujuan Pengurus.', success: false }
    }
    update.family_role = familyRole
  }

  const requests: { field: 'full_name' | 'occupancy_status'; old_value: string | null; new_value: string }[] = []

  if (inCompletion) {
    if (!/^\d{16}$/.test(nik)) return { error: 'NIK harus terdiri dari 16 digit angka.', success: false }
    if (occupancyStatus && !OCCUPANCY.includes(occupancyStatus)) return { error: 'Status hunian tidak valid.', success: false }

    const { data: existingNik } = await supabase.from('profiles').select('id').eq('nik', nik).neq('id', user.id).maybeSingle()
    if (existingNik) return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }

    update.full_name = fullName
    update.nik = nik
    if (occupancyStatus) update.occupancy_status = occupancyStatus
  } else {
    if (fullName !== (current.full_name ?? '')) {
      requests.push({ field: 'full_name', old_value: current.full_name ?? null, new_value: fullName })
    }
    if (occupancyStatus && occupancyStatus !== (current.occupancy_status ?? '')) {
      if (!OCCUPANCY.includes(occupancyStatus)) return { error: 'Status hunian tidak valid.', success: false }
      requests.push({ field: 'occupancy_status', old_value: current.occupancy_status ?? null, new_value: occupancyStatus })
    }
  }

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id)

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
    }
    return { error: error.message, success: false }
  }

  for (const r of requests) {
    const { error: requestError } = await supabase
      .from('profile_change_requests')
      .insert({ user_id: user.id, field: r.field, old_value: r.old_value, new_value: r.new_value })

    if (requestError) {
      if ((requestError as { code?: string }).code === '23505') {
        return {
          error: `Masih ada pengajuan perubahan ${r.field === 'full_name' ? 'Nama Lengkap' : 'Status Hunian'} yang menunggu. Batalkan dulu kalau ingin mengganti.`,
          success: false,
        }
      }
      return { error: requestError.message, success: false }
    }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return {
    error: '',
    success: true,
    message:
      requests.length > 0
        ? 'Profil tersimpan. Perubahan Nama Lengkap / Status Hunian dikirim ke Pengurus untuk disetujui.'
        : 'Profil berhasil diperbarui.',
  }
}

export async function cancelChangeRequest(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase
    .from('profile_change_requests')
    .update({ status: 'dibatalkan' })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'menunggu')

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { error: null }
}

export async function setMyStatus(content: string) {
  const text = content.trim()
  if (!text) return { error: 'Status tidak boleh kosong.' }
  if ([...text].length > 150) return { error: 'Status maksimal 150 karakter.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const now = new Date()
  const { error } = await supabase.from('profile_statuses').upsert({
    user_id: user.id,
    content: text,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/warga')
  return { error: null }
}

export async function clearMyStatus() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('profile_statuses').delete().eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/warga')
  return { error: null }
}