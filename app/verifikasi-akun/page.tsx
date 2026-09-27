import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import VerifikasiAccountTable from '@/components/admin/VerifikasiAccountTable'
import { approveAccount, rejectAccount, deleteWargaAccount } from './actions'

const SUPERADMIN_NAV = [
  { title: 'Kelola Admin', href: '/superadmin' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

const PAGUYUBAN_NAV = [
  { title: 'Dashboard', href: '/paguyuban' },
  { title: 'Verifikasi Akun', href: '/verifikasi-akun' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function VerifikasiAkunPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, full_name, staff_position')
    .eq('id', user.id)
    .maybeSingle()

  const isSuperadmin = myProfile?.role === 'superadmin'
  const isPaguyubanVerifier = myProfile?.role === 'paguyuban' && myProfile?.staff_position !== 'bendahara'

  if (!myProfile || (!isSuperadmin && !isPaguyubanVerifier)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>
            Halaman ini khusus Superadmin, Admin Paguyuban, dan Sekretaris Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: pendingRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone, nik, family_role, occupancy_status, created_at, house:houses(nomor_rumah)')
    .eq('role', 'warga')
    .eq('account_status', 'menunggu_verifikasi')
    .order('created_at', { ascending: true })

  const { data: ditolakRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone, nik, family_role, occupancy_status, created_at, house:houses(nomor_rumah)')
    .eq('role', 'warga')
    .eq('account_status', 'ditolak')
    .order('created_at', { ascending: false })
    .limit(30)

  const normalize = (rows: any[] | null) =>
    (rows ?? []).map((r) => ({ ...r, house: Array.isArray(r.house) ? r.house[0] : r.house }))

  const pending = normalize(pendingRaw)
  const ditolak = normalize(ditolakRaw)

  const navItems = isSuperadmin ? SUPERADMIN_NAV : PAGUYUBAN_NAV
  const roleLabel = isSuperadmin ? 'Superadmin' : myProfile.staff_position === 'sekretaris' ? 'Sekretaris Paguyuban' : 'Ketua Paguyuban'

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={roleLabel} userName={myProfile.full_name ?? 'Admin'} navItems={navItems}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keanggotaan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Verifikasi Akun Warga
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Akun warga baru bisa login dan lihat dashboard, tapi semua fitur terkunci sampai disetujui di sini.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
        <StatCard
          label="Ditolak"
          value={ditolak.length}
          iconBg="#f2b8b0"
          iconPath="M18 6 6 18M6 6l12 12"
        />
      </div>

      <div className="mb-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Menunggu Verifikasi ({pending.length})
        </div>
        <VerifikasiAccountTable accounts={pending} mode="pending" approveAction={approveAccount} rejectAction={rejectAccount} />
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Ditolak — bisa dihapus untuk daftar ulang ({ditolak.length})
        </div>
        <VerifikasiAccountTable accounts={ditolak} mode="ditolak" deleteAction={deleteWargaAccount} />
      </div>
    </AdminLayout>
  )
}