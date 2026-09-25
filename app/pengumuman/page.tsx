import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnnouncementForm from '@/components/AnnouncementForm'
import AnnouncementItem from '@/components/AnnouncementItem'

const ALLOWED_ROLES = ['manajemen', 'paguyuban', 'security', 'superadmin']

export default async function PengumumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let canManage = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    canManage = !!profile && ALLOWED_ROLES.includes(profile.role)
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, is_pinned, created_at')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Info Resmi</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Pengumuman
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {canManage ? (
          <div className="mb-6">
            <AnnouncementForm />
          </div>
        ) : null}

        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-4">
            {announcements.map((item) => {
              const isNew = Date.now() - new Date(item.created_at).getTime() < 1000 * 60 * 60 * 48
              return <AnnouncementItem key={item.id} item={item} canManage={canManage} isNew={isNew} />
            })}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada pengumuman saat ini.
          </p>
        )}
      </div>
    </main>
  )
}
