'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { publicError } from '@/lib/safe-error'

type Result = { error: string | null }

const MAX_PACKS = 20
const MAX_PER_PACK = 60
const PATH_RE = /^[0-9a-f-]{36}\/[0-9]+-[a-z0-9]+\.(webp|png)$/

async function superadmin() {
  const access = await getMyAccess()
  if (!access.isSuperadmin) return null
  return await createClient()
}

function refresh() {
  revalidatePath('/superadmin/stiker')
}

export async function createPack(name: string): Promise<Result & { id?: string }> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const clean = String(name ?? '').trim().slice(0, 40)
  if (clean.length < 2) return { error: 'Nama paket minimal 2 huruf.' }
  const { count } = await supabase.from('sticker_packs').select('id', { count: 'exact', head: true })
  if ((count ?? 0) >= MAX_PACKS) return { error: `Maksimal ${MAX_PACKS} paket stiker.` }
  const { data, error } = await supabase.from('sticker_packs').insert({ name: clean, sort_order: (count ?? 0) + 1 }).select('id').single()
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null, id: data.id as string }
}

export async function renamePack(id: string, name: string): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const clean = String(name ?? '').trim().slice(0, 40)
  if (clean.length < 2) return { error: 'Nama paket minimal 2 huruf.' }
  const { error } = await supabase.from('sticker_packs').update({ name: clean }).eq('id', id)
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}

export async function setPackActive(id: string, active: boolean): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const { error } = await supabase.from('sticker_packs').update({ is_active: !!active }).eq('id', id)
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}

export async function deletePack(id: string): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const { data: items } = await supabase.from('stickers').select('path').eq('pack_id', id)
  const { error } = await supabase.from('sticker_packs').delete().eq('id', id)
  if (error) return { error: publicError(error) }
  const paths = ((items ?? []) as { path: string }[]).map((s) => s.path)
  if (paths.length) await supabase.storage.from('stickers').remove(paths)
  refresh()
  return { error: null }
}

// Gambar sudah diunggah dari browser ke bucket "stickers"; di sini hanya dicatat ke database
export async function addStickers(packId: string, items: { path: string; label?: string }[]): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const rows = (items ?? []).slice(0, MAX_PER_PACK).map((it, i) => ({
    pack_id: packId,
    path: String(it.path ?? ''),
    label: it.label ? String(it.label).trim().slice(0, 40) || null : null,
    sort_order: i,
  }))
  if (!rows.length) return { error: 'Tidak ada gambar.' }
  if (rows.some((r) => !PATH_RE.test(r.path) || !r.path.startsWith(`${packId}/`))) return { error: 'Nama file stiker tidak valid.' }
  const { count } = await supabase.from('stickers').select('id', { count: 'exact', head: true }).eq('pack_id', packId)
  if ((count ?? 0) + rows.length > MAX_PER_PACK) {
    await supabase.storage.from('stickers').remove(rows.map((r) => r.path))
    return { error: `Satu paket maksimal ${MAX_PER_PACK} stiker.` }
  }
  const { error } = await supabase.from('stickers').insert(rows.map((r, i) => ({ ...r, sort_order: (count ?? 0) + i })))
  if (error) {
    await supabase.storage.from('stickers').remove(rows.map((r) => r.path))
    return { error: publicError(error) }
  }
  refresh()
  return { error: null }
}

export async function setStickerActive(id: string, active: boolean): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const { error } = await supabase.from('stickers').update({ is_active: !!active }).eq('id', id)
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}

export async function deleteSticker(id: string): Promise<Result> {
  const supabase = await superadmin()
  if (!supabase) return { error: 'Hanya Superadmin.' }
  const { data: s } = await supabase.from('stickers').select('path').eq('id', id).maybeSingle()
  const { error } = await supabase.from('stickers').delete().eq('id', id)
  if (error) return { error: publicError(error) }
  if (s?.path) await supabase.storage.from('stickers').remove([s.path as string])
  refresh()
  return { error: null }
}