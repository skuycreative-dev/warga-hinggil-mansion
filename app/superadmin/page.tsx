import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import { createAdminAccount, updateAdminAccount, deleteAdminAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'manajemen', label: 'Admin Manajemen Perumahan' },
  { value: 'paguyuban', label: 'Admin Paguyuban' },
]

const NAV_ITEMS = [
  { title: 'Kelola Admin', href: '/superadmin' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function SuperadminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || myProfile.role !== 'superadmin') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: accounts } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['manajemen', 'paguyuban'])
    .order('created_at', { ascending: false })

  const { count: wargaCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'warga')

  const paguyubanCount = (accounts ?? []).filter((a) => a.role === 'paguyuban').length
  const manajemenCount = (accounts ?? []).filter((a) => a.role === 'manajemen').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Superadmin" userName={myProfile.full_name ?? 'Superadmin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Admin
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Tambah, edit, atau hapus akun Admin Paguyuban dan Admin Manajemen Perumahan.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total Warga"
          value={wargaCount ?? 0}
          caption="Akun aktif"
          iconBg="#e6c98a"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
        <StatCard
          label="Admin Paguyuban"
          value={paguyubanCount}
          iconBg="#c9b8f0"
          iconPath="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6"
        />
        <StatCard
          label="Admin Manajemen"
          value={manajemenCount}
          iconBg="#a8d8c8"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Total Admin"
          value={(accounts ?? []).length}
          iconBg="#f2b8b0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Daftar Admin
          </div>
          <AdminAccountTable
            accounts={accounts ?? []}
            roleOptions={ROLE_OPTIONS}
            updateAction={updateAdminAccount}
            deleteAction={deleteAdminAccount}
          />
        </div>

        <div>
          <AdminAccountPanel title="Tambah Akun Admin" roleOptions={ROLE_OPTIONS} createAction={createAdminAccount} />
        </div>
      </div>
    </AdminLayout>
  )
}
