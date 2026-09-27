import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Satu tempat untuk aturan "siapa boleh apa" di portal admin.
// Struktur role (keputusan 27 Sep 2026):
//   superadmin
//   paguyuban            = Admin Paguyuban / Ketua RT
//   staff_paguyuban      + staff_position 'sekretaris' | 'bendahara'
//   manajemen, security, it_support, warga
export type MyAccess = {
  userId: string
  fullName: string
  role: string
  staffPosition: string | null
  accountStatus: string
  isSuperadmin: boolean
  isKetuaPaguyuban: boolean
  isSekretaris: boolean
  isBendahara: boolean
  canVerifyAccounts: boolean
  canManageEmergencyContacts: boolean
  canManageStaff: boolean
  roleLabel: string
}

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin',
  paguyuban: 'Ketua Paguyuban',
  manajemen: 'Admin Manajemen',
  security: 'Security',
  it_support: 'IT Support',
  warga: 'Warga',
}

export async function getMyAccess(): Promise<MyAccess> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, staff_position, account_status')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'warga'
  const staffPosition = profile?.staff_position ?? null

  const isSuperadmin = role === 'superadmin'
  const isKetuaPaguyuban = role === 'paguyuban'
  const isSekretaris = role === 'staff_paguyuban' && staffPosition === 'sekretaris'
  const isBendahara = role === 'staff_paguyuban' && staffPosition === 'bendahara'

  const roleLabel = isSekretaris
    ? 'Sekretaris Paguyuban'
    : isBendahara
      ? 'Bendahara Paguyuban'
      : ROLE_LABEL[role] ?? role

  return {
    userId: user.id,
    fullName: profile?.full_name ?? 'Pengguna',
    role,
    staffPosition,
    accountStatus: profile?.account_status ?? 'aktif',
    isSuperadmin,
    isKetuaPaguyuban,
    isSekretaris,
    isBendahara,
    canVerifyAccounts: isSuperadmin || isKetuaPaguyuban || isSekretaris,
    canManageEmergencyContacts: isSuperadmin || isKetuaPaguyuban || isSekretaris,
    canManageStaff: isSuperadmin || isKetuaPaguyuban,
    roleLabel,
  }
}