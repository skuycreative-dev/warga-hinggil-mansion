'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'
import { passwordProblem } from '@/lib/security'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/log-error'
import { getMyAccess } from '@/lib/access'
import { assignJabatan, revokeJabatan, type Jabatan } from '@/lib/jabatan'

export type StaffAccountState = { error: string; success: boolean }

// Paket T (30 Sep 2026): Sekretaris, Bendahara, dan Security TIDAK LAGI dibuat sebagai akun
// baru -- sekarang diangkat dari warga aktif lewat assignStaffJabatan/revokeStaffJabatan di
// bawah. Panel "Tambah Akun Staff" di halaman ini sekarang cuma untuk IT Support (bukan warga
// penghuni, dibuat langsung, dan hanya boleh oleh Superadmin -- lihat requester.canCreateItSupport).
const STAFF_OPTIONS: Record<string, { role: string; staff_position: string | null }> = {
  it_support: { role: 'it_support', staff_position: null },
}

const MANAGED_ROLES = ['it_support']

async function requireStaffManager() {
  const access = await getMyAccess()
  if (!access.canManageStaff) return null
  return { userId: access.userId, canCreateItSupport: access.canCreateItSupport }
}

const IT_SUPPORT_ONLY_SUPERADMIN = 'Akun IT Support hanya bisa dibuat, diubah, atau dihapus oleh Superadmin.'

export async function createStaffAccount(prevState: StaffAccountState, formData: FormData): Promise<StaffAccountState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const option = STAFF_OPTIONS[(formData.get('role') as string) ?? '']

  if (!fullName || !email || !password || !option) {
    return { error: 'Nama, email, password, dan role wajib diisi dengan benar.', success: false }
  }

  const weak = passwordProblem(password)
  if (weak) {
    return { error: weak, success: false }
  }

  const requester = await requireStaffManager()
  if (!requester) {
    return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }
  }

  if (option.role === 'it_support' && !requester.canCreateItSupport) {
    return { error: IT_SUPPORT_ONLY_SUPERADMIN, success: false }
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
        role: option.role,
        staff_position: option.staff_position,
        account_status: 'aktif',
        verified_at: new Date().toISOString(),
        verified_by: requester.userId,
      })
      .eq('id', created.user.id)

    if (profileError) {
      return { error: `Akun dibuat tapi gagal set profil: ${publicError(profileError)}`, success: false }
    }

    await logAdminAction(requester.userId, 'tambah', 'akun', created.user.id, `Membuat akun staff "${fullName}"`, { email, role: option.role, jabatan: option.staff_position })
    revalidatePath('/paguyuban/kelola-staff')
    return { error: '', success: true }
  } catch (err) {
    await logError('kelola-staff: createStaffAccount', err)
    return {
      error: 'Gagal terhubung ke server Supabase (kemungkinan SUPABASE_SERVICE_ROLE_KEY belum/salah di Vercel). Hubungi developer.',
      success: false,
    }
  }
}

export async function updateStaffAccount(id: string, fullName: string, roleValue: string) {
  const requester = await requireStaffManager()
  if (!requester) return { error: 'Tidak punya akses.' }

  const option = STAFF_OPTIONS[roleValue]
  if (!option) {
    return { error: 'Role tidak valid.' }
  }

  try {
    const admin = createAdminClient()

    const { data: target } = await admin.from('profiles').select('role').eq('id', id).maybeSingle()
    if (!target || !MANAGED_ROLES.includes(target.role)) {
      return { error: 'Akun ini tidak bisa diubah dari Kelola Staff.' }
    }

    if ((target.role === 'it_support' || option.role === 'it_support') && !requester.canCreateItSupport) {
      return { error: IT_SUPPORT_ONLY_SUPERADMIN }
    }

    const { error } = await admin
      .from('profiles')
      .update({ full_name: fullName, role: option.role, staff_position: option.staff_position })
      .eq('id', id)
    if (error) return { error: publicError(error) }

    await logAdminAction(requester.userId, 'ubah', 'akun', id, `Mengubah akun staff "${fullName}"`, { role: option.role, jabatan: option.staff_position })
    revalidatePath('/paguyuban/kelola-staff')
    return { error: null }
  } catch (err) {
    await logError('kelola-staff: updateStaffAccount', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function deleteStaffAccount(id: string) {
  const requester = await requireStaffManager()
  if (!requester) return

  try {
    const admin = createAdminClient()

    const { data: target } = await admin.from('profiles').select('role').eq('id', id).maybeSingle()
    if (!target || !MANAGED_ROLES.includes(target.role)) return
    if (target.role === 'it_support' && !requester.canCreateItSupport) return

    await admin.auth.admin.deleteUser(id)

    await logAdminAction(requester.userId, 'hapus', 'akun', id, 'Menghapus akun staff', { role: target.role })
    revalidatePath('/paguyuban/kelola-staff')
  } catch (err) {
    await logError('kelola-staff: deleteStaffAccount', err)
  }
}

const JABATAN_FROM_STAFF_PAGE: Jabatan[] = ['sekretaris', 'bendahara', 'security']

// Angkat seorang warga aktif jadi Sekretaris/Bendahara/Security.
export async function assignStaffJabatan(targetId: string, jabatan: string) {
  const requester = await requireStaffManager()
  if (!requester) return { error: 'Kamu tidak punya akses untuk fitur ini.' }
  if (!JABATAN_FROM_STAFF_PAGE.includes(jabatan as Jabatan)) {
    return { error: 'Jabatan tidak valid dari halaman ini.' }
  }
  return assignJabatan({ targetId, jabatan: jabatan as Jabatan, assignedBy: requester.userId })
}

// Cabut jabatan Sekretaris/Bendahara/Security -- akun kembali jadi warga biasa.
export async function revokeStaffJabatan(targetId: string) {
  const requester = await requireStaffManager()
  if (!requester) return { error: 'Kamu tidak punya akses untuk fitur ini.' }

  const admin = createAdminClient()
  const { data: target } = await admin.from('profiles').select('role').eq('id', targetId).maybeSingle()
  const bolehDicabutDariSini = !!target && (target.role === 'security' || target.role === 'staff_paguyuban')
  if (!bolehDicabutDariSini) {
    return { error: 'Akun ini tidak bisa dicabut dari halaman ini.' }
  }
  return revokeJabatan({ targetId, revokedBy: requester.userId })
}