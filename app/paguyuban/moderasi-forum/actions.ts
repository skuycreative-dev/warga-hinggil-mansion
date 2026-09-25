'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function reactivatePost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return
  }

  await supabase.from('forum_posts').update({ is_hidden: false, report_count: 0 }).eq('id', postId)
  await supabase.from('forum_reports').delete().eq('post_id', postId)

  revalidatePath('/paguyuban/moderasi-forum')
  revalidatePath('/forum')
}

export async function deletePostPermanently(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return
  }

  await supabase.from('forum_posts').delete().eq('id', postId)

  revalidatePath('/paguyuban/moderasi-forum')
  revalidatePath('/forum')
}
