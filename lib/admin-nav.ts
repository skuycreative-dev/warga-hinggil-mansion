import type { AdminNavItem } from '@/components/admin/AdminLayout'
import type { MyAccess } from '@/lib/access'

// Menu sidebar portal admin, disesuaikan dengan role yang sedang login.
export function adminNavFor(access: MyAccess): AdminNavItem[] {
  if (access.isSuperadmin) {
    return [
      { title: 'Kelola Admin', href: '/superadmin' },
      { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
      { title: 'Kelola Fitur', href: '/superadmin/fitur' },
      { title: 'Dashboard Paguyuban', href: '/paguyuban' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Pengumuman', href: '/pengumuman' },
    ]
  }

  if (access.isKetuaPaguyuban) {
    return [
      { title: 'Dashboard', href: '/paguyuban' },
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
      { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
      { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Anggaran Paguyuban', href: '/anggaran' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Polling Warga', href: '/polling' },
      { title: 'Pengumuman', href: '/pengumuman' },
    ]
  }

  if (access.isSekretaris) {
    return [
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
    ]
  }

  if (access.role === 'manajemen') {
    return [
      { title: 'Dashboard', href: '/manajemen' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Pengumuman', href: '/pengumuman' },
    ]
  }

  if (access.isBendahara) {
    return [
      { title: 'Anggaran Paguyuban', href: '/anggaran' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
    ]
  }

  return []
}