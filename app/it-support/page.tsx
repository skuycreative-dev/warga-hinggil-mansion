import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ErrorLogTable from '@/components/admin/ErrorLogTable'

const ALLOWED_ROLES = ['it_support', 'superadmin']

const NAV_ITEMS = [{ title: 'Error Logs', href: '/it-support' }]

export default async function ItSupportPage() {
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
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus IT Support.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: logs } = await supabase
    .from('error_logs')
    .select('id, level, module, message, resolved, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const allLogs = logs ?? []
  const belumSelesai = allLogs.filter((l) => !l.resolved).length
  const now = new Date()
  const errorLogs24h = allLogs.filter((l) => Date.now() - new Date(l.created_at).getTime() < 1000 * 60 * 60 * 24).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="IT Support" userName={myProfile.full_name ?? 'IT Support'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>IT Support</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Error Logs
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Kamu tidak dapat mengakses data pribadi warga, keuangan, atau chat. Hanya log error sistem.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Total Log"
          value={allLogs.length}
          iconBg="#a8c8f0"
          iconPath="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        />
        <StatCard
          label="Belum Diperbaiki"
          value={belumSelesai}
          badge={belumSelesai > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#f2b8b0"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Log 24 Jam Terakhir"
          value={errorLogs24h}
          iconBg="#e6c98a"
          iconPath="M12 6v6l4 2"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Log Terbaru
      </div>
      <ErrorLogTable logs={allLogs} />
    </AdminLayout>
  )
}
