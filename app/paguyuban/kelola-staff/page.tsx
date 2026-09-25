import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import { createStaffAccount, updateStaffAccount, deleteStaffAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'it_support', label: 'IT Support' },
]

const ALLOWED_CALLER_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
  { title: 'Pengumuman', href: '/pengumuman' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
]

export default async function KelolaStaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_CALLER_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Paguyuban dan Superadmin.</p>
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
    .in('role', ['security', 'it_support'])
    .order('created_at', { ascending: false })

  const securityCount = (accounts ?? []).filter((a) => a.role === 'security').length
  const itSupportCount = (accounts ?? []).filter((a) => a.role === 'it_support').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Staff
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Tambah, edit, atau hapus akun Security dan IT Support.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Security"
          value={securityCount}
          iconBg="#a8c8f0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="IT Support"
          value={itSupportCount}
          iconBg="#c9b8f0"
          iconPath="M6 4h12v10H6zM2 20h20M9 17l-1 3M15 17l1 3"
        />
        <StatCard
          label="Total Staff"
          value={(accounts ?? []).length}
          iconBg="#e6c98a"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Daftar Staff
          </div>
          <AdminAccountTable
            accounts={accounts ?? []}
            roleOptions={ROLE_OPTIONS}
            updateAction={updateStaffAccount}
            deleteAction={deleteStaffAccount}
          />
        </div>

        <div>
          <AdminAccountPanel title="Tambah Akun Staff" roleOptions={ROLE_OPTIONS} createAction={createStaffAccount} />
        </div>
      </div>
    </AdminLayout>
  )
}
