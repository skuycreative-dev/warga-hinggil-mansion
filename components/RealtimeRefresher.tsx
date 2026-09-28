'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Memperbarui halaman otomatis saat ada data baru (tanpa reload manual).
// Hanya data yang memang boleh dilihat pengguna yang dikirim database (aturan RLS tetap berlaku).
const TABLES = [
  'announcements',
  'forum_posts',
  'forum_comments',
  'forum_likes',
  'complaints',
  'emergency_alerts',
  'emergency_contacts',
  'polls',
  'poll_votes',
  'chat_messages',
  'friendships',
  'family_items',
  'household_transactions',
  'house_absences',
  'iuran_transactions',
  'iuran_payment_status',
  'guest_visits',
  'profile_change_requests',
  'profile_statuses',
  'tukang_catalog',
  'app_features',
  'ipl_disbursements',
  'ipl_house_rates',
  'ipl_settings',
  'household_accounts',
  'household_debts',
  'household_goals',
  'household_goal_entries',
  'emergency_events',
  'tukang_reviews',
  'tukang_photos',
  'patrol_checks',
  'absence_patrol_plans',
  'security_shifts',
  'service_requests',
  'service_messages',
  'announcement_reactions',
  'announcement_comments',
  'house_occupancy_history',
  'houses',
]

export default function RealtimeRefresher() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    // Banyak perubahan berdekatan digabung jadi satu kali refresh
    const refresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => router.refresh(), 700)
    }

    let channel = supabase.channel(`halaman-live-${Math.random().toString(36).slice(2)}`)
    for (const table of TABLES) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return
      // Perubahan pada akun sendiri (mis. baru diverifikasi Pengurus) langsung membuka fitur
      channel = channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${data.user.id}` }, refresh)
      channel.subscribe()
    })

    // Saat aplikasi dibuka lagi dari latar belakang / internet kembali, langsung ambil data terbaru
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', refresh)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refresh)
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}