'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ForumPostState = {
  error: string
}

export async function createForumPost(
  prevState: ForumPostState,
  formData: FormData
): Promise<ForumPostState> {
  const content = (formData.get('content') as string)?.trim()

  if (!content) {
    return { error: 'Tulis pesan terlebih dahulu.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('forum_posts').insert({
    author_id: user.id,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { error: '' }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('forum_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/forum')
}

export async function addComment(postId: string, content: string) {
  if (!content.trim()) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.from('forum_comments').insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
  })

  revalidatePath('/forum')
}

export async function reportPost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.from('forum_reports').insert({
    post_id: postId,
    reporter_id: user.id,
  })

  revalidatePath('/forum')
}
