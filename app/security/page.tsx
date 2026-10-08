import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import GuestLogTable from '@/components/admin/GuestLogTable'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { addDaysIso, loadShifts, onDutyNow, todayWib } from '@/lib/patrol'

const ALLOWED_ROLES = ['security', 'superadmin']


export default async function SecurityDashboardPage() {
  const access = await getMyAccess()
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Security.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: guestsRaw } = await supabase
    .from('guest_visits')
    .select('id, guest_name, purpose, visit_code, status, created_at, checked_in_at, checked_out_at, house:houses(nomor_rumah)')
    .order('created_at', { ascending: false })
    .limit(15)

  const guests = (guestsRaw ?? []).map((g: any) => ({
    ...g,
    house: Array.isArray(g.house) ? g.house[0] : g.house,
  }))

  const { count: tamuDiDalam } = await supabase
    .from('guest_visits')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'masuk')

  // Rumah kosong sekarang diaktifkan warga sendiri (tabel house_absences)
  const hariIni = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const { count: rumahKosong } = await supabase
    .from('house_absences')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'aktif')
    .lte('start_date', hariIni)
    .gte('end_date', hariIni)

  const { count: alertAktif } = await supabase
    .from('emergency_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'aktif')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: tamuBulanIni } = await supabase
    .from('guest_visits')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  const { data: rumahKosongRaw } = await supabase
    .from('house_absences')
    .select('id, start_date, end_date, house:houses(nomor_rumah)')
    .eq('status', 'aktif')
    .lte('start_date', hariIni)
    .gte('end_date', hariIni)
    .order('end_date', { ascending: true })
    .limit(6)

  const rumahKosongList = (rumahKosongRaw ?? []).map((a: any) => ({
    id: a.id as string,
    nomor_rumah: ((Array.isArray(a.house) ? a.house[0] : a.house)?.nomor_rumah ?? '-') as string,
    end_date: a.end_date as string,
  }))

  const shifts = await loadShifts(supabase, addDaysIso(todayWib(), -1), todayWib())
  const onDuty = onDutyNow(shifts)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Security" userName={myProfile.full_name ?? 'Security'} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Security</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Security
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Pantau tamu, rumah kosong, dan alert darurat secara real-time.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Tamu Di Dalam"
          value={tamuDiDalam ?? 0}
          iconBg="#a8d8c8"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Rumah Kosong"
          value={rumahKosong ?? 0}
          caption="Perlu patroli ekstra"
          iconBg="var(--brand-accent)"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Alert Darurat"
          value={alertAktif ?? 0}
          badge={(alertAktif ?? 0) > 0 ? 'AKTIF' : undefined}
          caption={(alertAktif ?? 0) > 0 ? 'Butuh respons' : 'Aman terkendali'}
          iconBg="#f2b8b0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Tamu Bulan Ini"
          value={tamuBulanIni ?? 0}
          iconBg="#a8c8f0"
          iconPath="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z"
        />
      </div>

      <div className="mb-7 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Link href="/keamanan/darurat" className="rounded-2xl px-5 py-4 transition hover:-translate-y-0.5" style={{ background: (alertAktif ?? 0) > 0 ? '#b3392f' : '#ffffff', border: '1px solid rgba(179,57,47,0.3)' }}>
          <div className="text-[14px] font-bold" style={{ color: (alertAktif ?? 0) > 0 ? '#ffffff' : '#1f1a10' }}>Alert Command Center →</div>
          <div className="text-[12px]" style={{ color: (alertAktif ?? 0) > 0 ? '#ffe3df' : '#5b543f' }}>
            {(alertAktif ?? 0) > 0 ? `${alertAktif} alert menunggu diambil` : 'Ambil alert, log respons, eskalasi, laporan'}
          </div>
        </Link>
        <Link href="/keamanan/rumah-kosong" className="rounded-2xl px-5 py-4 transition hover:-translate-y-0.5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
          <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Rumah Kosong & Patroli →</div>
          <div className="text-[12px]" style={{ color: '#5b543f' }}>Target patroli, catat patroli, cetak jadwal</div>
        </Link>
        <Link href="/keamanan/jadwal-jaga" className="rounded-2xl px-5 py-4 transition hover:-translate-y-0.5" style={{ background: 'var(--brand-theme)' }}>
          <div className="text-[14px] font-bold" style={{ color: 'var(--brand-accent)' }}>Jadwal Jaga →</div>
          <div className="text-[12px]" style={{ color: '#d8cfb8' }}>
            {onDuty.length ? `Sedang jaga: ${onDuty.map((s) => s.security_name).join(', ')}` : 'Belum ada yang dijadwalkan jam ini'}
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Log Tamu Terbaru
          </div>
          <GuestLogTable guests={guests} />
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Rumah Kosong
          </div>
          <div className="flex flex-col gap-2.5">
            {rumahKosongList && rumahKosongList.length > 0 ? (
              rumahKosongList.map((h) => {
                const days = Math.max(0, Math.ceil((Date.parse(`${h.end_date}T23:59:59+07:00`) - Date.now()) / (1000 * 60 * 60 * 24)))
                return (
                  <div key={h.id} className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{h.nomor_rumah}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: 'rgba(179,57,47,0.12)', color: '#b3392f' }}
                      >
                        {days} HARI LAGI
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl px-5 py-6 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
                Tidak ada rumah kosong.
              </div>
            )}
            <Link
              href="/keamanan/rumah-kosong"
              className="rounded-xl py-2.5 text-center text-[12.5px] font-bold"
              style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}