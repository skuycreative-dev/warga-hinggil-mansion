import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminAccountForm from '@/components/AdminAccountForm'
import AdminAccountList from '@/components/AdminAccountList'
import { createAdminAccount, updateAdminAccount, deleteAdminAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'manajemen', label: 'Admin Manajemen Perumahan' },
  { value: 'paguyuban', label: 'Admin Paguyuban' },
]

export default async function SuperadminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

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

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Kelola Admin
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Tambah, edit, atau hapus akun Admin Paguyuban dan Admin Manajemen Perumahan.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <AdminAccountForm roleOptions={ROLE_OPTIONS} createAction={createAdminAccount} buttonLabel="+ Tambah Akun Admin" />
        </div>

        <AdminAccountList
          accounts={accounts ?? []}
          roleOptions={ROLE_OPTIONS}
          updateAction={updateAdminAccount}
          deleteAction={deleteAdminAccount}
        />
      </div>
    </main>
  )
}
