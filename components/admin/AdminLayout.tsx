'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'
import EmergencyAlertWatcher from '@/components/EmergencyAlertWatcher'
import LiveClock from '@/components/LiveClock'

export type AdminNavItem = { title: string; href: string }

function SidebarContent({
  portalLabel,
  roleLabel,
  navItems,
  pathname,
  onClose,
}: {
  portalLabel: string
  roleLabel: string
  navItems: AdminNavItem[]
  pathname: string
  onClose?: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid rgba(230,201,138,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={34} height={34} className="rounded-lg object-cover" />
          <div>
            <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
              {portalLabel}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{roleLabel}</div>
          </div>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Tutup menu" style={{ color: '#c7c9d2' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
              style={{
                background: active ? 'rgba(212,175,106,0.16)' : 'transparent',
                color: active ? '#e6c98a' : '#c7c9d2',
              }}
            >
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(230,201,138,0.1)' }}>
        <Link href="/dashboard" className="block rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition" style={{ color: '#6b6552' }}>
          ← Beranda Warga
        </Link>
      </div>
    </>
  )
}

export default function AdminLayout({
  portalLabel,
  roleLabel,
  userName,
  navItems,
  children,
}: {
  portalLabel: string
  roleLabel: string
  userName: string
  navItems: AdminNavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen w-full" style={{ background: '#f2f1ec' }}>
      <EmergencyAlertWatcher />
      <aside
        className="hidden w-64 flex-shrink-0 flex-col md:flex"
        style={{ background: '#0a0b0f', borderRight: '1px solid rgba(230,201,138,0.12)' }}
      >
        <SidebarContent portalLabel={portalLabel} roleLabel={roleLabel} navItems={navItems} pathname={pathname} />
      </aside>

      {/* Menu portal di HP (sebelumnya sidebar hilang total di layar kecil) */}
      {menuOpen ? (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            className="md:hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(10,11,15,0.55)' }}
          />
          <aside
            className="flex flex-col md:hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 264,
              zIndex: 50,
              background: '#0a0b0f',
              borderRight: '1px solid rgba(230,201,138,0.12)',
              overflowY: 'auto',
            }}
          >
            <SidebarContent
              portalLabel={portalLabel}
              roleLabel={roleLabel}
              navItems={navItems}
              pathname={pathname}
              onClose={() => setMenuOpen(false)}
            />
          </aside>
        </>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between gap-3 px-4 py-4 md:px-9"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,19,5,0.08)' }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Buka menu portal"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg md:hidden"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="truncate text-lg font-bold md:text-xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
                Halo, {userName}
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <div className="hidden sm:block">
              <LiveClock variant="light" full />
            </div>
            <div className="sm:hidden">
              <LiveClock variant="light" />
            </div>
            <div style={{ color: '#1f1a10' }}>
              <NotificationBell />
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-auto px-4 py-6 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  )
}