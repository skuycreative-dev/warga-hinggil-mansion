'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminAccountState = { error: string; success: boolean }

const MANAGED_ROLES = ['manajemen', 'paguyuban']

async function requireSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || profile.role !== 'superadmin') {
    return null
  }

  return supabase
}

export async function createAdminAccount(prevState: AdminAccountState, formData: FormData): Promise<AdminAccountState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role = formData.get('role') as string

  if (!fullName || !email || !password || !MANAGED_ROLES.includes(role)) {
    return { error: 'Nama, email, password, dan role wajib diisi dengan benar.', success: false }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!myProfile || myProfile.role !== 'superadmin') {
    return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }
  }

  const admin = createAdminClient()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return { error: createError?.message ?? 'Gagal membuat akun.', success: false }
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ full_name: fullName, role })
    .eq('id', created.user.id)

  if (profileError) {
    return { error: `Akun dibuat tapi gagal set profil: ${profileError.message}`, success: false }
  }

  revalidatePath('/superadmin')
  return { error: '', success: true }
}

export async function updateAdminAccount(id: string, fullName: string, role: string) {
  const admin = createAdminClient()
  const requester = await requireSuperadmin()
  if (!requester) return { error: 'Tidak punya akses.' }

  if (!MANAGED_ROLES.includes(role)) {
    return { error: 'Role tidak valid.' }
  }

  const { error } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/superadmin')
  return { error: null }
}

export async function deleteAdminAccount(id: string) {
  const requester = await requireSuperadmin()
  if (!requester) return

  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(id)
  revalidatePath('/superadmin')
}
