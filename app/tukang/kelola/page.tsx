import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import TukangKelolaTable from '@/components/admin/TukangKelolaTable'

const ALLOWED_ROLES = ['manajemen', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/manajemen' },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function TukangKelolaPage() {
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
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Manajemen Perumahan.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: pendingRaw } = await supabase
    .from('tukang_catalog')
    .select('id, name, specialty, phone, description, created_at, submitter:profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const pending = (pendingRaw ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    phone: t.phone,
    description: t.description,
    created_at: t.created_at,
    submitter_name: (Array.isArray(t.submitter) ? t.submitter[0]?.full_name : t.submitter?.full_name) ?? 'Warga',
  }))

  const { count: totalApproved } = await supabase
    .from('tukang_catalog')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalRejected } = await supabase
    .from('tukang_catalog')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'rejected')

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Manajemen Perumahan" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Manajemen Perumahan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Katalog Tukang
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Verifikasi tukang yang didaftarkan warga sebelum tampil di Katalog Tukang.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          badge={pending.length > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Terverifikasi"
          value={totalApproved ?? 0}
          iconBg="#a8d8c8"
          iconPath="m9 12 2 2 4-4M21 12c0 4.5-3.5 8.5-9 10-5.5-1.5-9-5.5-9-10V5l9-3 9 3v7Z"
        />
        <StatCard
          label="Ditolak"
          value={totalRejected ?? 0}
          iconBg="#f2b8b0"
          iconPath="M18 6 6 18M6 6l12 12"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Menunggu Verifikasi
      </div>
      <TukangKelolaTable items={pending} />
    </AdminLayout>
  )
}
