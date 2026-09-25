import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ModerasiForumTable from '@/components/admin/ModerasiForumTable'

const ALLOWED_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/paguyuban' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
]

export default async function ModerasiForumPage() {
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
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Paguyuban.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: postsRaw } = await supabase
    .from('forum_posts')
    .select('id, content, report_count, created_at, author:profiles(full_name)')
    .eq('is_hidden', true)
    .order('created_at', { ascending: false })

  const posts = (postsRaw ?? []).map((p: any) => ({
    id: p.id,
    content: p.content,
    report_count: p.report_count ?? 0,
    created_at: p.created_at,
    author_name: (Array.isArray(p.author) ? p.author[0]?.full_name : p.author?.full_name) ?? 'Warga',
  }))

  const totalLaporan = posts.reduce((sum, p) => sum + (p.report_count ?? 0), 0)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Moderasi Forum
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Postingan yang disembunyikan otomatis karena dilaporkan warga.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Postingan Disembunyikan"
          value={posts.length}
          badge={posts.length > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#f2b8b0"
          iconPath="M3 3l18 18M10.6 10.6a2 2 0 1 0 2.8 2.8M9.9 4.24A9.1 9.1 0 0 1 12 4c5 0 9 4 10 8-.3 1.1-.86 2.2-1.6 3.2M6.6 6.6C4.4 8 3 10 2 12c1 4 5 8 10 8 1.5 0 2.9-.3 4.2-.9"
        />
        <StatCard
          label="Total Laporan"
          value={totalLaporan}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Postingan Disembunyikan
      </div>
      <ModerasiForumTable posts={posts} />
    </AdminLayout>
  )
}
