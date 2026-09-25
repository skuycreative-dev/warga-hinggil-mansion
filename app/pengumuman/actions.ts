'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

async function requireAnnouncementAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Belum login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    throw new Error('Tidak punya akses untuk membuat/menghapus pengumuman')
  }

  return { supabase, userId: user.id }
}

export async function createAnnouncement(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    return { error: 'Judul dan isi pengumuman wajib diisi.' }
  }

  const { supabase, userId } = await requireAnnouncementAdmin()

  const { error } = await supabase.from('announcements').insert({
    title,
    content,
    created_by: userId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await requireAnnouncementAdmin()

  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}
