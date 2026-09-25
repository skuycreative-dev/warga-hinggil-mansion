'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EmergencyState = { error: string; success: boolean }

const RESOLVER_ROLES = ['security', 'paguyuban', 'manajemen', 'superadmin']

export async function triggerEmergency(prevState: EmergencyState, formData: FormData): Promise<EmergencyState> {
  const message = (formData.get('message') as string)?.trim()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('emergency_alerts').insert({
    created_by: user.id,
    house_id: profile?.house_id ?? null,
    message: message || null,
    status: 'aktif',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/darurat')
  return { error: '', success: true }
}

export async function resolveEmergency(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !RESOLVER_ROLES.includes(profile.role)) {
    return { error: 'Tidak punya akses.' }
  }

  const { error } = await supabase
    .from('emergency_alerts')
    .update({ status: 'selesai', resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/darurat')
  return { error: null }
}
