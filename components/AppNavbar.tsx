'use client'

import { useEffect, useRef, useState } from 'react'
import { BrandLogo, useBranding } from '@/components/BrandingProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'
import EmergencyAlertWatcher from '@/components/EmergencyAlertWatcher'
import LiveClock from '@/components/LiveClock'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import FeatureLockedModal from '@/components/FeatureLockedModal'
import { CCTV_URL, LOCKED_BY_SUPERADMIN, type FeatureKey } from '@/lib/features'

type NavLink = { title: string; href: string; feature: FeatureKey | null; external?: boolean }

const sidebarLinks: NavLink[] = [
  { title: 'Beranda', href: '/dashboard', feature: null },
  { title: 'Forum Warga', href: '/forum', feature: 'forum' },
  { title: 'Warga & Teman', href: '/warga', feature: 'warga' },
  { title: 'Pesan', href: '/chat', feature: 'chat' },
  { title: 'Pengaduan', href: '/pengaduan', feature: 'pengaduan' },
  { title: 'Layanan Surat', href: '/layanan', feature: 'layanan' },
  { title: 'Anggaran Paguyuban', href: '/anggaran', feature: 'anggaran' },
  { title: 'Iuran IPL', href: '/iuran-ipl', feature: 'iuran_ipl' },
  { title: 'Polling Warga', href: '/polling', feature: 'polling' },
  { title: 'Katalog Tukang', href: '/tukang', feature: 'tukang' },
  { title: 'Rumah Kosong', href: '/rumah-kosong', feature: 'rumah_kosong' },
  { title: 'Status Hunian', href: '/status-hunian', feature: 'status_hunian' },
  { title: 'Jadwal Jaga', href: '/jadwal-jaga', feature: null },
  { title: 'Peta Perumahan', href: '/peta', feature: null },
  { title: 'Catatan & Kalender Keluarga', href: '/keluarga', feature: 'keluarga' },
  { title: 'CCTV Jogja', href: CCTV_URL, feature: 'cctv', external: true },
]

// Halaman portal admin memakai sidebar sendiri (AdminLayout), jadi navbar warga disembunyikan di sana
const PORTAL_PREFIXES = [
  '/superadmin',
  '/paguyuban',
  '/verifikasi-akun',
  '/kelola-nomor-darurat',
  '/manajemen',
  '/tukang/kelola',
  '/it-support',
  '/security',
  '/keamanan',
]

// Sekretaris / Bendahara ditulis "staff_paguyuban:jabatan"
const roleLinks = [
  { title: 'Verifikasi Akun', href: '/verifikasi-akun', roles: ['superadmin', 'paguyuban', 'staff_paguyuban:sekretaris'] },
  { title: 'Kelola Nomor Darurat', href: '/kelola-nomor-darurat', roles: ['superadmin', 'paguyuban', 'staff_paguyuban:sekretaris'] },
  { title: 'Kelola Fitur', href: '/superadmin/fitur', roles: ['superadmin'] },
  { title: 'Dashboard Security', href: '/security', roles: ['security', 'superadmin'] },
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu', roles: ['security', 'superadmin'] },
  { title: 'Dashboard Paguyuban', href: '/paguyuban', roles: ['paguyuban', 'superadmin'] },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum', roles: ['paguyuban', 'superadmin'] },
  { title: 'Dashboard Manajemen', href: '/manajemen', roles: ['manajemen', 'superadmin'] },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola', roles: ['manajemen', 'paguyuban', 'superadmin'] },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff', roles: ['paguyuban', 'superadmin'] },
  { title: 'Kelola Admin', href: '/superadmin', roles: ['superadmin'] },
  { title: 'Error Logs (IT Support)', href: '/it-support', roles: ['it_support', 'superadmin'] },
]

