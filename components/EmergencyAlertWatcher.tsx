'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LiveAlert = {
  id: string
  emergency_type: string
  message: string | null
  created_at: string
  reporter_id: string
  reporterName: string
  houseLabel: string | null
}

const TYPE_LABEL: Record<string, string> = {
  kebakaran: 'Kebakaran',
  maling: 'Maling',
  perampokan: 'Perampokan',
  kekerasan: 'Kekerasan',
  medis: 'Darurat Medis',
  bencana: 'Bencana Alam',
  lainnya: 'Darurat',
}

// Yang mendengar sirene: Security & Pengurus. Semua pengguna tetap melihat popup.
const RESPONDER_ROLES = ['security', 'paguyuban', 'staff_paguyuban', 'manajemen', 'superadmin']
const STORAGE_KEY = 'darurat-sudah-dilihat'
const LOOKBACK_MINUTES = 30

function readDismissed(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveDismissed(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-50)))
  } catch {
    // penyimpanan browser tidak tersedia: popup tetap berfungsi, hanya tidak diingat
  }
}

function playSiren() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    gain.gain.value = 0.08
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    for (let i = 0; i < 8; i++) osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 620, now + i * 0.35)
    osc.start(now)
    osc.stop(now + 2.8)
    osc.onended = () => ctx.close()
  } catch {
    // browser memblokir suara sebelum pengguna menyentuh layar: popup tetap tampil
  }
  try {
    navigator.vibrate?.([400, 150, 400, 150, 400])
  } catch {
    // tidak semua perangkat bisa bergetar
  }
}

export default function EmergencyAlertWatcher() {
  const pathname = usePathname()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const userRef = useRef<{ id: string; responder: boolean } | null>(null)
  const dismissedRef = useRef<Set<string>>(new Set())
  const [queue, setQueue] = useState<LiveAlert[]>([])

  const enqueue = useCallback((alerts: LiveAlert[]) => {
    const me = userRef.current
    const fresh = alerts.filter((a) => !dismissedRef.current.has(a.id) && a.reporter_id !== me?.id)
    if (fresh.length === 0) return
    setQueue((current) => {
      const known = new Set(current.map((a) => a.id))
      const added = fresh.filter((a) => !known.has(a.id))
      if (added.length > 0 && me?.responder) playSiren()
      return added.length > 0 ? [...current, ...added] : current
    })
  }, [])

  const loadAlerts = useCallback(
    async (onlyId?: string) => {
      const supabase = supabaseRef.current
      if (!supabase) return
      let query = supabase
        .from('emergency_alerts')
        .select('id, emergency_type, message, created_at, reporter_id, status, house:houses(nomor_rumah), reporter:reporter_id(full_name, nickname)')
        .eq('status', 'aktif')
      if (onlyId) {
        query = query.eq('id', onlyId)
      } else {
        query = query.gte('created_at', new Date(Date.now() - LOOKBACK_MINUTES * 60 * 1000).toISOString())
      }
      const { data } = await query.order('created_at', { ascending: true }).limit(10)
      const alerts: LiveAlert[] = (data ?? []).map((a: any) => {
        const reporter = Array.isArray(a.reporter) ? a.reporter[0] : a.reporter
        const house = Array.isArray(a.house) ? a.house[0] : a.house
        return {
          id: a.id,
          emergency_type: a.emergency_type,
          message: a.message,
          created_at: a.created_at,
          reporter_id: a.reporter_id,
          reporterName: reporter?.nickname?.trim() || reporter?.full_name || 'Warga',
          houseLabel: house?.nomor_rumah ?? null,
        }
      })
      enqueue(alerts)
    },
    [enqueue]
  )

  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase
    dismissedRef.current = new Set(readDismissed())
    let cancelled = false

    const channel = supabase
      .channel('darurat-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (payload) => {
        const id = (payload.new as { id?: string })?.id
        if (id) loadAlerts(id)
      })

    supabase.auth.getSession().then(async ({ data: sessionData }) => {
      const data = { user: sessionData.session?.user ?? null }
      if (cancelled || !data.user) return
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      userRef.current = { id: data.user.id, responder: RESPONDER_ROLES.includes(profile?.role ?? '') }
      channel.subscribe()
      loadAlerts()
    })

    // Cadangan kalau koneksi real-time terputus: cek ulang tiap 30 detik
    const timer = setInterval(() => {
      if (userRef.current && document.visibilityState === 'visible') loadAlerts()
    }, 30000)

    return () => {
      cancelled = true
      clearInterval(timer)
      supabase.removeChannel(channel)
    }
  }, [loadAlerts])

  function dismiss(id: string) {
    dismissedRef.current.add(id)
    saveDismissed(Array.from(dismissedRef.current))
    setQueue((current) => current.filter((a) => a.id !== id))
  }

  const current = queue[0]
  if (!current || pathname === '/darurat') return null

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="flex items-center justify-center px-5"
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(10,11,15,0.75)' }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl" style={{ background: '#b3392f', boxShadow: '0 20px 50px rgba(179,57,47,0.5)' }}>
        <div className="px-6 pb-5 pt-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>Darurat</div>
          <div className="mt-1 text-2xl font-bold text-white">{(TYPE_LABEL[current.emergency_type] ?? 'Darurat').toUpperCase()}</div>
          <div className="mt-2 text-[15px] font-bold text-white">
            {current.reporterName}
            {current.houseLabel ? ` · Rumah ${current.houseLabel}` : ''}
          </div>
          {current.message ? (
            <p className="mt-2 text-[13.5px] font-medium" style={{ color: 'rgba(255,255,255,0.92)' }}>{current.message}</p>
          ) : null}
          <div className="mt-2 text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {new Date(current.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            {queue.length > 1 ? ` · +${queue.length - 1} alert lain` : ''}
          </div>
        </div>
        <div className="flex flex-col gap-2 px-5 pb-5">
          <Link
            href={userRef.current?.responder ? `/keamanan/darurat/${current.id}` : '/darurat'}
            onClick={() => dismiss(current.id)}
            className="block w-full rounded-xl py-3 text-center text-sm font-bold"
            style={{ background: '#ffffff', color: '#b3392f' }}
          >
            {userRef.current?.responder ? 'Buka & Tangani' : 'Lihat Detail'}
          </Link>
          <button
            type="button"
            onClick={() => dismiss(current.id)}
            className="w-full rounded-xl py-2.5 text-[13px] font-bold"
            style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.6)' }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}