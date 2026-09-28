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
  canCreateItSupport: boolean
  canManageFinance: boolean
  canViewFinance: boolean
  canManageIpl: boolean
  canViewIpl: boolean
  canConfirmIplDisbursement: boolean
  canRespondEmergency: boolean
  canPatrol: boolean
  canManageTukang: boolean
  isServiceStaff: boolean
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
    // IT Support hanya dibuat/diubah/dihapus oleh Superadmin (keputusan 28 Sep 2026)
    canCreateItSupport: isSuperadmin,
    // Kebutuhan #5: input kas & iuran hanya Ketua Paguyuban dan Bendahara (+ Superadmin)
    canManageFinance: isSuperadmin || isKetuaPaguyuban || isBendahara,
    // Kebutuhan #6: laporan keuangan untuk warga (terverifikasi) dan pengurus Paguyuban
    canViewFinance:
      isSuperadmin || isKetuaPaguyuban || role === 'staff_paguyuban' || (role === 'warga' && (profile?.account_status ?? '') === 'aktif'),
    // IPL dibayar warga ke Manajemen (keputusan 28 Sep 2026): tagihan, status, denda, bukti -> Admin Manajemen (+ Superadmin)
    canManageIpl: isSuperadmin || role === 'manajemen',
    // Yang boleh melihat halaman Iuran IPL: warga terverifikasi (rumahnya sendiri), pengurus Paguyuban, Manajemen
    canViewIpl:
      isSuperadmin ||
      role === 'manajemen' ||
      isKetuaPaguyuban ||
      role === 'staff_paguyuban' ||
      (role === 'warga' && (profile?.account_status ?? '') === 'aktif'),
    // Setoran IPL dari Manajemen masuk kas Paguyuban setelah dikonfirmasi Ketua / Bendahara
    canConfirmIplDisbursement: isSuperadmin || isKetuaPaguyuban || isBendahara,
    // Pusat Alert Darurat (Step 321): Security, Pengurus Paguyuban, Manajemen, Superadmin
    canRespondEmergency: ['security', 'paguyuban', 'staff_paguyuban', 'manajemen', 'superadmin'].includes(role),
    // Rumah Kosong & jadwal jaga: Security, Ketua Paguyuban, Superadmin
    canPatrol: ['security', 'paguyuban', 'superadmin'].includes(role),
    // Katalog Tukang: hapus postingan bermasalah
    canManageTukang: ['manajemen', 'paguyuban', 'superadmin'].includes(role),
    // Layanan Surat & status hunian: Ketua Paguyuban, Sekretaris, Superadmin (Step 327)
    isServiceStaff: isSuperadmin || isKetuaPaguyuban || isSekretaris,
    roleLabel,
  }
}