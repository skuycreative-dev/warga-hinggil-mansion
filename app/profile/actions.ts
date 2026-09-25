'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UpdateProfileState = {
  error: string
  success: boolean
}

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const nik = (formData.get('nik') as string)?.trim()
  const familyRole = formData.get('family_role') as string
  const occupancyStatus = formData.get('occupancy_status') as string

  if (!fullName || !phone || !familyRole || !occupancyStatus) {
    return { error: 'Nama, HP, peran keluarga, dan status hunian wajib diisi.', success: false }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (nik) {
    const { data: existingNik } = await supabase
      .from('profiles')
      .select('id')
      .eq('nik', nik)
      .neq('id', user.id)
      .maybeSingle()

    if (existingNik) {
      return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      bio: bio || null,
      nik: nik || null,
      family_role: familyRole,
      occupancy_status: occupancyStatus,
    })
    .eq('id', user.id)

  if (error) {
    if ((error as any).code === '23505') {
      return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
    }
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}
