'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { publicError } from '@/lib/safe-error'

type Result = { error: string | null }

const FACILITY_KINDS = ['pos_security', 'gerbang', 'masjid', 'taman', 'balai', 'olahraga', 'parkir', 'lainnya']

function num(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return Math.round(n * 1e6) / 1e6
}

async function db() {
  return createClient()
}

// Titik rumah di denah (persen dari lebar/tinggi gambar). null = hapus titik.
export async function saveHousePosition(houseId: string, x: number | null, y: number | null): Promise<Result> {
  const supabase = await db()
  const px = x === null ? null : num(x, 0, 100)
  const py = y === null ? null : num(y, 0, 100)
  if (x !== null && (px === null || py === null)) return { error: 'Posisi tidak valid.' }
  const { error } = await supabase.rpc('set_house_position', { p_house: houseId, p_x: px, p_y: py })
  if (error) return { error: publicError(error) }
  revalidatePath('/peta')
  return { error: null }
}

// Titik rumah di peta jalan (koordinat GPS). null = hapus titik.
export async function saveHouseLocation(houseId: string, lat: number | null, lng: number | null): Promise<Result> {
  const supabase = await db()
  const la = lat === null ? null : num(lat, -90, 90)
  const ln = lng === null ? null : num(lng, -180, 180)
  if (lat !== null && (la === null || ln === null)) return { error: 'Koordinat tidak valid.' }
  const { error } = await supabase.rpc('set_house_location', { p_house: houseId, p_lat: la, p_lng: ln })
  if (error) return { error: publicError(error) }
  revalidatePath('/peta')
  return { error: null }
}

export async function saveSitePlanImage(path: string, width: number, height: number): Promise<Result> {
  if (!/^siteplan-[0-9]+\.(webp|jpg|png)$/.test(path)) return { error: 'Nama file tidak valid.' }
  const w = Math.round(Number(width))
  const h = Math.round(Number(height))
  if (!(w >= 100 && w <= 10000 && h >= 100 && h <= 10000)) return { error: 'Ukuran gambar tidak valid.' }
  const supabase = await db()
  const { data: old } = await supabase.from('site_plan').select('image_path').eq('id', 1).maybeSingle()
  const { data: user } = await supabase.auth.getUser()
  const { data: updated, error } = await supabase
    .from('site_plan')
    .update({ image_path: path, image_width: w, image_height: h, updated_by: user.user?.id ?? null, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select('id')
  if (error) return { error: publicError(error) }
  if (!updated?.length) return { error: 'Hanya Superadmin, Ketua, atau Sekretaris yang bisa mengganti denah.' }
  if (old?.image_path && old.image_path !== path) await supabase.storage.from('siteplan').remove([old.image_path as string])
  revalidatePath('/peta')
  return { error: null }
}

export async function saveMapCenter(lat: number, lng: number, zoom: number): Promise<Result> {
  const la = num(lat, -90, 90)
  const ln = num(lng, -180, 180)
  const z = Math.round(Number(zoom))
  if (la === null || ln === null || !(z >= 10 && z <= 20)) return { error: 'Posisi peta tidak valid.' }
  const supabase = await db()
  const { data: updated, error } = await supabase.from('site_plan').update({ center_lat: la, center_lng: ln, zoom: z, updated_at: new Date().toISOString() }).eq('id', 1).select('id')
  if (error) return { error: publicError(error) }
  if (!updated?.length) return { error: 'Tidak punya akses.' }
  revalidatePath('/peta')
  return { error: null }
}

export async function addFacility(input: { name: string; kind: string; map_x?: number | null; map_y?: number | null; lat?: number | null; lng?: number | null }): Promise<Result> {
  const name = String(input?.name ?? '').trim().slice(0, 60)
  if (name.length < 2) return { error: 'Nama fasilitas minimal 2 huruf.' }
  const kind = FACILITY_KINDS.includes(input?.kind) ? input.kind : 'lainnya'
  const supabase = await db()
  const { error } = await supabase.from('map_facilities').insert({
    name,
    kind,
    map_x: input.map_x == null ? null : num(input.map_x, 0, 100),
    map_y: input.map_y == null ? null : num(input.map_y, 0, 100),
    lat: input.lat == null ? null : num(input.lat, -90, 90),
    lng: input.lng == null ? null : num(input.lng, -180, 180),
  })
  if (error) return { error: publicError(error) }
  revalidatePath('/peta')
  return { error: null }
}

export async function moveFacility(id: string, pos: { map_x?: number | null; map_y?: number | null; lat?: number | null; lng?: number | null }): Promise<Result> {
  const patch: Record<string, number | null> = {}
  if ('map_x' in pos) {
    patch.map_x = pos.map_x == null ? null : num(pos.map_x, 0, 100)
    patch.map_y = pos.map_y == null ? null : num(pos.map_y, 0, 100)
  }
  if ('lat' in pos) {
    patch.lat = pos.lat == null ? null : num(pos.lat, -90, 90)
    patch.lng = pos.lng == null ? null : num(pos.lng, -180, 180)
  }
  const supabase = await db()
  const { error } = await supabase.from('map_facilities').update(patch).eq('id', id)
  if (error) return { error: publicError(error) }
  revalidatePath('/peta')
  return { error: null }
}

export async function deleteFacility(id: string): Promise<Result> {
  const supabase = await db()
  const { error } = await supabase.from('map_facilities').delete().eq('id', id)
  if (error) return { error: publicError(error) }
  revalidatePath('/peta')
  return { error: null }
}