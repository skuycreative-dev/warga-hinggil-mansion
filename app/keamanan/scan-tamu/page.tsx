import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ScanTamuForm from '@/components/ScanTamuForm'
import GuestLogTable from '@/components/admin/GuestLogTable'

const ALLOWED_ROLES = ['security', 'superadmin']

const NAV_ITEMS = [
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu' },
  { title: 'Status Rumah Kosong', href: '/rumah-kosong' },
]

export default async function ScanTamuPage() {
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
    .limit(50)

  const guests = (guestsRaw ?? []).map((g: any) => ({
    ...g,
    house: Array.isArray(g.house) ? g.house[0] : g.house,
  }))

  const tamuDiDalam = guests.filter((g) => g.status === 'masuk').length
  const tamuMenunggu = guests.filter((g) => g.status === 'menunggu').length
  const bulanIni = guests.filter((g) => {
    const d = new Date(g.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Security" userName={myProfile.full_name ?? 'Security'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Security</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Verifikasi Tamu
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Masukkan kode tamu untuk verifikasi masuk, lalu catat saat tamu keluar.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Tamu Di Dalam"
          value={tamuDiDalam}
          iconBg="#a8d8c8"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={tamuMenunggu}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Tamu Bulan Ini"
          value={bulanIni}
          iconBg="#a8c8f0"
          iconPath="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Log Tamu Terbaru
          </div>
          <GuestLogTable guests={guests} />
        </div>

        <div>
          <ScanTamuForm />
        </div>
      </div>
    </AdminLayout>
  )
}
