import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { displayName } from '@/lib/display-name'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import { loadAlerts } from '@/lib/emergency-data'
import { minutesLabel, typeLabel } from '@/lib/emergency'
import { rupiah, todayWib } from '@/lib/format'

export const dynamic = 'force-dynamic'

const ROLE_LABEL: Record<string, string> = {
  warga: 'Warga',
  paguyuban: 'Ketua Paguyuban',
  staff_paguyuban: 'Staff Paguyuban',
  manajemen: 'Manajemen',
  security: 'Security',
  it_support: 'IT Support',
  superadmin: 'Superadmin',
}

const SHORTCUTS = [
  { title: 'Dashboard Paguyuban', href: '/paguyuban' },
  { title: 'Dashboard Manajemen', href: '/manajemen' },
  { title: 'Dashboard Security', href: '/security' },
  { title: 'Alert Darurat', href: '/keamanan/darurat' },
  { title: 'Rumah Kosong', href: '/keamanan/rumah-kosong' },
  { title: 'Jadwal Jaga', href: '/keamanan/jadwal-jaga' },
  { title: 'Iuran IPL', href: '/iuran-ipl' },
  { title: 'Anggaran Paguyuban', href: '/anggaran' },
  { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
  { title: 'Kelola Warga', href: '/kelola-warga' },
  { title: 'Statistik Warga', href: '/statistik' },
  { title: 'Kelola Admin', href: '/superadmin' },
  { title: 'Kelola Fitur', href: '/superadmin/fitur' },
  { title: 'Error Logs', href: '/it-support' },
]

type Activity = { at: string; title: string; detail: string; href: string; tone: string }

function ago(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'baru saja'
  if (min < 60) return `${min} mnt lalu`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

export default async function SuperadminDashboardPage() {
  const access = await getMyAccess()

  if (!access.isSuperadmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const today = todayWib()
  const monthStart = `${today.slice(0, 7)}-01`
  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: people },
    { data: tx },
    alerts,
    { count: openComplaints },
    { count: errors24 },
    { data: bills },
    { data: features },
    { data: recentComplaints },
    { data: recentAnnouncements },
    { data: accessLogs },
    { count: emptyHouses },
  ] = await Promise.all([
    supabase.from('profiles').select('id, full_name, nickname, role, account_status, created_at').limit(5000),
    supabase.from('iuran_transactions').select('type, amount, category, created_at, transaction_date').limit(10000),
    loadAlerts(supabase, { sinceIso: since30, limit: 300 }),
    supabase.from('complaints').select('id', { count: 'exact', head: true }).neq('status', 'selesai'),
    supabase.from('error_logs').select('id', { count: 'exact', head: true }).gte('created_at', since24),
    supabase.from('iuran_payment_status').select('amount_due, late_fee, amount_paid, status').neq('status', 'lunas').limit(5000),
    supabase.from('app_features').select('key, enabled'),
    supabase.from('complaints').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('announcements').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('sensitive_access_logs').select('id, user_id, page, detail, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('house_absences').select('id', { count: 'exact', head: true }).eq('status', 'aktif').lte('start_date', today).gte('end_date', today),
  ])

  const all = people ?? []
  const roleCount = new Map<string, number>()
  all.forEach((p: any) => roleCount.set(p.role, (roleCount.get(p.role) ?? 0) + 1))
  const waitingVerify = all.filter((p: any) => p.role === 'warga' && p.account_status === 'menunggu_verifikasi').length
  const activeWarga = all.filter((p: any) => p.role === 'warga' && p.account_status === 'aktif').length
  const admins = all.length - (roleCount.get('warga') ?? 0)
  const nameMap = new Map(all.map((p: any) => [p.id as string, displayName(p)]))

  const txs = tx ?? []
  const saldo = txs.reduce((s: number, t: any) => s + (t.type === 'pemasukan' ? Number(t.amount) : -Number(t.amount)), 0)
  const masukBulanIni = txs.filter((t: any) => t.type === 'pemasukan' && String(t.transaction_date) >= monthStart).reduce((s: number, t: any) => s + Number(t.amount), 0)

  const tunggakan = (bills ?? []).reduce((s: number, b: any) => s + Math.max(Number(b.amount_due) + Number(b.late_fee ?? 0) - Number(b.amount_paid ?? 0), 0), 0)
  const responseTimes = alerts.filter((a) => a.accepted_at).map((a) => new Date(a.accepted_at!).getTime() - new Date(a.created_at).getTime())
  const avgResponse = responseTimes.length ? responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length : null
  const openAlerts = alerts.filter((a) => a.status !== 'selesai')
  const disabledFeatures = (features ?? []).filter((f: any) => f.enabled === false).length

  const activity: Activity[] = [
    ...alerts.slice(0, 5).map((a) => ({
      at: a.created_at,
      title: `Alert ${typeLabel(a.emergency_type)} oleh ${a.reporter_name}${a.nomor_rumah ? ` (${a.nomor_rumah})` : ''}`,
      detail: a.status === 'selesai' ? `Selesai${a.accepted_at ? ` · respons ${minutesLabel(new Date(a.accepted_at).getTime() - new Date(a.created_at).getTime())}` : ''}` : a.status === 'ditangani' ? `Ditangani ${a.handled_by_name ?? ''}` : 'MENUNGGU RESPONS',
      href: `/keamanan/darurat/${a.id}`,
      tone: a.status === 'aktif' ? '#b3392f' : '#2f6b4f',
    })),
    ...(recentComplaints ?? []).map((c: any) => ({ at: c.created_at, title: `Pengaduan: ${c.title}`, detail: `Status ${c.status}`, href: '/manajemen', tone: '#7a5a1f' })),
    ...(recentAnnouncements ?? []).map((a: any) => ({ at: a.created_at, title: `Pengumuman: ${a.title}`, detail: 'Dipublikasikan', href: '/pengumuman', tone: '#3b5b8a' })),
    ...all
      .filter((p: any) => p.role === 'warga')
      .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 5)
      .map((p: any) => ({
        at: p.created_at,
        title: `Warga baru: ${displayName(p)}`,
        detail: p.account_status === 'menunggu_verifikasi' ? 'Menunggu verifikasi' : 'Aktif',
        href: '/verifikasi-akun',
        tone: p.account_status === 'menunggu_verifikasi' ? '#b3392f' : '#5b543f',
      })),
    ...txs
      .slice()
      .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, 5)
      .map((t: any) => ({
        at: t.created_at,
        title: `${t.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} kas ${rupiah(Number(t.amount))}`,
        detail: t.category ?? '',
        href: '/anggaran',
        tone: t.type === 'pemasukan' ? '#2f6b4f' : '#b3392f',
      })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12)

  const maxRole = Math.max(1, ...Array.from(roleCount.values()))

  return (
    <AdminLayout portalLabel="Portal Superadmin" roleLabel="Superadmin" userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin Mode</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Overview Perumahan
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          {new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {disabledFeatures ? ` · ${disabledFeatures} fitur dinonaktifkan` : ''}
        </p>
      </div>

      {openAlerts.length ? (
        <Link href="/keamanan/darurat" className="mb-5 block rounded-2xl px-5 py-4" style={{ background: '#b3392f' }}>
          <div className="text-[14px] font-bold text-white">⚠ {openAlerts.length} alert darurat sedang aktif — buka Command Center →</div>
        </Link>
      ) : null}

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Pengguna" value={all.length} caption={`Warga aktif ${activeWarga} · Admin ${admins}`} iconBg="#a8c8f0" iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <StatCard label="Saldo Kas Paguyuban" value={rupiah(saldo)} caption={`+${rupiah(masukBulanIni)} bulan ini`} iconBg="#a8d8c8" iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <StatCard label="Alert Darurat 30 Hari" value={alerts.length} caption={`Rata-rata respons ${minutesLabel(avgResponse)}`} iconBg="#f2b8b0" iconPath="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <StatCard label="Error 24 Jam" value={errors24 ?? 0} badge={(errors24 ?? 0) > 0 ? 'CEK' : undefined} caption="Dari Error Logs" iconBg="var(--brand-accent)" iconPath="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <StatCard label="Menunggu Verifikasi" value={waitingVerify} badge={waitingVerify ? 'PERLU AKSI' : undefined} iconBg="#c9b8f0" iconPath="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <StatCard label="Pengaduan Terbuka" value={openComplaints ?? 0} iconBg="var(--brand-accent)" iconPath="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
        <StatCard label="Tunggakan IPL" value={rupiah(tunggakan)} caption={`${(bills ?? []).length} tagihan belum lunas`} iconBg="#f2b8b0" iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <StatCard label="Rumah Kosong" value={emptyHouses ?? 0} caption="Sedang dalam patroli" iconBg="#a8d8c8" iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-2xl px-5 py-4 lg:col-span-2" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Aktivitas Terbaru</h2>
          {activity.length === 0 ? <p className="text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada aktivitas.</p> : null}
          <div className="flex flex-col">
            {activity.map((a, i) => (
              <Link key={i} href={a.href} className="flex items-start justify-between gap-3 py-2.5 hover:opacity-80" style={{ borderTop: i ? '1px solid rgba(26,19,5,0.06)' : undefined }}>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold" style={{ color: '#1f1a10' }}>{a.title}</div>
                  <div className="text-[11.5px] font-semibold" style={{ color: a.tone }}>{a.detail}</div>
                </div>
                <span className="flex-shrink-0 text-[11px]" style={{ color: '#9c7a3f' }}>{ago(a.at)}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Distribusi Role</h2>
            <div className="flex flex-col gap-2">
              {Array.from(roleCount.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([role, count]) => (
                  <div key={role}>
                    <div className="flex justify-between text-[12px]" style={{ color: '#3d3727' }}>
                      <span>{ROLE_LABEL[role] ?? role}</span>
                      <b>{count}</b>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: '#f1ece0' }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / maxRole) * 100}%`, background: 'var(--brand-theme)' }} />
                    </div>
                  </div>
                ))}
            </div>
            <Link href="/superadmin" className="mt-3 block rounded-lg py-2 text-center text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>+ Tambah Admin</Link>
          </section>

          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-1 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Akses Data Sensitif</h2>
            <p className="mb-2 text-[11.5px]" style={{ color: '#9c7a3f' }}>Siapa membuka data rumah kosong.</p>
            {(accessLogs ?? []).length === 0 ? <p className="text-[12px]" style={{ color: '#5b543f' }}>Belum ada.</p> : null}
            {(accessLogs ?? []).map((l: any) => (
              <div key={l.id} className="flex justify-between gap-2 py-1 text-[12px]" style={{ borderTop: '1px solid rgba(26,19,5,0.05)' }}>
                <span style={{ color: '#3d3727' }}>
                  <b>{nameMap.get(l.user_id) ?? 'Pengguna'}</b> · {l.page}
                </span>
                <span className="flex-shrink-0" style={{ color: '#9c7a3f' }}>{ago(l.created_at)}</span>
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="mb-3 mt-7 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Semua Dashboard</div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {SHORTCUTS.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-xl px-4 py-3 text-[13px] font-bold transition hover:-translate-y-0.5" style={{ background: '#ffffff', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.08)' }}>
            {s.title} →
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}