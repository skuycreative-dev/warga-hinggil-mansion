'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ScanState = { error: string; success: boolean }

const ALLOWED_ROLES = ['security', 'superadmin']

async function requireSecurity() {
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

export async function checkInGuest(prevState: ScanState, formData: FormData): Promise<ScanState> {
  const code = (formData.get('visit_code') as string)?.trim()

  if (!code) {
    return { error: 'Masukkan kode tamu.', success: false }
  }

  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }

  const { data: visit, error: findError } = await ctx.supabase
    .from('guest_visits')
    .select('id, status')
    .eq('visit_code', code)
    .eq('status', 'menunggu')
    .maybeSingle()

  if (findError || !visit) {
    return { error: 'Kode tidak ditemukan atau sudah digunakan.', success: false }
  }

  const { error } = await ctx.supabase
    .from('guest_visits')
    .update({ status: 'masuk', checked_in_at: new Date().toISOString(), checked_in_by: ctx.userId })
    .eq('id', visit.id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/keamanan/scan-tamu')
  return { error: '', success: true }
}

export async function checkOutGuest(id: string) {
  const ctx = await requireSecurity()
  if (!ctx) return

  await ctx.supabase
    .from('guest_visits')
    .update({ status: 'keluar', checked_out_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/keamanan/scan-tamu')
}
