'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { assignHousehold, type HouseholdInput } from '@/lib/household'

export type CompleteProfileState = {
  error: string
}

export async function completeProfile(prevState: CompleteProfileState, formData: FormData): Promise<CompleteProfileState> {
  const phone = ((formData.get('phone') as string) ?? '').trim()
  const nik = ((formData.get('nik') as string) ?? '').trim()
  const nickname = ((formData.get('nickname') as string) ?? '').trim()

  const household: HouseholdInput = {
    familyRole: (formData.get('family_role') as string) ?? '',
    nomorRumah: (formData.get('nomor_rumah') as string) ?? '',
    houseId: (formData.get('house_id') as string) ?? '',
    occupancyStatus: (formData.get('occupancy_status') as string) ?? '',
  }

  if (!phone || !nik) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus 16 digit angka sesuai KTP.' }
  }

  if (nickname.length > 30) {
    return { error: 'Nama Panggilan maksimal 30 karakter.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingNik } = await supabase.rpc('nik_in_use', { p_nik: nik })

  if (existingNik === true) {
    return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
  }

  const { error } = await assignHousehold(supabase, user.id, household, {
    phone,
    nik,
    nickname: nickname || null,
  })

  if (error) return { error }

  redirect('/dashboard')
}