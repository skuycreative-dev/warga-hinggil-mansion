'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

export type AdminNavItem = { title: string; href: string }

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

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex min-h-screen w-full" style={{ background: '#f2f1ec' }}>
      <aside
        className="hidden w-64 flex-shrink-0 flex-col md:flex"
        style={{ background: '#0a0b0f', borderRight: '1px solid rgba(230,201,138,0.12)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid rgba(230,201,138,0.1)' }}>
          <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={34} height={34} className="rounded-lg object-cover" />
          <div>
            <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
              {portalLabel}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{roleLabel}</div>
          </div>
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
          <Link
            href="/dashboard"
            className="block rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition"
            style={{ color: '#6b6552' }}
          >
            ← Beranda Warga
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          className="flex items-center justify-between px-6 py-4 md:px-9"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,19,5,0.08)' }}
        >
          <div>
            <div className="text-[11.5px] font-semibold capitalize" style={{ color: '#9c7a3f' }}>{today}</div>
            <div className="text-lg font-bold md:text-xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Halo, {userName}
            </div>
          </div>
          <div className="flex items-center gap-3">
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

        <main className="flex-1 px-6 py-7 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  )
}
