'use client'

import { useState } from 'react'
import Link from 'next/link'
import FeatureLockedModal from '@/components/FeatureLockedModal'
import { LOCKED_BY_SUPERADMIN, LOCKED_BY_VERIFICATION } from '@/lib/features'

export type TileState = 'open' | 'pending' | 'disabled'

// Kotak menu Beranda. Fitur yang terkunci tetap tampil (supaya warga tahu fiturnya ada),
// dan saat ditekan muncul penjelasan kenapa terkunci.
export default function DashboardTile({
  title,
  href,
  path,
  danger = false,
  highlight = false,
  external = false,
  state = 'open',
  adminPreview = false,
}: {
  title: string
  href: string
  path: string
  danger?: boolean
  highlight?: boolean
  external?: boolean
  state?: TileState
  adminPreview?: boolean
}) {
  const [open, setOpen] = useState(false)
  const locked = state !== 'open'

  const icon = (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: danger ? '#b3392f' : '#1a1305' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={danger ? '#ffffff' : 'var(--brand-accent)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </div>
  )

  const label = (
    <div className="text-[13.5px] font-bold" style={{ color: danger ? '#b3392f' : '#1f1a10' }}>
      {title}
    </div>
  )

  const className = 'relative flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5'
  const style: React.CSSProperties = {
    background: '#ffffff',
    border: danger ? '1px solid rgba(179,57,47,0.25)' : highlight ? '1px solid rgba(212,175,106,0.35)' : '1px solid rgba(26,19,5,0.08)',
  }

  if (locked) {
    const modal = state === 'disabled' ? LOCKED_BY_SUPERADMIN(title) : LOCKED_BY_VERIFICATION(title)
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className={className} style={{ ...style, opacity: 0.5 }}>
          {icon}
          {label}
          <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#1a1305' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
        </button>
        <FeatureLockedModal open={open} onClose={() => setOpen(false)} title={modal.title} message={modal.message} />
      </>
    )
  }

  const badge = adminPreview ? (
    <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase" style={{ background: '#f2f1ec', color: '#5b543f' }}>
      Nonaktif untuk warga
    </span>
  ) : null

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {badge}
        {icon}
        {label}
        <span className="text-[10.5px] font-semibold" style={{ color: '#9c7a3f' }}>Buka situs ↗</span>
      </a>
    )
  }

  return (
    <Link href={href} className={className} style={style}>
      {badge}
      {icon}
      {label}
    </Link>
  )
}