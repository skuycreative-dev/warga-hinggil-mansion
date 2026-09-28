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

// ---------------------------------------------------------------------
// Anggota Keluarga Tanpa Akun (anak kecil, ART, dsb yang tidak mendaftar akun sendiri).
// Hanya Kepala/Ibu Rumah Tangga (is_household_manager) yang boleh menambah/mengubah/menghapus;
// seluruh penghuni rumah boleh melihat. Dihitung di statistik jumlah penghuni dan jadi kontak
// darurat rumah tersebut.
// ---------------------------------------------------------------------
export type FamilyMemberInput = {
  name: string
  relation: string
  birthDate: string
  note: string
}

const RELATION_OPTIONS = ['anak', 'asisten_rumah_tangga', 'orang_tua', 'kerabat', 'lainnya']

function validateMember(input: FamilyMemberInput): string | null {
  if (!input.name.trim()) return 'Nama wajib diisi.'
  if (input.name.trim().length > 100) return 'Nama maksimal 100 karakter.'
  if (!RELATION_OPTIONS.includes(input.relation)) return 'Hubungan tidak valid.'
  if (input.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) return 'Tanggal lahir tidak valid.'
  if (input.note.trim().length > 200) return 'Catatan maksimal 200 karakter.'
  return null
}

export async function saveFamilyMember(id: string | null, input: FamilyMemberInput): Promise<{ error: string | null }> {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) {
    return { error: 'Hanya Kepala/Ibu Rumah Tangga yang bisa mengelola anggota keluarga tanpa akun.' }
  }

  const invalid = validateMember(input)
  if (invalid) return { error: invalid }

  const row = {
    name: input.name.trim(),
    relation: input.relation,
    birth_date: input.birthDate || null,
    note: input.note.trim() || null,
  }

  if (id) {
    const { data, error } = await ctx.supabase
      .from('family_members')
      .update(row)
      .eq('id', id)
      .eq('house_id', ctx.houseId)
      .select('id')
    if (error) return { error: publicError(error) }
    if (!data || data.length === 0) return { error: 'Data ini tidak ditemukan di rumahmu.' }
  } else {
    const { error } = await ctx.supabase.from('family_members').insert({ ...row, house_id: ctx.houseId, added_by: ctx.userId })
    if (error) {
      await logError('keluarga: simpan anggota', error.message, { userId: ctx.userId })
      return { error: publicError(error) }
    }
  }

  revalidatePath('/keluarga')
  revalidatePath('/statistik')
  return { error: null }
}

export async function deleteFamilyMember(id: string) {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) return { error: 'Hanya Kepala/Ibu Rumah Tangga yang bisa menghapus data ini.' }

  const { data, error } = await ctx.supabase.from('family_members').delete().eq('id', id).eq('house_id', ctx.houseId).select('id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Data ini tidak ditemukan di rumahmu.' }

  revalidatePath('/keluarga')
  revalidatePath('/statistik')
  return { error: null }
}