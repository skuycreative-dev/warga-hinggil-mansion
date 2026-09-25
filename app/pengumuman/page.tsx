import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnnouncementForm from '@/components/AnnouncementForm'
import AnnouncementList from '@/components/AnnouncementList'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

export default async function PengumumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  const canManage = !!myProfile && ADMIN_ROLES.includes(myProfile.role)

  const { data: announcementsRaw } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, author:profiles(full_name)')
    .order('created_at', { ascending: false })

  const announcements = (announcementsRaw ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    created_at: a.created_at,
    author_name: (Array.isArray(a.author) ? a.author[0]?.full_name : a.author?.full_name) ?? 'Admin',
  }))

  return (
    <main className="flex w-full flex-col" style={{ background: '#faf7f0' }}>
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#e6c98a' }}>
            ← Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-8 pt-1 md:px-10 md:pb-10">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Informasi Warga
          </span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            Pengumuman
          </h1>
        </div>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 md:px-10 md:py-10">
          {canManage ? <AnnouncementForm /> : null}
          <AnnouncementList items={announcements} canManage={canManage} />
        </div>
      </section>
    </main>
  )
}
