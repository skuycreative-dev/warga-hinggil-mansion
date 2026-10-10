'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { publicError } from '@/lib/safe-error'
import { FORUM_CATEGORIES } from '@/lib/categories'
import { STICKER_TEXT } from '@/lib/stickers'

type Result = { error: string | null }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

async function activeStickerId(supabase: Awaited<ReturnType<typeof createClient>>, id: unknown): Promise<string | null> {
  if (typeof id !== 'string' || !id) return null
  const { data } = await supabase.from('stickers').select('id').eq('id', id).eq('is_active', true).maybeSingle()
  return (data?.id as string | undefined) ?? null
}

export async function createForumPost(input: { content: string; category: string; imagePaths: string[]; stickerId?: string | null }): Promise<Result> {
  const content = String(input?.content ?? '').trim()
  const category = FORUM_CATEGORIES.some((c) => c.key === input?.category) ? input.category : 'umum'
  if (!content) return { error: 'Tulis pesan terlebih dahulu.' }
  if (content.length > 3000) return { error: 'Tulisan maksimal 3000 karakter.' }

  const { supabase, user } = await requireUser()
  const imagePaths = (input?.imagePaths ?? []).filter((p) => typeof p === 'string' && p.startsWith(`${user.id}/`) && !p.includes('..')).slice(0, 4)

  const stickerId = await activeStickerId(supabase, input?.stickerId)
  const { error } = await supabase.from('forum_posts').insert({ author_id: user.id, content, category, image_paths: imagePaths, sticker_id: stickerId })
  if (error) return { error: publicError(error) }

  revalidatePath('/forum')
  return { error: null }
}

export async function editForumPost(postId: string, content: string, category: string): Promise<Result> {
  const text = String(content ?? '').trim()
  const cat = FORUM_CATEGORIES.some((c) => c.key === category) ? category : 'umum'
  if (!text) return { error: 'Tulisan tidak boleh kosong.' }
  if (text.length > 3000) return { error: 'Tulisan maksimal 3000 karakter.' }

  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ content: text, category: cat, updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', user.id)
    .select('id')

  if (error) return { error: publicError(error) }
  if (!data?.length) return { error: 'Kamu hanya bisa mengubah postingan sendiri.' }

  revalidatePath('/forum')
  revalidatePath(`/forum/${postId}`)
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

export async function addComment(postId: string, content: string, stickerId?: string | null): Promise<Result> {
  const raw = String(content ?? '').trim()
  if (raw.length > 1000) return { error: 'Komentar maksimal 1000 karakter.' }
  const { supabase, user } = await requireUser()
  const sticker = await activeStickerId(supabase, stickerId)
  if (stickerId && !sticker) return { error: 'Stiker tidak tersedia.' }
  // Komentar boleh hanya berisi stiker; kolom teks di database tetap wajib terisi
  const text = raw || (sticker ? STICKER_TEXT : '')
  if (!text) return { error: 'Komentar kosong.' }
  const { error } = await supabase.from('forum_comments').insert({ post_id: postId, author_id: user.id, content: text, sticker_id: sticker })
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