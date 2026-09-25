import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ComplaintAdminTable from '@/components/admin/ComplaintAdminTable'

const ALLOWED_ROLES = ['manajemen', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/manajemen' },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function ManajemenDashboardPage() {
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
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Manajemen Perumahan.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { count: totalRumah } = await supabase.from('houses').select('id', { count: 'exact', head: true })

  const { count: wargaAktif } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'warga')
    .eq('account_status', 'aktif')

  const { data: complaintsRaw } = await supabase
    .from('complaints')
    .select('id, title, description, category, status, created_at, house:houses(nomor_rumah), creator:created_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(30)

  const complaints = (complaintsRaw ?? []).map((c: any) => ({
    ...c,
    house: Array.isArray(c.house) ? c.house[0] : c.house,
    creator: Array.isArray(c.creator) ? c.creator[0] : c.creator,
  }))

  const pengaduanBaru = complaints.filter((c) => c.status === 'baru').length
  const pengaduanDiproses = complaints.filter((c) => c.status === 'diproses').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Manajemen Perumahan" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Manajemen Perumahan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Manajemen
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Fokus: pengaduan warga, katalog tukang, pengumuman.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Pengaduan Baru"
          value={pengaduanBaru}
          badge={pengaduanBaru > 0 ? 'URGENT' : undefined}
          caption="Belum diproses"
          iconBg="#f2b8b0"
          iconPath="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        />
        <StatCard
          label="Sedang Diproses"
          value={pengaduanDiproses}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Total Rumah"
          value={totalRumah ?? 0}
          iconBg="#a8d8c8"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Warga Aktif"
          value={wargaAktif ?? 0}
          iconBg="#a8c8f0"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Pengaduan Terbaru
      </div>
      <ComplaintAdminTable complaints={complaints} />
    </AdminLayout>
  )
}
