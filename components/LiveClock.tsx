'use client'

import { useEffect, useState } from 'react'

// Jam & tanggal berjalan (WIB) untuk header aplikasi.
// Baru tampil setelah halaman terbuka di HP/browser, supaya jam server dan jam pengguna tidak bentrok.
export default function LiveClock({ variant = 'dark', full = false }: { variant?: 'dark' | 'light'; full?: boolean }) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    // Tanpa detik: cukup diperbarui tiap pergantian menit (hemat baterai HP)
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      const wait = full ? 1000 - (Date.now() % 1000) : 60000 - (Date.now() % 60000)
      timer = setTimeout(() => {
        setNow(new Date())
        schedule()
      }, wait + 20)
    }
    schedule()
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [full])

  const mainColor = variant === 'dark' ? '#efe4c8' : '#1f1a10'
  const subColor = variant === 'dark' ? '#9c7a3f' : '#9c7a3f'

  if (!now) {
    return <div aria-hidden style={{ width: full ? 180 : 64, height: 30 }} />
  }

  const time = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: full ? '2-digit' : undefined,
    hour12: false,
  }).format(now)

  const date = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: full ? 'long' : 'short',
    day: 'numeric',
    month: full ? 'long' : 'short',
    year: full ? 'numeric' : undefined,
  }).format(now)

  return (
    <div className="flex flex-col leading-tight" aria-label={`${date}, pukul ${time} WIB`}>
      <span className="text-[13px] font-bold tabular-nums" style={{ color: mainColor }}>
        {time.replace(/\./g, ':')} <span className="text-[10px] font-semibold" style={{ color: subColor }}>WIB</span>
      </span>
      <span className="text-[10.5px] font-semibold capitalize" style={{ color: subColor }}>{date}</span>
    </div>
  )
}