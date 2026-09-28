'use server'

import { publicError } from '@/lib/safe-error'
import { getMyAccess } from '@/lib/access'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'
import { passwordProblem } from '@/lib/security'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/log-error'

export type AdminAccountState = { error: string; success: boolean }

const MANAGED_ROLES = ['manajemen', 'paguyuban']

async function requireSuperadmin() {
  // getMyAccess juga memastikan kode 2FA sudah dimasukkan
  const access = await getMyAccess()
  return access.isSuperadmin ? { userId: access.userId } : null
}

// Hanya akun Manajemen / Ketua Paguyuban yang boleh diubah atau dihapus dari panel ini
// (Superadmin lain dan akun sendiri tidak bisa)
async function managedTarget(id: string, requesterId: string) {
  if (!id || id === requesterId) return false
  const { data } = await createAdminClient().from('profiles').select('role').eq('id', id).maybeSingle()
  return !!data && MANAGED_ROLES.includes(data.role as string)
}

export async function createAdminAccount(prevState: AdminAccountState, formData: FormData): Promise<AdminAccountState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role = formData.get('role') as string

  if (!fullName || !email || !password || !MANAGED_ROLES.includes(role)) {
    return { error: 'Nama, email, password, dan role wajib diisi dengan benar.', success: false }
  }

  const weak = passwordProblem(password)
  if (weak) {
    return { error: weak, success: false }
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

  try {
    const admin = createAdminClient()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      return { error: publicError(createError, 'Gagal membuat akun.'), success: false }
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: fullName,
        role,
        account_status: 'aktif',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('id', created.user.id)

    if (profileError) {
      return { error: `Akun dibuat tapi gagal set profil: ${publicError(profileError)}`, success: false }
    }

    await logAdminAction(user.id, 'tambah', 'akun', created.user.id, `Membuat akun ${role} "${fullName}"`, { email, role })
    revalidatePath('/superadmin')
    return { error: '', success: true }
  } catch (err) {
    await logError('kelola-admin: createAdminAccount', err)
    return {
      error: 'Gagal terhubung ke server Supabase (kemungkinan SUPABASE_SERVICE_ROLE_KEY belum/salah di Vercel). Hubungi developer.',
      success: false,
    }
  }
}

export async function updateAdminAccount(id: string, fullName: string, role: string) {
  const requester = await requireSuperadmin()
  if (!requester) return { error: 'Tidak punya akses.' }

  if (!MANAGED_ROLES.includes(role)) {
    return { error: 'Role tidak valid.' }
  }
  if (!(await managedTarget(id, requester.userId))) {
    return { error: 'Akun ini tidak bisa diubah dari panel ini.' }
  }
  if (!fullName?.trim() || fullName.length > 100) {
    return { error: 'Nama tidak valid.' }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', id)
    if (error) return { error: publicError(error) }

    await logAdminAction(requester.userId, 'ubah', 'akun', id, `Mengubah akun admin "${fullName}"`, { role })
    revalidatePath('/superadmin')
    return { error: null }
  } catch (err) {
    await logError('kelola-admin: updateAdminAccount', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function deleteAdminAccount(id: string) {
  const requester = await requireSuperadmin()
  if (!requester) return
  if (!(await managedTarget(id, requester.userId))) return

  try {
    const admin = createAdminClient()
    const { data: gone } = await admin.from('profiles').select('full_name, role').eq('id', id).maybeSingle()
    await admin.auth.admin.deleteUser(id)
    await logAdminAction(requester.userId, 'hapus', 'akun', id, `Menghapus akun admin "${gone?.full_name ?? '-'}"`, { role: gone?.role ?? null })
    revalidatePath('/superadmin')
  } catch (err) {
    await logError('kelola-admin: deleteAdminAccount', err)
  }
}