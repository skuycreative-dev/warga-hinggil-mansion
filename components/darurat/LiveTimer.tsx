'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/emergency'

// Durasi berjalan sejak alert dikirim (berhenti saat alert selesai)
export default function LiveTimer({ since, until, className, style }: { since: string; until?: string | null; className?: string; style?: React.CSSProperties }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    if (until) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [until])

  const end = until ? new Date(until).getTime() : now
  return (
    <span className={className} style={style} suppressHydrationWarning>
      {end === null ? '--:--' : formatDuration(end - new Date(since).getTime())}
    </span>
  )
}