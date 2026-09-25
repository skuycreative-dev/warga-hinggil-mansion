import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ForumPostForm from '@/components/ForumPostForm'
import ForumFeed from '@/components/ForumFeed'
import NotificationBell from '@/components/NotificationBell'

export default async function ForumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawPosts } = await supabase
    .from('forum_posts')
    .select('id, content, created_at, author:profiles(full_name)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)

  const postIds = (rawPosts ?? []).map((p) => p.id)

  const [{ data: likes }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase.from('forum_likes').select('post_id, user_id').in('post_id', postIds)
      : Promise.resolve({ data: [] as any[] }),
    postIds.length
      ? supabase
          .from('forum_comments')
          .select('id, post_id, content, created_at, author:profiles(full_name)')
          .in('post_id', postIds)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
  ])

  const posts = (rawPosts ?? []).map((p: any) => {
    const postLikes = (likes ?? []).filter((l: any) => l.post_id === p.id)
    const postComments = (comments ?? [])
      .filter((c: any) => c.post_id === p.id)
      .map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author_name: c.author?.full_name ?? 'Warga',
      }))

    return {
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      author_name: p.author?.full_name ?? 'Warga',
      likeCount: postLikes.length,
      likedByMe: !!user && postLikes.some((l: any) => l.user_id === user.id),
      comments: postComments,
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Komunitas
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Forum Warga
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
              Beranda
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <ForumPostForm />
        </div>

        <ForumFeed posts={posts} />
      </div>
    </main>
  )
}
