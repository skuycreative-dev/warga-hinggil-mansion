'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Memperbarui halaman otomatis saat ada data baru (tanpa reload manual).
// Hemat baterai & kuota: tiap halaman hanya mendengarkan tabel yang ditampilkannya,
// dan tidak memuat ulang apa pun saat aplikasi sedang di latar belakang.
// Hanya data yang memang boleh dilihat pengguna yang dikirim database (aturan RLS tetap berlaku).
const ROUTE_TABLES: [string, string[]][] = [
  ['/peta', ['emergency_alerts', 'house_absences', 'houses', 'map_facilities', 'site_plan']],
  ['/dashboard', ['announcements', 'emergency_alerts', 'polls', 'poll_votes', 'house_absences', 'iuran_payment_status', 'profile_change_requests', 'service_requests', 'security_shifts', 'friendships']],
  ['/forum', ['forum_posts', 'forum_comments', 'forum_likes']],
  ['/paguyuban/moderasi-forum', ['forum_posts', 'forum_comments']],
  ['/chat', ['chat_messages', 'friendships', 'profile_statuses']],
  ['/warga', ['friendships', 'profile_statuses']],
  ['/pengumuman', ['announcements', 'announcement_reactions', 'announcement_comments']],
  ['/pengaduan', ['complaints']],
  ['/keamanan/darurat', ['emergency_alerts', 'emergency_events']],
  ['/darurat', ['emergency_alerts', 'emergency_contacts', 'emergency_events']],
  ['/kelola-nomor-darurat', ['emergency_contacts']],
  ['/polling', ['polls', 'poll_votes']],
  ['/qr-tamu', ['guest_visits']],
  ['/keamanan/scan-tamu', ['guest_visits']],
  ['/anggaran', ['iuran_transactions']],
  ['/iuran-ipl', ['iuran_payment_status', 'iuran_transactions', 'ipl_disbursements', 'ipl_house_rates', 'ipl_settings']],
  ['/keuangan-rumah', ['household_transactions', 'household_accounts', 'household_debts', 'household_goals', 'household_goal_entries']],
  ['/keluarga', ['family_items']],
  ['/keamanan/rumah-kosong', ['house_absences', 'patrol_checks', 'absence_patrol_plans']],
  ['/rumah-kosong', ['house_absences', 'patrol_checks']],
  ['/keamanan/jadwal-jaga', ['security_shifts']],
  ['/jadwal-jaga', ['security_shifts']],
  ['/tukang', ['tukang_catalog', 'tukang_reviews', 'tukang_photos']],
  ['/layanan', ['service_requests', 'service_messages']],
  ['/status-hunian', ['house_occupancy_history', 'houses']],
  ['/verifikasi-akun', ['profile_change_requests']],
  ['/profile', ['profile_change_requests', 'profile_statuses']],
  ['/superadmin/keamanan', ['password_reset_requests']],
  ['/superadmin/fitur', ['app_features']],
  ['/superadmin', ['emergency_alerts', 'profile_change_requests', 'password_reset_requests']],
  ['/manajemen', ['complaints', 'iuran_payment_status', 'ipl_disbursements']],
  ['/paguyuban', ['complaints', 'iuran_payment_status', 'ipl_disbursements', 'house_absences']],
  ['/security', ['emergency_alerts', 'house_absences', 'guest_visits', 'security_shifts']],
]

function tablesFor(path: string) {
  const hit = ROUTE_TABLES.find(([prefix]) => path === prefix || path.startsWith(prefix + '/'))
  return Array.from(new Set(['app_features', ...(hit ? hit[1] : [])]))
}

export default function RealtimeRefresher() {
  const router = useRouter()
  const pathname = usePathname() || '/'

  useEffect(() => {
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false
    let pending = false
    let lastRefresh = 0

    const doRefresh = () => {
      pending = false
      lastRefresh = Date.now()
      router.refresh()
    }

    // Banyak perubahan berdekatan digabung jadi satu kali refresh (maks. 1x tiap 2 detik)
    const refresh = () => {
      if (document.visibilityState !== 'visible') {
        pending = true
        return
      }
      if (timer) clearTimeout(timer)
      const wait = Math.max(800, 2000 - (Date.now() - lastRefresh))
      timer = setTimeout(doRefresh, wait)
    }

    let channel = supabase.channel(`halaman-live-${Math.random().toString(36).slice(2)}`)
    for (const table of tablesFor(pathname)) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh)
    }

    let ownChannel: ReturnType<typeof supabase.channel> | null = null
    supabase.auth.getSession().then(({ data: sessionData }) => {
      const data = { user: sessionData.session?.user ?? null }
      if (cancelled || !data.user) return
      channel.subscribe()
      // Perubahan pada akun sendiri (mis. baru diverifikasi Pengurus) langsung membuka fitur.
      // Saluran terpisah: kalau yang ini gagal, pembaruan halaman lain tetap jalan.
      ownChannel = supabase
        .channel(`akun-${data.user.id}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${data.user.id}` }, refresh)
        .subscribe()
    })

    // Saat aplikasi dibuka lagi dari latar belakang / internet kembali: ambil data terbaru
    // hanya kalau ada perubahan selama ditinggal, atau sudah lebih dari 1 menit
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (pending || Date.now() - lastRefresh > 60000)) refresh()
    }
    const onOnline = () => refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', onOnline)
    lastRefresh = Date.now()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', onOnline)
      supabase.removeChannel(channel)
      if (ownChannel) supabase.removeChannel(ownChannel)
    }
  }, [router, pathname])

  return null
}