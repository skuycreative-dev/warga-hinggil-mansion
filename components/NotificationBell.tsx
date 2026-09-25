'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  async function load() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
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
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
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
              width: 320,
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
              {unread > 0 ? (
                <button type="button" onClick={markAllRead} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                  Tandai semua dibaca
                </button>
              ) : null}
            </div>

            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12.5px] font-medium" style={{ color: '#8a8c96' }}>
                Belum ada notifikasi.
              </p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? '#'}
                  onClick={() => markOneRead(n.id)}
                  className="block px-4 py-3"
                  style={{
                    borderBottom: '1px solid rgba(26,19,5,0.05)',
                    background: n.is_read ? 'transparent' : 'rgba(212,175,106,0.06)',
                  }}
                >
                  <div className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{n.title}</div>
                  {n.body ? (
                    <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: '#5b543f' }}>{n.body}</div>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
