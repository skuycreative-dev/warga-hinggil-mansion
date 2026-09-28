'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/categories'

function cleanCategory(v: unknown) {
  return ANNOUNCEMENT_CATEGORIES.some((c) => c.key === v) ? (v as string) : 'umum'
}

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

  if (title.length > 150) return { error: 'Judul maksimal 150 karakter.' }
  if (content.length > 5000) return { error: 'Isi maksimal 5000 karakter.' }

  const { supabase, userId } = await requireAnnouncementAdmin()
  const rawImage = String(formData.get('image_path') ?? '')
  const imagePath = rawImage && rawImage.startsWith(`${userId}/`) && !rawImage.includes('..') ? rawImage : null

  const { error } = await supabase.from('announcements').insert({
    title,
    content,
    category: cleanCategory(formData.get('category')),
    image_path: imagePath,
    is_pinned: formData.get('is_pinned') === 'on',
    created_by: userId,
  })

  if (error) {
    return { error: publicError(error) }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await requireAnnouncementAdmin()

  const { data: row } = await supabase.from('announcements').select('image_path').eq('id', id).maybeSingle()
  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) {
    return { error: publicError(error) }
  }
  if (row?.image_path) await supabase.storage.from('announcement-images').remove([row.image_path as string])

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}


async function tryAnnouncementAdmin() {
  try {
    return await requireAnnouncementAdmin()
  } catch {
    return null
  }
}

export async function updateAnnouncement(id: string, title: string, content: string, category?: string) {
  const cleanTitle = title.trim()
  const cleanContent = content.trim()
  if (!cleanTitle || !cleanContent) return { error: 'Judul dan isi pengumuman wajib diisi.' }
  if (cleanTitle.length > 150) return { error: 'Judul maksimal 150 karakter.' }

  const ctx = await tryAnnouncementAdmin()
  if (!ctx) return { error: 'Tidak punya akses untuk mengubah pengumuman.' }

  const { error } = await ctx.supabase.from('announcements').update({ title: cleanTitle, content: cleanContent, ...(category ? { category: cleanCategory(category) } : {}) }).eq('id', id)
  if (error) return { error: publicError(error) }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function setAnnouncementPinned(id: string, pinned: boolean) {
  const ctx = await tryAnnouncementAdmin()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { error } = await ctx.supabase.from('announcements').update({ is_pinned: pinned }).eq('id', id)
  if (error) return { error: publicError(error) }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

// ---------------------------------------------------------------------
// Reaksi & komentar warga (Step 327). Database memeriksa ulang (RLS).
// ---------------------------------------------------------------------
const REACTIONS = ['suka', 'setuju', 'terima_kasih', 'wow']

async function me() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Belum login')
  return { supabase, userId: user.id }
}

// Tekan reaksi yang sama lagi = batal; tekan reaksi lain = ganti
export async function toggleReaction(announcementId: string, reaction: string) {
  if (!REACTIONS.includes(reaction)) return { error: 'Reaksi tidak valid.' }
  const { supabase, userId } = await me()
  const { data: existing } = await supabase
    .from('announcement_reactions')
    .select('reaction')
    .eq('announcement_id', announcementId)
    .eq('user_id', userId)
    .maybeSingle()

  const { error } =
    existing?.reaction === reaction
      ? await supabase.from('announcement_reactions').delete().eq('announcement_id', announcementId).eq('user_id', userId)
      : await supabase.from('announcement_reactions').upsert({ announcement_id: announcementId, user_id: userId, reaction })
  if (error) return { error: error.message.includes('row-level security') ? 'Akunmu perlu diverifikasi dulu.' : publicError(error) }
  revalidatePath('/pengumuman')
  return { error: null }
}

export async function addAnnouncementComment(announcementId: string, body: string) {
  const text = body.trim()
  if (!text) return { error: 'Tulis komentar dulu.' }
  if (text.length > 500) return { error: 'Komentar maksimal 500 karakter.' }
  const { supabase, userId } = await me()
  const { error } = await supabase.from('announcement_comments').insert({ announcement_id: announcementId, user_id: userId, body: text })
  if (error) return { error: error.message.includes('row-level security') ? 'Akunmu perlu diverifikasi dulu.' : publicError(error) }
  revalidatePath('/pengumuman')
  return { error: null }
}

export async function deleteAnnouncementComment(commentId: string) {
  const { supabase } = await me()
  const { data, error } = await supabase.from('announcement_comments').delete().eq('id', commentId).select('id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Komentar tidak bisa dihapus.' }
  revalidatePath('/pengumuman')
  return { error: null }
}