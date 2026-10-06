'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CreatePollState = { error: string; success: boolean }

export async function createPoll(prevState: CreatePollState, formData: FormData): Promise<CreatePollState> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const optionsRaw = (formData.get('options') as string) ?? ''
  const options = optionsRaw
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean)

  if (!title || options.length < 2) {
    return { error: 'Judul wajib diisi dan minimal 2 pilihan jawaban.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return { error: 'Kamu tidak punya akses untuk membuat polling.', success: false }
  }

  // Gambar (opsional) sudah diunggah dari HP ke bucket privat poll-images, di folder milik pembuat.
  const rawImage = String(formData.get('image_path') ?? '')
  const imagePath = rawImage && rawImage.startsWith(`${user.id}/`) && !rawImage.includes('..') ? rawImage : null

  const { data: poll, error } = await supabase
    .from('polls')
    .insert({ title, description: description || null, image_path: imagePath, created_by: user.id })
    .select('id')
    .single()

  if (error || !poll) {
    return { error: publicError(error, 'Gagal membuat polling.'), success: false }
  }

  const { error: optError } = await supabase
    .from('poll_options')
    .insert(options.map((option_text) => ({ poll_id: poll.id, option_text })))

  if (optError) {
    return { error: publicError(optError), success: false }
  }

  revalidatePath('/polling')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

// Memilih pertama kali DAN mengganti pilihan (selama polling masih terbuka) -- satu jalur,
// aturannya dicek di database (fungsi change_poll_vote).
export async function votePoll(pollId: string, optionId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.rpc('change_poll_vote', { p_poll_id: pollId, p_option_id: optionId })
  if (error) {
    const known = ['Polling sudah ditutup.', 'Akunmu perlu diverifikasi dulu.', 'Pilihan tidak valid.', 'Polling tidak ditemukan.']
    const msg = known.find((k) => error.message.includes(k))
    return { error: msg ?? publicError(error, 'Gagal menyimpan pilihan. Coba lagi.') }
  }
  revalidatePath('/polling')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function closePoll(pollId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) return

  await supabase.from('polls').update({ is_active: false }).eq('id', pollId)
  revalidatePath('/polling')
  revalidatePath('/dashboard')
}