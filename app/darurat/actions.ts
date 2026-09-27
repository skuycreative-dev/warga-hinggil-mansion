'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EmergencyState = { error: string; success: boolean }

const RESOLVER_ROLES = ['security', 'paguyuban', 'manajemen', 'superadmin']
const EMERGENCY_TYPES = ['kebakaran', 'maling', 'perampokan', 'kekerasan', 'medis', 'bencana', 'lainnya']

// Tombol darurat sengaja TIDAK mengecek status verifikasi akun: warga baru pun boleh memakainya.
export async function triggerEmergency(prevState: EmergencyState, formData: FormData): Promise<EmergencyState> {
  const message = (formData.get('message') as string)?.trim()
  const emergencyType = (formData.get('emergency_type') as string) || 'lainnya'

  if (!EMERGENCY_TYPES.includes(emergencyType)) {
    return { error: 'Jenis darurat tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('emergency_alerts')
    .select('id')
    .eq('reporter_id', user.id)
    .in('status', ['aktif', 'ditangani'])
    .limit(1)
    .maybeSingle()

  if (existing) {
    return { error: 'Alert darurat kamu masih aktif dan sedang dipantau Security & Pengurus.', success: false }
  }

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('emergency_alerts').insert({
    reporter_id: user.id,
    created_by: user.id,
    emergency_type: emergencyType,
    house_id: profile?.house_id ?? null,
    message: message || null,
    status: 'aktif',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

async function requireResolver() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !RESOLVER_ROLES.includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function handleEmergency(id: string) {
  const requester = await requireResolver()
  if (!requester) return { error: 'Tidak punya akses.' }

  const { error } = await requester.supabase
    .from('emergency_alerts')
    .update({ status: 'ditangani', handled_by: requester.userId })
    .eq('id', id)
    .eq('status', 'aktif')

  if (error) return { error: error.message }

  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function resolveEmergency(id: string) {
  const requester = await requireResolver()
  if (!requester) return { error: 'Tidak punya akses.' }

  const { error } = await requester.supabase
    .from('emergency_alerts')
    .update({ status: 'selesai', resolved_by: requester.userId, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  return { error: null }
}