'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type StaffAccountState = { error: string; success: boolean }

const MANAGED_ROLES = ['security', 'it_support']
const ALLOWED_CALLER_ROLES = ['paguyuban', 'superadmin']

async function requireStaffManager() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_CALLER_ROLES.includes(profile.role)) {
    return null
  }

  return supabase
}

export async function createStaffAccount(prevState: StaffAccountState, formData: FormData): Promise<StaffAccountState> {
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

  const requester = await requireStaffManager()
  if (!requester) {
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

  revalidatePath('/paguyuban/kelola-staff')
  return { error: '', success: true }
}

export async function updateStaffAccount(id: string, fullName: string, role: string) {
  const requester = await requireStaffManager()
  if (!requester) return { error: 'Tidak punya akses.' }

  if (!MANAGED_ROLES.includes(role)) {
    return { error: 'Role tidak valid.' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/paguyuban/kelola-staff')
  return { error: null }
}

export async function deleteStaffAccount(id: string) {
  const requester = await requireStaffManager()
  if (!requester) return

  const admin = createAdminClient()
  await admin.auth.admin.deleteUser(id)
  revalidatePath('/paguyuban/kelola-staff')
}
