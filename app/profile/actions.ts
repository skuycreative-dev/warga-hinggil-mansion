'use server'

import { publicError } from '@/lib/safe-error'
import { privateFields } from '@/lib/private-fields'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { passwordProblem, siteOrigin } from '@/lib/security'

type SimpleResult = { ok: boolean; error: string | null; message?: string }

export type UpdateProfileState = {
  error: string
  success: boolean
  message?: string
}

const FAMILY_ROLES = ['kepala_keluarga', 'ibu_rumah_tangga', 'anggota_keluarga', 'asisten_rumah_tangga', 'lainnya']
// Peran yang membuka akses khusus rumah (mis. Keuangan Rumah Tangga): hanya lewat Pengurus setelah terverifikasi
const PROTECTED_FAMILY_ROLES = ['kepala_keluarga', 'ibu_rumah_tangga']

const REQUEST_LABEL: Record<string, string> = {
  full_name: 'Nama Lengkap',
  occupancy_status: 'Status Hunian',
  family_role: 'Peran Keluarga',
}
const OCCUPANCY = ['pemilik', 'penyewa', 'sementara']

// Aturan (keputusan 27 Sep 2026):
// - Bebas diubah sendiri: Nama Panggilan, Nomor HP, Bio, peran keluarga (kecuali status Kepala Keluarga).
// - Lewat pengajuan: Nama Lengkap (Ketua Paguyuban / Superadmin). Status Hunian: menu Status Hunian (pemilik rumah).
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
    .select('full_name, account_status, family_role, occupancy_status, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!current) return { error: 'Profil tidak ditemukan.', success: false }
  const currentNik = (await privateFields(supabase, [user.id])).get(user.id)?.nik ?? null

  const inCompletion = !currentNik || current.account_status === 'menunggu_verifikasi'

  const update: Record<string, string | null> = {
    nickname: nickname || null,
    phone,
    bio: bio || null,
  }

  const requests: { field: 'full_name' | 'occupancy_status' | 'family_role'; old_value: string | null; new_value: string }[] = []

  if (familyRole && familyRole !== current.family_role) {
    if (!FAMILY_ROLES.includes(familyRole)) return { error: 'Peran keluarga tidak valid.', success: false }
    const touchesProtected = PROTECTED_FAMILY_ROLES.includes(familyRole) || PROTECTED_FAMILY_ROLES.includes(current.family_role ?? '')
    if (touchesProtected && !inCompletion) {
      // Superadmin tidak punya siapa pun di atasnya untuk menyetujui, jadi perubahan perannya sendiri
      // langsung berlaku (keputusan 29 Sep 2026). Paguyuban/Sekretaris/Bendahara tetap lewat pengajuan
      // -- lihat approveChangeRequest di verifikasi-akun/actions.ts untuk siapa yang boleh menyetujui.
      if (current.role === 'superadmin') {
        update.family_role = familyRole
      } else {
        // Jadi Ibu Rumah Tangga -> dikonfirmasi Kepala Keluarga (atau Pengurus); peran Kepala Keluarga -> Pengurus
        requests.push({ field: 'family_role', old_value: current.family_role ?? null, new_value: familyRole })
      }
    } else {
      update.family_role = familyRole
    }
  }

  if (inCompletion) {
    if (!/^\d{16}$/.test(nik)) return { error: 'NIK harus terdiri dari 16 digit angka.', success: false }
    if (occupancyStatus && !OCCUPANCY.includes(occupancyStatus)) return { error: 'Status hunian tidak valid.', success: false }

    const { data: existingNik } = await supabase.rpc('nik_in_use', { p_nik: nik })
    if (existingNik === true) return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }

    update.full_name = fullName
    update.nik = nik
    if (occupancyStatus) update.occupancy_status = occupancyStatus
  } else {
    if (fullName !== (current.full_name ?? '')) {
      requests.push({ field: 'full_name', old_value: current.full_name ?? null, new_value: fullName })
    }
    // Status hunian setelah terverifikasi diubah per rumah oleh pemilik rumah (menu Status Hunian, Step 327)
  }

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id)

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
    }
    return { error: publicError(error), success: false }
  }

  for (const r of requests) {
    const { error: requestError } = await supabase
      .from('profile_change_requests')
      .insert({ user_id: user.id, field: r.field, old_value: r.old_value, new_value: r.new_value })

    if (requestError) {
      if ((requestError as { code?: string }).code === '23505') {
        return {
          error: `Masih ada pengajuan perubahan ${REQUEST_LABEL[r.field]} yang menunggu. Batalkan dulu kalau ingin mengganti.`,
          success: false,
        }
      }
      return { error: publicError(requestError), success: false }
    }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')

  return {
    error: '',
    success: true,
    message:
      requests.length > 0
        ? `Profil tersimpan. Pengajuan ${requests.map((r) => REQUEST_LABEL[r.field]).join(' & ')} sudah dikirim${
            requests.some((r) => r.field === 'family_role' && r.new_value === 'ibu_rumah_tangga')
              ? ' (peran Ibu Rumah Tangga dikonfirmasi Kepala Keluarga rumahmu atau Pengurus)'
              : ' ke Pengurus untuk disetujui'
          }.`
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

  if (error) return { error: publicError(error) }

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

  if (error) return { error: publicError(error) }

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

  if (error) return { error: publicError(error) }

  revalidatePath('/profile')
  revalidatePath('/warga')
  return { error: null }
}

// ---------------------------------------------------------------------
// Ubah Email & Kata Sandi (Kebutuhan #1, 29 Sep 2026) -- sebelumnya tidak ada sama sekali di Edit
// Profil, warga cuma bisa lewat Lupa Password (reset lewat link) kalau lupa. Password lama diminta dulu
// (re-autentikasi) sebelum email/password diganti, supaya sesi yang dibajak tidak bisa ambil alih akun.
// ---------------------------------------------------------------------

async function reauth(supabase: Awaited<ReturnType<typeof createClient>>, currentPassword: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false as const, error: 'Sesi berakhir. Masuk lagi.' }

  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
  if (error) return { ok: false as const, error: 'Password saat ini salah.' }
  return { ok: true as const, user }
}