const quickIcons: (NavLink & { danger?: boolean; path: string })[] = [
  {
    title: 'Darurat',
    href: '/darurat',
    feature: 'darurat',
    danger: true,
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    feature: 'pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    href: '/qr-tamu',
    feature: 'qr_tamu',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
  {
    title: 'Profil',
    href: '/profile',
    feature: null,
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

const LOCK_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export default function AppNavbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isHouseholdManager, setIsHouseholdManager] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [disabledFeatures, setDisabledFeatures] = useState<Set<string>>(new Set())
  const [lockedTitle, setLockedTitle] = useState<string | null>(null)
  const pathname = usePathname()
  const loadedUid = useRef<string | null | undefined>(undefined)
  const reloadMenu = useRef<(() => void) | null>(null)

  // Data menu dimuat SEKALI saat aplikasi dibuka (bukan setiap pindah halaman), lalu diperbarui
  // kalau status login berubah atau aplikasi dibuka lagi setelah lebih dari 5 menit.
  useEffect(() => {
    const supabase = createClient()
    let lastLoad = 0
    let alive = true

    async function loadMenu() {
      lastLoad = Date.now()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!alive) return
      loadedUid.current = uid ?? null
      setLoggedIn(!!uid)
      if (uid) {
        const [{ data: profile }, { data: features }] = await Promise.all([
          supabase
            .from('profiles')
            .select('role, staff_position, family_role, family_status, account_status')
            .eq('id', uid)
            .maybeSingle(),
          supabase.from('app_features').select('key, enabled'),
        ])
        if (!alive) return
        setIsHouseholdManager(
          profile?.role === 'warga' &&
            profile?.account_status === 'aktif' &&
            (profile?.family_role === 'kepala_keluarga' ||
              (profile?.family_role === 'ibu_rumah_tangga' && profile?.family_status === 'dikonfirmasi'))
        )
        const r = profile?.role ?? null
        setRole(r === 'staff_paguyuban' ? `staff_paguyuban:${profile?.staff_position ?? ''}` : r)
        // Superadmin tetap bisa membuka semua fitur untuk pengecekan
        setDisabledFeatures(
          r === 'superadmin' ? new Set() : new Set((features ?? []).filter((f) => f.enabled === false).map((f) => f.key as string))
        )
      }
    }

    loadMenu()
    reloadMenu.current = loadMenu
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') loadMenu()
    })
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastLoad > 5 * 60 * 1000) loadMenu()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      sub.subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Pindah halaman: cukup cek sesi di HP (tanpa internet). Menu dimuat ulang hanya kalau akun berganti
  // (mis. baru login / keluar lewat halaman server).
  useEffect(() => {
    setSidebarOpen(false)
    if (loadedUid.current === undefined) return
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const uid = data.session?.user?.id ?? null
        if (uid !== loadedUid.current) reloadMenu.current?.()
      })
  }, [pathname])

  if (!loggedIn) return null
  if (PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null

  const isLocked = (link: NavLink) => !!link.feature && disabledFeatures.has(link.feature)
  const visibleRoleLinks = roleLinks.filter((l) => role && l.roles.includes(role))
  // IT Support hanya untuk log error (kebutuhan awal #15)
  const isItSupport = role === 'it_support'
  const baseSidebarLinks: NavLink[] = isHouseholdManager
    ? [...sidebarLinks, { title: 'Keuangan Rumah Tangga', href: '/keuangan-rumah', feature: 'keuangan_rumah' }]
    : sidebarLinks
  const visibleSidebarLinks = isItSupport ? sidebarLinks.filter((l) => l.href === '/dashboard' || l.external) : baseSidebarLinks
  const visibleQuickIcons = isItSupport ? quickIcons.filter((q) => q.href === '/darurat' || q.href === '/profile') : quickIcons
  const lockedModal = lockedTitle ? LOCKED_BY_SUPERADMIN(lockedTitle) : null

  return (
    <>
      <EmergencyAlertWatcher />
      <ServiceWorkerRegister />
      <RealtimeRefresher />
      <FeatureLockedModal
        open={!!lockedModal}
        onClose={() => setLockedTitle(null)}
        title={lockedModal?.title ?? ''}
        message={lockedModal?.message ?? ''}
      />
      <div
        className="sticky top-0 z-40 w-full"
        style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(230,201,138,0.15)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-2.5 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            title="Buka menu"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ color: 'var(--brand-accent)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="mr-auto flex min-w-0 items-center gap-2.5">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center">
              <BrandLogo size={24} className="rounded-md object-cover" />
            </Link>
            <LiveClock variant="dark" />
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            {visibleQuickIcons.map((item) => {
              const active = pathname === item.href
              const locked = isLocked(item)
              const inner = (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={item.danger ? '#ffffff' : active ? 'var(--brand-accent)' : '#c7c9d2'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.path} />
                </svg>
              )
              const style: React.CSSProperties = {
                background: item.danger ? '#b3392f' : active ? 'rgba(212,175,106,0.18)' : 'transparent',
                opacity: locked ? 0.4 : 1,
              }
              return locked ? (
                <button
                  key={item.href}
                  type="button"
                  aria-label={`${item.title} (terkunci)`}
                  title={`${item.title} (terkunci)`}
                  onClick={() => setLockedTitle(item.title)}
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={style}
                >
                  {inner}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.title}
                  title={item.title}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={style}
                >
                  {inner}
                </Link>
              )
            })}
          </div>

          <div className="flex-shrink-0" style={{ color: '#efe4c8' }}>
            <NotificationBell />
          </div>
        </div>
      </div>

      {sidebarOpen ? (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(10,11,15,0.55)' }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 260,
              zIndex: 50,
              background: '#0a0b0f',
              borderRight: '1px solid rgba(230,201,138,0.15)',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(230,201,138,0.12)' }}>
              <div className="flex items-center gap-2">
                <BrandLogo size={26} className="rounded-md object-cover" />
                <span className="text-[12.5px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
                  HINGGIL MANSION
                </span>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} style={{ color: '#c7c9d2' }} aria-label="Tutup menu" title="Tutup menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 px-3 py-3">
              {visibleSidebarLinks.map((l) => {
                const active = pathname === l.href
                const itemStyle: React.CSSProperties = {
                  background: active ? 'rgba(212,175,106,0.14)' : 'transparent',
                  color: active ? 'var(--brand-accent)' : '#c7c9d2',
                }
                if (isLocked(l)) {
                  return (
                    <button
                      key={l.href}
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false)
                        setLockedTitle(l.title)
                      }}
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-bold"
                      style={{ ...itemStyle, opacity: 0.45 }}
                    >
                      {l.title}
                      {LOCK_ICON}
                    </button>
                  )
                }
                if (l.external) {
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                      style={itemStyle}
                    >
                      {l.title}
                      <span className="text-[11px]" style={{ color: '#6b6552' }}>↗</span>
                    </a>
                  )
                }
                return (
                  <Link key={l.href} href={l.href} className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition" style={itemStyle}>
                    {l.title}
                  </Link>
                )
              })}

              {visibleRoleLinks.length > 0 ? (
                <>
                  <div className="mt-3 mb-1 px-3.5 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#6b6552' }}>
                    Khusus Admin
                  </div>
                  {visibleRoleLinks.map((l) => {
                    const active = pathname === l.href
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                        style={{ background: active ? 'rgba(212,175,106,0.14)' : 'transparent', color: active ? 'var(--brand-accent)' : '#c7c9d2' }}
                      >
                        {l.title}
                      </Link>
                    )
                  })}
                </>
              ) : null}
            </nav>
          </div>
        </>
      ) : null}
    </>
  )
}