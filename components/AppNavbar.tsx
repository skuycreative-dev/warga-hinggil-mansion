'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

const sidebarLinks = [
  { title: 'Beranda', href: '/dashboard' },
  { title: 'Forum Warga', href: '/forum' },
  { title: 'Warga & Teman', href: '/warga' },
  { title: 'Pesan', href: '/chat' },
  { title: 'Pengaduan', href: '/pengaduan' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
  { title: 'Katalog Tukang', href: '/tukang' },
]

const roleLinks = [
  { title: 'Dashboard Security', href: '/security', roles: ['security', 'superadmin'] },
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu', roles: ['security', 'superadmin'] },
  { title: 'Status Rumah Kosong', href: '/rumah-kosong', roles: ['security', 'paguyuban', 'superadmin'] },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum', roles: ['paguyuban', 'superadmin'] },
  { title: 'Dashboard Manajemen', href: '/manajemen', roles: ['manajemen', 'superadmin'] },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola', roles: ['manajemen', 'superadmin'] },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff', roles: ['paguyuban', 'superadmin'] },
  { title: 'Kelola Admin', href: '/superadmin', roles: ['superadmin'] },
]

const quickIcons = [
  {
    title: 'Darurat',
    href: '/darurat',
    danger: true,
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    href: '/qr-tamu',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
  {
    title: 'Profil',
    href: '/profile',
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

export default function AppNavbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
        setRole(profile?.role ?? null)
      }
    })
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!loggedIn) return null

  const visibleRoleLinks = roleLinks.filter((l) => role && l.roles.includes(role))

  return (
    <>
      <div
        className="sticky top-0 z-40 w-full"
        style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(230,201,138,0.15)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-2.5 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ color: '#e6c98a' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link href="/dashboard" className="mr-auto flex flex-shrink-0 items-center gap-2">
            <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={24} height={24} className="rounded-md object-cover" />
          </Link>

          <div className="flex flex-shrink-0 items-center gap-1">
            {quickIcons.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.title}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={{
                    background: item.danger ? '#b3392f' : active ? 'rgba(212,175,106,0.18)' : 'transparent',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={item.danger ? '#ffffff' : active ? '#e6c98a' : '#c7c9d2'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.path} />
                  </svg>
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
                <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={26} height={26} className="rounded-md object-cover" />
                <span className="text-[12.5px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
                  HINGGIL MANSION
                </span>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} style={{ color: '#c7c9d2' }} aria-label="Tutup menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 px-3 py-3">
              {sidebarLinks.map((l) => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                    style={{ background: active ? 'rgba(212,175,106,0.14)' : 'transparent', color: active ? '#e6c98a' : '#c7c9d2' }}
                  >
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
                        style={{ background: active ? 'rgba(212,175,106,0.14)' : 'transparent', color: active ? '#e6c98a' : '#c7c9d2' }}
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
