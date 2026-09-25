'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CompleteProfileState = {
  error: string
}

export async function completeProfile(
  prevState: CompleteProfileState,
  formData: FormData
): Promise<CompleteProfileState> {
  const phone = formData.get('phone') as string
  const nik = (formData.get('nik') as string)?.trim()
  const nomorRumah = (formData.get('nomor_rumah') as string)?.trim()
  const familyRole = formData.get('family_role') as string
  const occupancyStatus = formData.get('occupancy_status') as string

  if (!phone || !nik || !nomorRumah || !familyRole || !occupancyStatus) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus 16 digit angka sesuai KTP.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingNik } = await supabase
    .from('profiles')
    .select('id')
    .eq('nik', nik)
    .neq('id', user.id)
    .maybeSingle()

  if (existingNik) {
    return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
  }

  let houseId: string | null = null

  const { data: existingHouse } = await supabase
    .from('houses')
    .select('id')
    .ilike('nomor_rumah', nomorRumah)
    .maybeSingle()

  if (existingHouse) {
    houseId = existingHouse.id
  } else {
    const { data: newHouse, error: houseError } = await supabase
      .from('houses')
      .insert({ nomor_rumah: nomorRumah })
      .select('id')
      .single()

    if (houseError) {
      return { error: `Gagal menyimpan data rumah: ${houseError.message}` }
    }
    houseId = newHouse.id
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('house_id', houseId)

  const isHouseOwner = !count || count === 0

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone,
      nik,
      house_id: houseId,
      family_role: familyRole,
      occupancy_status: occupancyStatus,
      is_house_owner: isHouseOwner,
    })
    .eq('id', user.id)

  if (profileError) {
    if (profileError.code === '23505') {
      return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
    }
    return { error: `Gagal menyimpan profil: ${profileError.message}` }
  }

  redirect('/dashboard')
}
