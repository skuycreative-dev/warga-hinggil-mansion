'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import LoadingOverlay from '@/components/LoadingOverlay'

// Tab berbasis alamat (?tab=...) yang datanya dimuat ulang dari server.
// Saat menunggu, tampil layar "Memuat..." supaya pengguna tahu tombolnya sudah ditekan.
export default function TabNav({
  basePath,
  tabs,
  active,
}: {
  basePath: string
  tabs: { key: string; label: string; badge?: number }[]
  active: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [target, setTarget] = useState<string | null>(null)
  const current = isPending && target ? target : active

  return (
    <>
      <nav className="mb-6 flex gap-1.5 overflow-x-auto pb-1" aria-label="Bagian halaman">
        {tabs.map((t) => {
          const isActive = t.key === current
          const href = `${basePath}?tab=${t.key}`
          return (
            <Link
              key={t.key}
              href={href}
              scroll={false}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || t.key === active) return
                e.preventDefault()
                setTarget(t.key)
                startTransition(() => router.push(href, { scroll: false }))
              }}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition"
              style={isActive ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
            >
              {t.label}
              {t.badge ? (
                <span className="rounded-full px-1.5 text-[10.5px]" style={{ background: '#b3392f', color: '#ffffff' }}>
                  {t.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
      {isPending ? <LoadingOverlay /> : null}
    </>
  )
}