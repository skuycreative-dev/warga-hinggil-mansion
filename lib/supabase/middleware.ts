import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { featureForPath } from '@/lib/features'
import { MFA_ALWAYS_OPEN, MFA_OPEN_PATHS, roleNeeds2fa } from '@/lib/mfa'

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

  // Fitur yang bisa dimatikan Superadmin (white label). Halaman portal admin tidak ikut dikunci.
  const featureKey = portalRule ? null : featureForPath(path)

  // Profil hanya diambil sekali per permintaan
  let profilePromise: Promise<{ role: string; staff_position: string | null; account_status: string } | null> | null = null
  const loadProfile = () => {
    if (!profilePromise && user) {
      profilePromise = Promise.resolve(
        supabase.from('profiles').select('role, staff_position, account_status').eq('id', user.id).maybeSingle()
      ).then(({ data }) => (data as { role: string; staff_position: string | null; account_status: string } | null) ?? null)
    }
    return profilePromise ?? Promise.resolve(null)
  }

  // ---------------------------------------------------------------------
  // 2FA (Step 334): akun yang punya perangkat 2FA wajib memasukkan kode;
  // akun admin yang belum memasang 2FA diarahkan untuk memasangnya.
  // Tombol Darurat dan halaman login selalu terbuka.
  // ---------------------------------------------------------------------
  const isOpen = (list: string[]) => list.some((p) => path === p || path.startsWith(p + '/'))
  if (user && !isOpen(MFA_ALWAYS_OPEN)) {
    let mfaTarget: string | null = null
    const hasFactor = (user.factors ?? []).some((f) => f.status === 'verified')
    if (hasFactor) {
      // Punya 2FA tapi belum memasukkan kode: semua halaman (termasuk Keamanan Akun) ditutup
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.currentLevel !== 'aal2') {
        mfaTarget = `/login/2fa?next=${encodeURIComponent(path + request.nextUrl.search)}`
      }
    } else if (!isOpen(MFA_OPEN_PATHS)) {
      const me = await loadProfile()
      if (roleNeeds2fa(me?.role)) mfaTarget = '/keamanan-akun?wajib=1'
    }

    if (mfaTarget) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new NextResponse('Verifikasi 2 langkah diperlukan.', { status: 401 })
      }
      const redirect = NextResponse.redirect(new URL(mfaTarget, request.url))
      supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
      return redirect
    }
  }

  if (user && (portalRule || isWargaFeature || featureKey)) {
    const profile = await loadProfile()

    const role = profile?.role ?? 'warga'
    const roleKey = role === 'staff_paguyuban' ? `staff_paguyuban:${profile?.staff_position ?? ''}` : role

    let target: string | null = null
    let lockedFeature: string | null = null

    if (featureKey && role !== 'superadmin') {
      const { data: feature } = await supabase.from('app_features').select('enabled').eq('key', featureKey).maybeSingle()
      if (feature && feature.enabled === false) lockedFeature = featureKey
    }

    if (lockedFeature) {
      target = '/dashboard'
    } else if (portalRule && !portalRule.roles.includes(roleKey)) {
      target = '/dashboard'
    } else if (isWargaFeature && role === 'it_support') {
      target = '/it-support'
    } else if (isWargaFeature && role === 'warga' && profile?.account_status !== 'aktif') {
      target = '/dashboard'
    }

    if (target) {
      const url = request.nextUrl.clone()
      url.pathname = target
      url.search = lockedFeature ? `?terkunci=${lockedFeature}` : ''
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
  {
    prefix: '/keamanan/darurat',
    roles: ['superadmin', 'security', 'paguyuban', 'manajemen', 'staff_paguyuban:sekretaris', 'staff_paguyuban:bendahara'],
  },
  { prefix: '/keamanan/rumah-kosong', roles: ['superadmin', 'security', 'paguyuban'] },
  { prefix: '/keamanan/jadwal-jaga', roles: ['superadmin', 'security', 'paguyuban'] },
  { prefix: '/keamanan', roles: ['superadmin', 'security'] },
]

// Fitur warga: terkunci untuk warga yang belum diverifikasi, dan untuk IT Support.
// Tombol Darurat (/darurat) dan Profil (/profile) sengaja TIDAK ada di sini.
const WARGA_FEATURES = ['/forum', '/warga', '/chat', '/pengumuman', '/pengaduan', '/qr-tamu', '/anggaran', '/iuran-ipl', '/polling', '/tukang', '/rumah-kosong', '/keluarga', '/keuangan-rumah', '/layanan', '/status-hunian']