// Role yang WAJIB memakai 2FA (kode 6 digit dari aplikasi Authenticator).
// Harus sama dengan daftar di fungsi database public.admin_aal_ok() (Step 334).
export const MFA_ROLES = ['superadmin', 'paguyuban', 'staff_paguyuban', 'manajemen']

export function roleNeeds2fa(role: string | null | undefined) {
  return !!role && MFA_ROLES.includes(role)
}

// Selalu terbuka, termasuk untuk akun yang punya 2FA tapi belum memasukkan kode.
export const MFA_ALWAYS_OPEN = ['/login', '/darurat', '/auth', '/lupa-password', '/reset-password', '/offline.html', '/sw.js', '/manifest.webmanifest', '/robots.txt']

// Halaman yang tetap bisa dibuka admin yang BELUM memasang 2FA.
// Tombol Darurat sengaja selalu terbuka demi keselamatan.
export const MFA_OPEN_PATHS = [
  '/login',
  '/keamanan-akun',
  '/darurat',
  '/auth',
  '/lupa-password',
  '/offline.html',
  '/sw.js',
  '/manifest.webmanifest',
  '/robots.txt',
]