'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SubmitTukangState = { error: string; success: boolean }

export async function submitTukang(prevState: SubmitTukangState, formData: FormData): Promise<SubmitTukangState> {
  const name = (formData.get('name') as string)?.trim()
  const specialty = (formData.get('specialty') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!name || !specialty || !phone) {
    return { error: 'Nama, keahlian, dan nomor HP wajib diisi.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('tukang_catalog').insert({
    name,
    specialty,
    phone,
    description: description || null,
    submitted_by: user.id,
    status: 'pending',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/tukang')
  return { error: '', success: true }
}

// Kebutuhan #11: katalog tukang dikelola Manajemen DAN Paguyuban
async function requireTukangManager() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['manajemen', 'paguyuban', 'superadmin'].includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function approveTukang(id: string) {
  const ctx = await requireTukangManager()
  if (!ctx) return
  await ctx.supabase
    .from('tukang_catalog')
    .update({ status: 'approved', approved_by: ctx.userId, approved_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/tukang')
  revalidatePath('/tukang/kelola')
}

export async function rejectTukang(id: string) {
  const ctx = await requireTukangManager()
  if (!ctx) return
  await ctx.supabase.from('tukang_catalog').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/tukang')
  revalidatePath('/tukang/kelola')
}