'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const DISMISS_KEY = 'push-banner-ditutup'

// Ajakan mengaktifkan notifikasi HP (supaya alert darurat masuk walau aplikasi tertutup).
// Muncul hanya kalau browser mendukung, belum berlangganan, dan belum ditutup pengguna.
export default function PushPromptBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return
    if (Notification.permission === 'denied') return
    try {
      const until = Number(window.localStorage.getItem(DISMISS_KEY) ?? '0')
      if (until > Date.now()) return
    } catch {
      // abaikan
    }
    let alive = true
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (alive && !sub) setVisible(true)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  function later() {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000))
    } catch {
      // abaikan
    }
  }

  if (!visible) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: '#1a1305', border: '1px solid rgba(230,201,138,0.3)' }}>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold" style={{ color: '#e6c98a' }}>Aktifkan notifikasi di HP ini</div>
        <div className="text-[11.5px]" style={{ color: '#d8cfb8' }}>Alert darurat & pesan tetap masuk walau aplikasi ditutup.</div>
      </div>
      <Link href="/pengaturan-notifikasi" className="flex-shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold" style={{ background: '#e6c98a', color: '#1a1305' }}>
        Aktifkan
      </Link>
      <button type="button" onClick={later} aria-label="Nanti saja" className="flex-shrink-0 text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
        Nanti
      </button>
    </div>
  )
}