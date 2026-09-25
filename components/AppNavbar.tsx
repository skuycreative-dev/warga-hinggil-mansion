'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

const links = [
  { title: 'Beranda', href: '/dashboard' },
  { title: 'Darurat', href: '/darurat' },
  { title: 'Forum', href: '/forum' },
  { title: 'Warga', href: '/warga' },
  { title: 'Pesan', href: '/chat' },
  { title: 'Pengumuman', href: '/pengumuman' },
  { title: 'QR Tamu', href: '/qr-tamu' },
  { title: 'Anggaran', href: '/anggaran' },
  { title: 'Polling', href: '/polling' },
  { title: 'Tukang', href: '/tukang' },
  { title: 'Profil', href: '/profile' },
]

export default function AppNavbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user)
    })
  }, [])

  if (!loggedIn) return null

  return (
    <div
      className="sticky top-0 z-40 w-full"
      style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(230,201,138,0.15)' }}
    >
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-2.5 md:px-8">
        <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2">
          <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={26} height={26} className="rounded-md object-cover" />
          <span
            className="hidden text-[12.5px] font-bold tracking-wide sm:inline"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
          >
            HINGGIL MANSION
          </span>
        </Link>

        <nav
          className="flex flex-1 items-center gap-1.5 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== '/dashboard' && pathname?.startsWith(l.href))
            return (
              <Link
                key={l.href}
                href={l.href}
                className="flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold transition"
                style={{
                  background: active ? 'rgba(212,175,106,0.18)' : 'transparent',
                  color: active ? '#e6c98a' : '#c7c9d2',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.title}
              </Link>
            )
          })}
        </nav>

        <div className="flex-shrink-0" style={{ color: '#efe4c8' }}>
          <NotificationBell />
        </div>
      </div>
    </div>
  )
}
