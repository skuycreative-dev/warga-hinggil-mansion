'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { getMyHousehold } from '@/lib/household-access'
import { logError } from '@/lib/log-error'

export type FamilyItemInput = {
  kind: 'catatan' | 'event'
  title: string
  content: string
  eventDate: string
  eventTime: string
  shareAll: boolean
  visibleTo: string[]
}

export type FamilyItemState = { error: string; success: boolean }

async function allowedMemberIds(ctx: Awaited<ReturnType<typeof getMyHousehold>>) {
  const { data } = await ctx.supabase
    .from('profiles')
    .select('id')
    .eq('house_id', ctx.houseId!)
    .eq('role', 'warga')
    .eq('account_status', 'aktif')
    .or('family_status.is.null,family_status.eq.dikonfirmasi')
    .neq('id', ctx.userId)
  return new Set((data ?? []).map((p) => p.id as string))
}

function validate(input: FamilyItemInput): string | null {
  if (input.kind !== 'catatan' && input.kind !== 'event') return 'Jenis tidak valid.'
  if (!input.title.trim()) return 'Judul wajib diisi.'
  if (input.title.trim().length > 100) return 'Judul maksimal 100 karakter.'
  if (input.content.trim().length > 2000) return 'Isi maksimal 2000 karakter.'
  if (input.kind === 'event' && !/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate)) return 'Tanggal event wajib diisi.'
  if (input.eventTime && !/^\d{2}:\d{2}$/.test(input.eventTime)) return 'Jam event tidak valid.'
  return null
}

function toRow(input: FamilyItemInput, allowed: Set<string>) {
  const visibleTo = input.shareAll ? [] : input.visibleTo.filter((id) => allowed.has(id))
  return {
    kind: input.kind,
    title: input.title.trim(),
    content: input.content.trim() || null,
    event_date: input.kind === 'event' ? input.eventDate : null,
    event_time: input.kind === 'event' && input.eventTime ? input.eventTime : null,
    share_all: input.shareAll,
    visible_to: visibleTo,
  }
}

export async function saveFamilyItem(id: string | null, input: FamilyItemInput): Promise<FamilyItemState> {
  const ctx = await getMyHousehold()
  if (!ctx.isMember || !ctx.houseId) {
    return { error: 'Fitur keluarga bisa dipakai setelah akunmu terverifikasi dan dikonfirmasi Kepala Keluarga.', success: false }
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid, success: false }

  const row = toRow(input, await allowedMemberIds(ctx))

  if (id) {
    const { data, error } = await ctx.supabase
      .from('family_items')
      .update({ ...row, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('created_by', ctx.userId)
      .select('id')
    if (error) return { error: publicError(error), success: false }
    if (!data || data.length === 0) return { error: 'Hanya pembuat yang bisa mengubah catatan/event ini.', success: false }
  } else {
    const { error } = await ctx.supabase.from('family_items').insert({ ...row, house_id: ctx.houseId, created_by: ctx.userId })
    if (error) {
      await logError('keluarga: simpan', error.message, { userId: ctx.userId })
      return { error: 'Gagal menyimpan.', success: false }
    }
  }

  revalidatePath('/keluarga')
  return { error: '', success: true }
}

export async function deleteFamilyItem(id: string) {
  const ctx = await getMyHousehold()
  if (!ctx.isMember) return { error: 'Tidak punya akses.' }

  const { data, error } = await ctx.supabase.from('family_items').delete().eq('id', id).eq('created_by', ctx.userId).select('id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Hanya pembuat yang bisa menghapus.' }

  revalidatePath('/keluarga')
  return { error: null }
}