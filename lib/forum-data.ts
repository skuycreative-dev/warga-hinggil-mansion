import { displayName } from '@/lib/display-name'
import { forumLevel } from '@/lib/forum-level'

export type ForumComment = { id: string; content: string; created_at: string; author_id: string; author_name: string; author_level: string; author_avatar: string | null }
export type ForumPost = {
  id: string
  content: string
  category: string
  created_at: string
  author_id: string
  author_name: string
  author_level: string
  author_avatar: string | null
  images: string[]
  likeCount: number
  likedByMe: boolean
  commentCount: number
  comments: ForumComment[]
}

type Supa = any

// Mengambil postingan forum + foto (link sementara 1 jam) + suka + komentar
export async function loadForumPosts(
  supabase: Supa,
  userId: string,
  opts: { category?: string | null; postId?: string; limit?: number; withComments?: boolean } = {}
): Promise<ForumPost[]> {
  let q = supabase
    .from('forum_posts')
    .select('id, content, category, image_paths, created_at, author_id, author:profiles(full_name, nickname, forum_points, avatar_url)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 30)
  if (opts.postId) q = q.eq('id', opts.postId)
  if (opts.category) q = q.eq('category', opts.category)
  const { data: rows } = await q
  const posts = (rows ?? []) as any[]
  if (!posts.length) return []
  const ids = posts.map((p) => p.id as string)

  const allPaths = posts.flatMap((p) => ((p.image_paths as string[] | null) ?? []).slice(0, 4))
  const [{ data: likes }, { data: comments }, signed] = await Promise.all([
    supabase.from('forum_likes').select('post_id, user_id').in('post_id', ids).limit(20000),
    supabase
      .from('forum_comments')
      .select('id, post_id, content, created_at, author_id, author:profiles(full_name, nickname, forum_points, avatar_url)')
      .in('post_id', ids)
      .order('created_at', { ascending: true })
      .limit(opts.withComments ? 500 : 5000),
    allPaths.length ? supabase.storage.from('forum-photos').createSignedUrls(allPaths, 60 * 60) : Promise.resolve({ data: [] as any[] }),
  ])
  const urlMap = new Map<string, string>()
  for (const s of (signed?.data ?? []) as any[]) if (s?.path && s?.signedUrl) urlMap.set(s.path as string, s.signedUrl as string)

  return posts.map((p) => {
    const author = Array.isArray(p.author) ? p.author[0] : p.author
    const postLikes = ((likes ?? []) as any[]).filter((l) => l.post_id === p.id)
    const postComments = ((comments ?? []) as any[]).filter((c) => c.post_id === p.id)
    return {
      id: p.id,
      content: p.content,
      category: p.category ?? 'umum',
      created_at: p.created_at,
      author_id: p.author_id,
      author_name: displayName(author),
      author_level: forumLevel(author?.forum_points).name,
      author_avatar: (author?.avatar_url as string | null) ?? null,
      images: ((p.image_paths as string[] | null) ?? []).map((path) => urlMap.get(path)).filter(Boolean) as string[],
      likeCount: postLikes.length,
      likedByMe: postLikes.some((l) => l.user_id === userId),
      commentCount: postComments.length,
      comments: opts.withComments
        ? postComments.map((c) => {
            const a = Array.isArray(c.author) ? c.author[0] : c.author
            return {
              id: c.id,
              content: c.content,
              created_at: c.created_at,
              author_id: c.author_id,
              author_name: displayName(a),
              author_level: forumLevel(a?.forum_points).name,
              author_avatar: (a?.avatar_url as string | null) ?? null,
            }
          })
        : [],
    }
  })
}