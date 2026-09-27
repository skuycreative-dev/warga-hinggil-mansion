'use server'

import { createClient } from '@/lib/supabase/server'
import { assignHousehold, validateHousehold, type HouseholdInput } from '@/lib/household'

export type RegisterState = {
  error: string
  success: boolean
  needsFamilyConfirmation?: boolean
}

export async function registerUser(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const fullName = ((formData.get('full_name') as string) ?? '').trim()
  const nickname = ((formData.get('nickname') as string) ?? '').trim()
  const email = ((formData.get('email') as string) ?? '').trim()
  const password = (formData.get('password') as string) ?? ''
  const phone = ((formData.get('phone') as string) ?? '').trim()
  const nik = ((formData.get('nik') as string) ?? '').trim()

  const household: HouseholdInput = {
    familyRole: (formData.get('family_role') as string) ?? '',
    nomorRumah: (formData.get('nomor_rumah') as string) ?? '',
    houseId: (formData.get('house_id') as string) ?? '',
    occupancyStatus: (formData.get('occupancy_status') as string) ?? '',
  }

  if (!fullName || !email || !password || !phone || !nik) {
    return { error: 'Semua field wajib diisi.', success: false }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus 16 digit angka sesuai KTP.', success: false }
  }

  if (nickname.length > 30) {
    return { error: 'Nama Panggilan maksimal 30 karakter.', success: false }
  }

  const supabase = await createClient()

  // Cek data rumah SEBELUM akun dibuat
  const householdError = await validateHousehold(supabase, household)
  if (householdError) return { error: householdError, success: false }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message ?? 'Gagal membuat akun.', success: false }
  }

  const userId = signUpData.user.id

  if (!signUpData.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      return {
        error:
          'Akun berhasil dibuat, tapi belum bisa login otomatis (kemungkinan email perlu dikonfirmasi dulu). Hubungi admin untuk mengaktifkan akun kamu, atau matikan "Confirm Email" di pengaturan Supabase.',
        success: false,
      }
    }
  }

  const { error } = await assignHousehold(supabase, userId, household, {
    phone,
    nik,
    nickname: nickname || null,
  })

  if (error) {
    return {
      error: `${error} Akun sudah dibuat: masuk dengan email & password tadi untuk melengkapi data.`,
      success: false,
    }
  }

  return { error: '', success: true, needsFamilyConfirmation: household.familyRole !== 'kepala_keluarga' }
}