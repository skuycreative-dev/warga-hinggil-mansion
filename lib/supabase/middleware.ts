import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PENTING: jangan taruh logika apa pun di antara createServerClient dan
  // supabase.auth.getUser() di bawah ini. Kesalahan kecil di sini bisa
  // menyebabkan user tiba-tiba ter-logout secara acak dan sulit dilacak.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ---------------------------------------------------------------------
  // Penjaga halaman terpusat (sebelumnya hanya dicek di masing-masing halaman).
  // Database tetap menjadi pengaman terakhir; ini supaya pengguna diarahkan
  // dengan rapi, bukan melihat pesan error teknis.
  // ---------------------------------------------------------------------
  const path = request.nextUrl.pathname
  const portalRule = PORTAL_RULES.find((r) => path === r.prefix || path.startsWith(r.prefix + '/'))
  const isWargaFeature =
    !portalRule && WARGA_FEATURES.some((prefix) => path === prefix || path.startsWith(prefix + '/'))

  if (user && (portalRule || isWargaFeature)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, staff_position, account_status')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role ?? 'warga'
    const roleKey = role === 'staff_paguyuban' ? `staff_paguyuban:${profile?.staff_position ?? ''}` : role

    let target: string | null = null
    if (portalRule && !portalRule.roles.includes(roleKey)) {
      target = '/dashboard'
    } else if (isWargaFeature && role === 'it_support') {
      target = '/it-support'
    } else if (isWargaFeature && role === 'warga' && profile?.account_status !== 'aktif') {
      target = '/dashboard'
    }

    if (target) {
      const url = request.nextUrl.clone()
      url.pathname = target
      url.search = ''
      const redirect = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
      return redirect
    }
  }

  return supabaseResponse
}

// Portal admin: hanya role tertentu (Sekretaris/Bendahara ditulis "staff_paguyuban:jabatan").
// Urutan penting: aturan yang lebih spesifik ditulis lebih dulu.
const PORTAL_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: '/superadmin', roles: ['superadmin'] },
  { prefix: '/paguyuban/kelola-staff', roles: ['superadmin', 'paguyuban'] },
  { prefix: '/paguyuban/moderasi-forum', roles: ['superadmin', 'paguyuban'] },
  { prefix: '/paguyuban', roles: ['superadmin', 'paguyuban'] },
  { prefix: '/verifikasi-akun', roles: ['superadmin', 'paguyuban', 'staff_paguyuban:sekretaris'] },
  { prefix: '/kelola-nomor-darurat', roles: ['superadmin', 'paguyuban', 'staff_paguyuban:sekretaris'] },
  { prefix: '/manajemen', roles: ['superadmin', 'manajemen'] },
  { prefix: '/tukang/kelola', roles: ['superadmin', 'manajemen', 'paguyuban'] },
  { prefix: '/it-support', roles: ['superadmin', 'it_support'] },
  { prefix: '/security', roles: ['superadmin', 'security'] },
  { prefix: '/keamanan', roles: ['superadmin', 'security'] },
]

// Fitur warga: terkunci untuk warga yang belum diverifikasi, dan untuk IT Support.
// Tombol Darurat (/darurat) dan Profil (/profile) sengaja TIDAK ada di sini.
const WARGA_FEATURES = ['/forum', '/warga', '/chat', '/pengumuman', '/pengaduan', '/qr-tamu', '/anggaran', '/polling', '/tukang', '/rumah-kosong']