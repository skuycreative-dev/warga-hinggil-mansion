import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminAccountForm from '@/components/AdminAccountForm'
import AdminAccountList from '@/components/AdminAccountList'
import { createStaffAccount, updateStaffAccount, deleteStaffAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'it_support', label: 'IT Support' },
]

const ALLOWED_CALLER_ROLES = ['paguyuban', 'superadmin']

export default async function KelolaStaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

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

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Kelola Staff
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Tambah, edit, atau hapus akun Security dan IT Support.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <AdminAccountForm roleOptions={ROLE_OPTIONS} createAction={createStaffAccount} buttonLabel="+ Tambah Akun Staff" />
        </div>

        <AdminAccountList
          accounts={accounts ?? []}
          roleOptions={ROLE_OPTIONS}
          updateAction={updateStaffAccount}
          deleteAction={deleteStaffAccount}
        />
      </div>
    </main>
  )
}
