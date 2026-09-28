'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initNotificationSound, isSoundEnabled, playNotificationSound, setSoundEnabled } from '@/lib/notification-sound'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

// Notifikasi lama untuk Kepala Keluarga menunjuk ke /dashboard saja: arahkan langsung ke kotak konfirmasi
function targetOf(n: Notif) {
  const link = n.link && n.link.startsWith('/') && !n.link.startsWith('//') ? n.link : '/dashboard'
  if (link === '/dashboard' && /bergabung/i.test(n.title)) return '/dashboard#permintaan-keluarga'
  return link
}

export default function NotificationBell() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [soundOn, setSoundOn] = useState(true)

  async function load() {
    const supabase = createClient()
    // Sesi dibaca dari HP (tanpa bertanya ke server); data tetap dijaga aturan database
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, link, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (data) {
      setNotifs(data)
      setUnread(data.filter((n) => !n.is_read).length)
    }
  }

  useEffect(() => {
    initNotificationSound()
    setSoundOn(isSoundEnabled())
    load()
    // Notifikasi baru langsung masuk (real-time); cek berkala tetap ada sebagai cadangan
    const supabase = createClient()
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id
      if (cancelled || !uid) return
      channel = supabase
        .channel(`notifikasi-${uid}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, (payload) => {
          // Perubahan kecil (tanda dibaca, status kirim ke HP) tidak perlu memuat ulang daftar
          if (payload.eventType === 'UPDATE') return
          // Notifikasi baru: bunyi "ding-dong" 2 ketukan (sekali saja walau ada 2 lonceng di halaman)
          if (payload.eventType === 'INSERT') playNotificationSound(String((payload.new as { id?: string })?.id ?? Date.now()))
          load()
        })
        .subscribe()
    })

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 60000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  // Klik notifikasi: tutup daftar, tandai dibaca, lalu buka halamannya.
  // Kalau halamannya sama dengan yang sedang dibuka, halaman dimuat ulang dan digulir ke bagian yang dituju.
  function openNotif(n: Notif) {
    setOpen(false)
    if (!n.is_read) void markOneRead(n.id)
    const target = targetOf(n)
    const url = new URL(target, window.location.origin)
    if (url.pathname === pathname) {
      router.refresh()
      if (url.hash) {
        const id = decodeURIComponent(url.hash.slice(1))
        window.history.replaceState(null, '', url.pathname + url.search + url.hash)
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350)
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    router.push(target)
  }

  async function markOneRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnread((u) => Math.max(0, u - 1))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'relative', color: '#5b543f' }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#b3392f',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 32,
              width: 'min(320px, calc(100vw - 24px))',
              maxHeight: 400,
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid rgba(26,19,5,0.1)',
              borderRadius: 14,
              boxShadow: '0 16px 40px -12px rgba(0,0,0,0.25)',
              zIndex: 50,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
              <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>Notifikasi</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundOn
                    setSoundEnabled(next)
                    setSoundOn(next)
                    if (next) playNotificationSound()
                  }}
                  aria-pressed={soundOn}
                  title={soundOn ? 'Matikan suara notifikasi' : 'Nyalakan suara notifikasi'}
                  className="text-[11.5px] font-bold"
                  style={{ color: soundOn ? '#2f6b4f' : '#8a8c96' }}
                >
                  {soundOn ? 'Suara: aktif' : 'Suara: mati'}
                </button>
                {unread > 0 ? (
                  <button type="button" onClick={markAllRead} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                    Tandai semua dibaca
                  </button>
                ) : null}
              </div>
            </div>

            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12.5px] font-medium" style={{ color: '#8a8c96' }}>
                Belum ada notifikasi.
              </p>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openNotif(n)}
                  className="block w-full px-4 py-3 text-left"
                  style={{
                    borderBottom: '1px solid rgba(26,19,5,0.05)',
                    background: n.is_read ? 'transparent' : 'rgba(212,175,106,0.06)',
                  }}
                >
                  <div className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{n.title}</div>
                  {n.body ? (
                    <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: '#5b543f' }}>{n.body}</div>
                  ) : null}
                </button>
              ))
            )}
            <Link
              href="/pengaturan-notifikasi"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-[12px] font-bold"
              style={{ color: '#9c7a3f', background: '#faf7f0' }}
            >
              Atur notifikasi ke HP
            </Link>
          </div>
        </>
      ) : null}
    </div>
  )
}