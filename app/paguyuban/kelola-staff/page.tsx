import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import { createStaffAccount, updateStaffAccount, deleteStaffAccount } from './actions'

const BASE_ROLE_OPTIONS = [
  { value: 'staff_paguyuban:sekretaris', label: 'Sekretaris Paguyuban' },
  { value: 'staff_paguyuban:bendahara', label: 'Bendahara Paguyuban' },
  { value: 'security', label: 'Security' },
]

// IT Support hanya bisa dikelola Superadmin
const IT_SUPPORT_OPTION = { value: 'it_support', label: 'IT Support' }

export default async function KelolaStaffPage() {
  const access = await getMyAccess()

  if (!access.canManageStaff) {
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

  const ROLE_OPTIONS = access.canCreateItSupport ? [...BASE_ROLE_OPTIONS, IT_SUPPORT_OPTION] : BASE_ROLE_OPTIONS
  const visibleRoles = access.canCreateItSupport ? ['staff_paguyuban', 'security', 'it_support'] : ['staff_paguyuban', 'security']

  const supabase = await createClient()
  const { data: accountsRaw } = await supabase
    .from('profiles')
    .select('id, full_name, role, staff_position, created_at')
    .in('role', visibleRoles)
    .order('created_at', { ascending: false })

  // Tabel memakai satu nilai "role" per baris; Sekretaris/Bendahara digabung jadi "staff_paguyuban:jabatan"
  const accounts = (accountsRaw ?? []).map((a: any) => ({
    id: a.id as string,
    full_name: (a.full_name ?? '') as string,
    created_at: a.created_at as string,
    role: a.role === 'staff_paguyuban' ? `staff_paguyuban:${a.staff_position ?? 'sekretaris'}` : (a.role as string),
  }))

  const pengurusCount = accounts.filter((a) => a.role.startsWith('staff_paguyuban')).length
  const securityCount = accounts.filter((a) => a.role === 'security').length
  const itSupportCount = accounts.filter((a) => a.role === 'it_support').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Staff
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          {access.canCreateItSupport
            ? 'Tambah, edit, atau hapus akun Sekretaris, Bendahara, Security, dan IT Support.'
            : 'Tambah, edit, atau hapus akun Sekretaris, Bendahara, dan Security. Akun IT Support dikelola Superadmin.'}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Pengurus Paguyuban"
          value={pengurusCount}
          caption="Sekretaris & Bendahara"
          iconBg="#e6c98a"
          iconPath="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6"
        />
        <StatCard
          label="Security"
          value={securityCount}
          iconBg="#a8c8f0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        {access.canCreateItSupport ? (
          <StatCard
            label="IT Support"
            value={itSupportCount}
            iconBg="#c9b8f0"
            iconPath="M6 4h12v10H6zM2 20h20M9 17l-1 3M15 17l1 3"
          />
        ) : null}
        <StatCard
          label="Total Staff"
          value={accounts.length}
          iconBg="#a8d8c8"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Daftar Staff
          </div>
          <AdminAccountTable
            accounts={accounts}
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