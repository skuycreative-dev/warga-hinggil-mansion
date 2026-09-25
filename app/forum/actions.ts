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
