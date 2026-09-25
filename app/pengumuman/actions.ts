'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AnnouncementState = { error: string; success: boolean }

const ALLOWED_ROLES = ['manajemen', 'paguyuban', 'security', 'superadmin']

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return null
  }

  return supabase
}

export async function createAnnouncement(prevState: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const isPinned = formData.get('is_pinned') === 'on'

  if (!title || !content) {
    return { error: 'Judul dan isi pengumuman wajib diisi.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return { error: 'Kamu tidak punya akses untuk membuat pengumuman.', success: false }
  }

  const { error } = await supabase.from('announcements').insert({
    title,
    content,
    is_pinned: isPinned,
    created_by: user.id,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function updateAnnouncement(id: string, title: string, content: string, isPinned: boolean) {
  const supabase = await requireAdmin()
  if (!supabase) return { error: 'Tidak punya akses.' }

  const { error } = await supabase
    .from('announcements')
    .update({ title, content, is_pinned: isPinned })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteAnnouncement(id: string) {
  const supabase = await requireAdmin()
  if (!supabase) return

  await supabase.from('announcements').delete().eq('id', id)
  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
}
