'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['it_support', 'superadmin']

async function requireItSupport() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function resolveErrorLog(id: string) {
  const ctx = await requireItSupport()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { error } = await ctx.supabase
    .from('error_logs')
    .update({ resolved: true, resolved_by: ctx.userId, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/it-support')
  return { error: null }
}

export type ErrorLogState = { error: string; success: boolean }

export async function createErrorLog(prevState: ErrorLogState, formData: FormData): Promise<ErrorLogState> {
  const level = (formData.get('level') as string) || 'error'
  const module_ = (formData.get('module') as string)?.trim() || 'app'
  const message = (formData.get('message') as string)?.trim()

  if (!message) {
    return { error: 'Pesan error wajib diisi.', success: false }
  }

  const ctx = await requireItSupport()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const { error } = await ctx.supabase.from('error_logs').insert({
    level,
    module: module_,
    message,
    resolved: false,
  })

  if (error) return { error: error.message, success: false }

  revalidatePath('/it-support')
  return { error: '', success: true }
}
