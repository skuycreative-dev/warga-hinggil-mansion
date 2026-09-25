'use server'

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

  const { data: poll, error } = await supabase
    .from('polls')
    .insert({ title, description: description || null, created_by: user.id })
    .select('id')
    .single()

  if (error || !poll) {
    return { error: error?.message ?? 'Gagal membuat polling.', success: false }
  }

  const { error: optError } = await supabase
    .from('poll_options')
    .insert(options.map((option_text) => ({ poll_id: poll.id, option_text })))

  if (optError) {
    return { error: optError.message, success: false }
  }

  revalidatePath('/polling')
  return { error: '', success: true }
}

export async function votePoll(pollId: string, optionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, voter_id: user.id })
  revalidatePath('/polling')
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
}
