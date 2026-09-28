'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { addDaysIso } from '@/lib/patrol'

// Jadwal jaga dikelola Security, Ketua Paguyuban, Superadmin; semua pengguna bisa melihat (Step 321)

async function team() {
  const access = await getMyAccess()
  if (!access.canPatrol) return null
  const supabase = await createClient()
  return { supabase, userId: access.userId }
}

function refresh() {
  revalidatePath('/keamanan/jadwal-jaga')
  revalidatePath('/jadwal-jaga')
  revalidatePath('/security')
  revalidatePath('/dashboard')
}

const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v)
const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v)

export type ShiftInput = {
  date: string
  repeatDays: number
  startTime: string
  endTime: string
  securityIds: string[]
  post: string
  note: string
}

export async function addShifts(input: ShiftInput) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.', count: 0 }
  if (!isDate(input.date)) return { error: 'Tanggal tidak valid.', count: 0 }
  if (!isTime(input.startTime) || !isTime(input.endTime)) return { error: 'Jam tidak valid.', count: 0 }
  if (input.startTime === input.endTime) return { error: 'Jam mulai dan selesai tidak boleh sama.', count: 0 }
  if (!input.securityIds.length) return { error: 'Pilih petugas Security.', count: 0 }
  if (!Number.isInteger(input.repeatDays) || input.repeatDays < 1 || input.repeatDays > 31) return { error: 'Ulangi 1-31 hari.', count: 0 }
  const post = input.post.trim() || 'Pos Utama'
  if (post.length > 40) return { error: 'Nama pos maksimal 40 karakter.', count: 0 }
  if (input.note.trim().length > 120) return { error: 'Catatan maksimal 120 karakter.', count: 0 }

  const rows = Array.from({ length: input.repeatDays }).flatMap((_, i) =>
    input.securityIds.map((sid) => ({
      shift_date: addDaysIso(input.date, i),
      start_time: input.startTime,
      end_time: input.endTime,
      security_id: sid,
      post,
      note: input.note.trim() || null,
      created_by: ctx.userId,
    }))
  )

  const { data, error } = await ctx.supabase
    .from('security_shifts')
    .upsert(rows, { onConflict: 'shift_date,start_time,security_id', ignoreDuplicates: true })
    .select('id')
  if (error) return { error: publicError(error), count: 0 }
  refresh()
  return { error: null, count: data?.length ?? 0 }
}

export async function deleteShift(id: string) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase.from('security_shifts').delete().eq('id', id)
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}

// Salin semua jadwal dari minggu sebelumnya ke minggu ini (yang sudah ada tidak dobel)
export async function copyPreviousWeek(weekStart: string) {
  const ctx = await team()
  if (!ctx) return { error: 'Tidak punya akses.', count: 0 }
  if (!isDate(weekStart)) return { error: 'Tanggal tidak valid.', count: 0 }

  const prevStart = addDaysIso(weekStart, -7)
  const { data: prev, error: readError } = await ctx.supabase
    .from('security_shifts')
    .select('shift_date, start_time, end_time, security_id, post, note')
    .gte('shift_date', prevStart)
    .lte('shift_date', addDaysIso(prevStart, 6))
  if (readError) return { error: publicError(readError), count: 0 }
  if (!prev?.length) return { error: 'Minggu lalu belum ada jadwal.', count: 0 }

  const rows = prev.map((s: any) => ({ ...s, shift_date: addDaysIso(s.shift_date, 7), created_by: ctx.userId }))
  const { data, error } = await ctx.supabase
    .from('security_shifts')
    .upsert(rows, { onConflict: 'shift_date,start_time,security_id', ignoreDuplicates: true })
    .select('id')
  if (error) return { error: publicError(error), count: 0 }
  refresh()
  return { error: null, count: data?.length ?? 0 }
}