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
  // Prefetch (Next.js memuat duluan menu yang terlihat di layar) tidak perlu pengecekan lengkap:
  // halaman aslinya tetap dicek penuh saat benar-benar dibuka. Ini menghemat banyak panggilan ke database.
  if (request.headers.get('next-router-prefetch') === '1' || request.headers.get('purpose') === 'prefetch') {
    return supabaseResponse
  }

  // getClaims: identitas diverifikasi dari tanda tangan token (cepat, tanpa bertanya ke server Auth
  // di setiap pindah halaman). Proyek dengan kunci lama otomatis kembali ke pengecekan server.
  const { data: claimData } = await supabase.auth.getClaims()
  const claims = claimData?.claims as { sub?: string; aal?: string } | undefined
  const user = claims?.sub ? { id: claims.sub } : null

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
    // Sudah memasukkan kode 2FA -> lewat. Kalau belum, cek (dari sesi login) apakah akun punya perangkat 2FA.
    const { data: aal } = claims?.aal === 'aal2' ? { data: null } : await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const hasFactor = aal?.nextLevel === 'aal2'
    if (claims?.aal === 'aal2') {
      // aman
    } else if (hasFactor) {
      // Punya 2FA tapi belum memasukkan kode: semua halaman (termasuk Keamanan Akun) ditutup
      mfaTarget = `/login/2fa?next=${encodeURIComponent(path + request.nextUrl.search)}`
    } else if (!isOpen(MFA_OPEN_PATHS)) {
      const me = await loadProfile()
      if (roleNeeds2fa(me?.role)) {
        // Admin tanpa kode 2FA: pastikan ke server apakah sudah punya perangkat (jarang terjadi, hanya admin)
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const { data: fresh } = session?.access_token ? await supabase.auth.getUser(session.access_token) : { data: { user: null } }
        const serverHasFactor = (fresh.user?.factors ?? []).some((f) => f.status === 'verified')
        mfaTarget = serverHasFactor ? `/login/2fa?next=${encodeURIComponent(path + request.nextUrl.search)}` : '/keamanan-akun?wajib=1'
      }
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
      redirect.headers.set('Cache-Control', 'no-store, must-revalidate')
      return redirect
    }
  }

  // "no-store" mencegah browser menyimpan halaman ini di bfcache (cache tombol Back/Forward).
  // Tanpa ini, menekan Back berkali-kali bisa menampilkan halaman lama dari SEBELUM login
  // (atau punya orang lain di HP bersama) tanpa dicek ulang statusnya — terasa seperti
  // "otomatis keluar" padahal sesi aslinya masih aktif. Dengan header ini, Back/Forward
  // selalu memuat ulang dari server dan status login dicek ulang setiap saat.
  supabaseResponse.headers.set('Cache-Control', 'no-store, must-revalidate')
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
const WARGA_FEATURES = ['/peta', '/forum', '/warga', '/chat', '/pengumuman', '/pengaduan', '/qr-tamu', '/anggaran', '/iuran-ipl', '/polling', '/tukang', '/rumah-kosong', '/keluarga', '/keuangan-rumah', '/layanan', '/status-hunian']