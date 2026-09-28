'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'

// Patroli Rumah Kosong: Security, Ketua Paguyuban, Superadmin (database memeriksa ulang, Step 321)

async function team() {
  const access = await getMyAccess()
  if (!access.canPatrol) return null
  const supabase = await createClient()
  return { supabase, userId: access.userId }
}

function refresh() {
  revalidatePath('/keamanan/rumah-kosong')
  revalidatePath('/security')
  revalidatePath('/rumah-kosong')
}

export async function savePatrolPlan(absenceId: string, perDay: number, assignees: string[], note: string) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!Number.isInteger(perDay) || perDay < 1 || perDay > 6) return { error: 'Target patroli 1-6 kali per hari.' }
  if (note.trim().length > 300) return { error: 'Catatan maksimal 300 karakter.' }

  const { error } = await ctx.supabase.from('absence_patrol_plans').upsert({
    absence_id: absenceId,
    per_day: perDay,
    assignees: assignees.slice(0, 10),
    internal_note: note.trim() || null,
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  })
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}

export async function recordPatrol(absenceId: string, houseId: string, result: string, note: string) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!['aman', 'mencurigakan'].includes(result)) return { error: 'Hasil patroli tidak valid.' }
  if (result === 'mencurigakan' && !note.trim()) return { error: 'Jelaskan apa yang mencurigakan.' }
  if (note.trim().length > 300) return { error: 'Catatan maksimal 300 karakter.' }

  const { error } = await ctx.supabase.from('patrol_checks').insert({
    absence_id: absenceId,
    house_id: houseId,
    checked_by: ctx.userId,
    result,
    note: note.trim() || null,
  })
  if (error) {
    await logError('patroli: catat', error.message, { absenceId })
    return { error: publicError(error) }
  }
  refresh()
  return { error: null }
}

// Salah catat: bisa dibatalkan pencatatnya dalam 15 menit (notifikasi ke warga tetap sudah terkirim)
export async function undoPatrol(checkId: string) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { data, error } = await ctx.supabase.from('patrol_checks').delete().eq('id', checkId).select('id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Hanya bisa dibatalkan pencatatnya dalam 15 menit.' }
  refresh()
  return { error: null }
}