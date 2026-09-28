'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { publicError } from '@/lib/safe-error'
import { FORUM_CATEGORIES } from '@/lib/categories'

type Result = { error: string | null }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function createForumPost(input: { content: string; category: string; imagePaths: string[] }): Promise<Result> {
  const content = String(input?.content ?? '').trim()
  const category = FORUM_CATEGORIES.some((c) => c.key === input?.category) ? input.category : 'umum'
  if (!content) return { error: 'Tulis pesan terlebih dahulu.' }
  if (content.length > 3000) return { error: 'Tulisan maksimal 3000 karakter.' }

  const { supabase, user } = await requireUser()
  const imagePaths = (input?.imagePaths ?? []).filter((p) => typeof p === 'string' && p.startsWith(`${user.id}/`) && !p.includes('..')).slice(0, 4)

  const { error } = await supabase.from('forum_posts').insert({ author_id: user.id, content, category, image_paths: imagePaths })
  if (error) return { error: publicError(error) }

  revalidatePath('/forum')
  return { error: null }
}

export async function deleteForumPost(postId: string): Promise<Result> {
  const { supabase } = await requireUser()
  const { data: post } = await supabase.from('forum_posts').select('id, image_paths').eq('id', postId).maybeSingle()
  if (!post) return { error: 'Postingan tidak ditemukan.' }
  const { data: deleted, error } = await supabase.from('forum_posts').delete().eq('id', postId).select('id')
  if (error) return { error: publicError(error) }
  if (!deleted?.length) return { error: 'Kamu hanya bisa menghapus postingan sendiri.' }
  const paths = (post.image_paths as string[] | null) ?? []
  if (paths.length) await supabase.storage.from('forum-photos').remove(paths)
  revalidatePath('/forum')
  return { error: null }
}

export async function toggleLike(postId: string) {
  const { supabase, user } = await requireUser()
  const { data: existing } = await supabase.from('forum_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle()
  if (existing) {
    await supabase.from('forum_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: user.id })
  }
  revalidatePath('/forum')
  revalidatePath(`/forum/${postId}`)
}

export async function addComment(postId: string, content: string): Promise<Result> {
  const text = String(content ?? '').trim()
  if (!text) return { error: 'Komentar kosong.' }
  if (text.length > 1000) return { error: 'Komentar maksimal 1000 karakter.' }
  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('forum_comments').insert({ post_id: postId, author_id: user.id, content: text })
  if (error) return { error: publicError(error) }
  revalidatePath('/forum')
  revalidatePath(`/forum/${postId}`)
  return { error: null }
}

export async function deleteForumComment(commentId: string, postId: string): Promise<Result> {
  const { supabase } = await requireUser()
  const { data: deleted, error } = await supabase.from('forum_comments').delete().eq('id', commentId).select('id')
  if (error) return { error: publicError(error) }
  if (!deleted?.length) return { error: 'Kamu hanya bisa menghapus komentar sendiri.' }
  revalidatePath(`/forum/${postId}`)
  revalidatePath('/forum')
  return { error: null }
}

export async function reportPost(postId: string) {
  const { supabase, user } = await requireUser()
  await supabase.from('forum_reports').insert({ post_id: postId, reporter_id: user.id })
  revalidatePath('/forum')
}