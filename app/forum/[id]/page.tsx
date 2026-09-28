import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadForumPosts } from '@/lib/forum-data'
import PostCard from '@/components/forum/PostCard'
import CommentSection from '@/components/forum/CommentSection'

export const dynamic = 'force-dynamic'

const MODERATORS = ['paguyuban', 'manajemen', 'superadmin']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ForumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: me }, posts] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    loadForumPosts(supabase, user.id, { postId: id, limit: 1, withComments: true }),
  ])
  const post = posts[0]
  if (!post) notFound()
  const canModerate = MODERATORS.includes((me?.role as string) ?? '')

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:px-10 md:py-12">
        <Link href="/forum" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#9c7a3f' }}>
          ← Forum Warga
        </Link>
        <PostCard post={post} myId={user.id} canModerate={canModerate} detail />
        <CommentSection postId={post.id} comments={post.comments} myId={user.id} canModerate={canModerate} />
      </div>
    </main>
  )
}