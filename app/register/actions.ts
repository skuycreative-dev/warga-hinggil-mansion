'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type RegisterState = { error: string | null }

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const nomorRumahRaw = formData.get('nomor_rumah') as string
  const familyRole = formData.get('family_role') as string

  if (!email || !password || !fullName || !nomorRumahRaw) {
    return { error: 'Semua field wajib diisi.' }
  }

  const nomorRumah = nomorRumahRaw.trim().toUpperCase()
  const supabase = await createClient()

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message ?? 'Registrasi gagal, coba lagi.' }
  }

  const userId = signUpData.user.id

  const { data: existingHouse } = await supabase
    .from('houses')
    .select('id')
    .ilike('nomor_rumah', nomorRumah)
    .maybeSingle()

  let houseId = existingHouse?.id as string | undefined

  if (!houseId) {
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

  const isHouseOwner = (count ?? 0) === 0

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
    return { error: `Akun terbuat tapi gagal melengkapi profil: ${profileError.message}` }
  }

  redirect('/login?registered=1')
}
