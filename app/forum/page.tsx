import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadForumPosts } from '@/lib/forum-data'
import { FORUM_CATEGORIES } from '@/lib/categories'
import ForumComposer from '@/components/forum/ForumComposer'
import PostCard from '@/components/forum/PostCard'
import NotificationBell from '@/components/NotificationBell'

export const dynamic = 'force-dynamic'

const MODERATORS = ['paguyuban', 'manajemen', 'superadmin']

export default async function ForumPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const sp = await searchParams
  const category = FORUM_CATEGORIES.some((c) => c.key === sp.k) ? (sp.k as string) : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: me }, posts] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    loadForumPosts(supabase, user.id, { category, limit: 30 }),
  ])
  const canModerate = MODERATORS.includes((me?.role as string) ?? '')

  const chip = (active: boolean): React.CSSProperties =>
    active ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>Komunitas</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Forum Warga
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        <ForumComposer userId={user.id} defaultCategory={category ?? undefined} />

        <nav aria-label="Kategori forum" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/forum" className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold" style={chip(!category)}>
            Semua
          </Link>
          {FORUM_CATEGORIES.map((c) => (
            <Link key={c.key} href={`/forum?k=${c.key}`} className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold" style={chip(category === c.key)}>
              {c.label}
            </Link>
          ))}
        </nav>

        {posts.length === 0 ? (
          <p className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
            Belum ada postingan{category ? ' di kategori ini' : ''}. Jadilah yang pertama menulis!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} myId={user.id} canModerate={canModerate} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}