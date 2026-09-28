'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'

// Pusat Alert Darurat untuk Security & Pengurus. Database memeriksa ulang peran (is_responder + RPC Step 321).

const TEAM_KINDS = ['menuju', 'tiba', 'update', 'chat', 'logbook'] as const
type TeamKind = (typeof TEAM_KINDS)[number]

async function responder() {
  const access = await getMyAccess()
  if (!access.canRespondEmergency) return null
  const supabase = await createClient()
  return { supabase, userId: access.userId }
}

function refresh(id?: string) {
  revalidatePath('/keamanan/darurat')
  if (id) revalidatePath(`/keamanan/darurat/${id}`)
  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  revalidatePath('/security')
}

export async function takeAlert(id: string) {
  const ctx = await responder()
  if (!ctx) return { error: 'Hanya Security dan Pengurus yang bisa mengambil alert.' }
  const { error } = await ctx.supabase.rpc('emergency_take', { p_alert: id })
  if (error) return { error: error.message }
  refresh(id)
  return { error: null }
}

// menuju / tiba / update = terlihat pelapor. chat / logbook = internal tim (pelapor tidak melihat).
export async function addTeamEvent(id: string, kind: string, body: string) {
  const ctx = await responder()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!TEAM_KINDS.includes(kind as TeamKind)) return { error: 'Jenis catatan tidak valid.' }
  const text = body.trim()
  if ((kind === 'chat' || kind === 'logbook' || kind === 'update') && !text) return { error: 'Isi catatan dulu.' }
  if (text.length > 1000) return { error: 'Maksimal 1000 karakter.' }

  const defaults: Record<string, string> = { menuju: 'Petugas sedang menuju lokasi.', tiba: 'Petugas sudah tiba di lokasi.' }
  const { error } = await ctx.supabase.from('emergency_events').insert({
    alert_id: id,
    actor_id: ctx.userId,
    kind,
    body: text || defaults[kind] || null,
    is_internal: kind === 'chat' || kind === 'logbook',
  })
  if (error) {
    await logError('darurat: catatan tim', error.message, { id, kind })
    return { error: error.message }
  }
  refresh(id)
  return { error: null }
}

export async function escalateAlert(id: string, note: string) {
  const ctx = await responder()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase.rpc('emergency_escalate', { p_alert: id, p_note: note.trim().slice(0, 500) })
  if (error) return { error: error.message }
  refresh(id)
  return { error: null }
}

export async function closeAlert(id: string, resolution: string, note: string) {
  const ctx = await responder()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!['asli', 'alarm_palsu', 'polisi'].includes(resolution)) return { error: 'Pilih kategori penutupan.' }
  const { error } = await ctx.supabase.rpc('emergency_close', { p_alert: id, p_resolution: resolution, p_note: note.trim().slice(0, 1000) })
  if (error) return { error: error.message }
  refresh(id)
  return { error: null }
}