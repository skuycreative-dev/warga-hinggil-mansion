import type { AdminNavItem } from '@/components/admin/AdminLayout'
import type { MyAccess } from '@/lib/access'

// Menu sidebar portal admin, disesuaikan dengan role yang sedang login.
export function adminNavFor(access: MyAccess): AdminNavItem[] {
  if (access.isSuperadmin) {
    return [
      { title: 'Dashboard Superadmin', href: '/superadmin/dashboard' },
      { title: 'Keamanan & Reset Password', href: '/superadmin/keamanan' },
      { title: 'Log Aktivitas Admin', href: '/superadmin/log' },
      { title: 'Backup Data', href: '/superadmin/backup' },
      { title: 'Identitas Perumahan', href: '/superadmin/identitas' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Layanan Surat Warga', href: '/layanan' },
      { title: 'Status Hunian', href: '/status-hunian' },
      { title: 'Kelola Admin', href: '/superadmin' },
      { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
      { title: 'Kelola Fitur', href: '/superadmin/fitur' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Rumah Kosong', href: '/keamanan/rumah-kosong' },
      { title: 'Jadwal Jaga', href: '/keamanan/jadwal-jaga' },
      { title: 'Dashboard Security', href: '/security' },
      { title: 'Dashboard Paguyuban', href: '/paguyuban' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Pengumuman', href: '/pengumuman' },
      { title: 'Keamanan Akun (2FA)', href: '/keamanan-akun' },
    ]
  }

  if (access.isKetuaPaguyuban) {
    return [
      { title: 'Dashboard', href: '/paguyuban' },
      { title: 'Layanan Surat Warga', href: '/layanan' },
      { title: 'Status Hunian', href: '/status-hunian' },
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Rumah Kosong', href: '/keamanan/rumah-kosong' },
      { title: 'Jadwal Jaga', href: '/keamanan/jadwal-jaga' },
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
      { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
      { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Anggaran Paguyuban', href: '/anggaran' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Polling Warga', href: '/polling' },
      { title: 'Pengumuman', href: '/pengumuman' },
      { title: 'Keamanan Akun (2FA)', href: '/keamanan-akun' },
    ]
  }

  if (access.isSekretaris) {
    return [
      { title: 'Layanan Surat Warga', href: '/layanan' },
      { title: 'Status Hunian', href: '/status-hunian' },
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
      { title: 'Nomor Darurat', href: '/kelola-nomor-darurat' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Keamanan Akun (2FA)', href: '/keamanan-akun' },
    ]
  }

  if (access.role === 'manajemen') {
    return [
      { title: 'Dashboard', href: '/manajemen' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Katalog Tukang', href: '/tukang/kelola' },
      { title: 'Pengumuman', href: '/pengumuman' },
      { title: 'Keamanan Akun (2FA)', href: '/keamanan-akun' },
    ]
  }

  if (access.role === 'security') {
    return [
      { title: 'Dashboard', href: '/security' },
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Rumah Kosong', href: '/keamanan/rumah-kosong' },
      { title: 'Jadwal Jaga', href: '/keamanan/jadwal-jaga' },
      { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu' },
      { title: 'Tombol Darurat', href: '/darurat' },
    ]
  }

  if (access.isBendahara) {
    return [
      { title: 'Alert Darurat', href: '/keamanan/darurat' },
      { title: 'Peta Perumahan', href: '/peta' },
      { title: 'Anggaran Paguyuban', href: '/anggaran' },
      { title: 'Iuran IPL', href: '/iuran-ipl' },
      { title: 'Keamanan Akun (2FA)', href: '/keamanan-akun' },
    ]
  }

  return []
}