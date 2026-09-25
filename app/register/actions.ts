'use server'

import { createClient } from '@/lib/supabase/server'

export type RegisterState = {
  error: string
  success: boolean
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const nomorRumah = (formData.get('nomor_rumah') as string)?.trim()
  const familyRole = formData.get('family_role') as string

  if (!fullName || !email || !password || !phone || !nomorRumah || !familyRole) {
    return { error: 'Semua field wajib diisi.', success: false }
  }

  const supabase = await createClient()

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message ?? 'Gagal membuat akun.', success: false }
  }

  const userId = signUpData.user.id

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
      return { error: `Gagal menyimpan data rumah: ${houseError.message}`, success: false }
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
      house_id: houseId,
      family_role: familyRole,
      is_house_owner: isHouseOwner,
    })
    .eq('id', userId)

  if (profileError) {
    return { error: `Gagal menyimpan profil: ${profileError.message}`, success: false }
  }

  return { error: '', success: true }
}