export async function changeEmail(currentPassword: string, newEmail: string): Promise<SimpleResult> {
  const email = (newEmail ?? '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Format email tidak valid.' }
  if (!currentPassword) return { ok: false, error: 'Masukkan password saat ini untuk konfirmasi.' }

  const supabase = await createClient()
  const auth = await reauth(supabase, currentPassword)
  if (!auth.ok) return { ok: false, error: auth.error }
  if (auth.user.email?.toLowerCase() === email) return { ok: false, error: 'Email baru sama dengan email sekarang.' }

  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${await siteOrigin()}/auth/callback` })
  if (error) {
    if (/already registered|already exists|duplicate/i.test(error.message)) return { ok: false, error: 'Email ini sudah dipakai akun lain.' }
    return { ok: false, error: 'Gagal mengubah email. Coba lagi.' }
  }

  return {
    ok: true,
    error: null,
    message: 'Link konfirmasi sudah dikirim ke email lama dan email baru. Buka salah satu link itu untuk menyelesaikan penggantian.',
  }
}

export async function changePassword(currentPassword: string, newPassword: string, confirm: string): Promise<SimpleResult> {
  if (newPassword !== confirm) return { ok: false, error: 'Konfirmasi password baru tidak sama.' }
  const weak = passwordProblem(newPassword ?? '')
  if (weak) return { ok: false, error: weak }
  if (!currentPassword) return { ok: false, error: 'Masukkan password saat ini untuk konfirmasi.' }
  if (currentPassword === newPassword) return { ok: false, error: 'Password baru tidak boleh sama dengan password lama.' }

  const supabase = await createClient()
  const auth = await reauth(supabase, currentPassword)
  if (!auth.ok) return { ok: false, error: auth.error }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    if (error.code === 'weak_password') return { ok: false, error: 'Password terlalu lemah. Pakai minimal 8 karakter berisi huruf dan angka.' }
    return { ok: false, error: 'Gagal mengubah password. Coba lagi.' }
  }

  // Sesi lain (HP/perangkat lain) dikeluarkan; sesi yang sedang dipakai tetap login
  try {
    await supabase.auth.signOut({ scope: 'others' })
  } catch {
    // abaikan -- perubahan password sudah berhasil walau ini gagal
  }

  return { ok: true, error: null, message: 'Password berhasil diganti. Perangkat lain otomatis keluar.' }
}