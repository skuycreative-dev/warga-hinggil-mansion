'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/log-error'
import { TUKANG_CATEGORIES, parseServices } from '@/lib/tukang'

// Katalog Tukang (keputusan 28 Sep 2026): postingan warga langsung tampil tanpa persetujuan admin.
// Pemosting bisa ubah/hapus miliknya; Manajemen / Paguyuban / Superadmin bisa menghapus yang bermasalah.
// Database memeriksa ulang semua aturan ini (RLS + trigger Step 321).

export type SubmitTukangState = { error: string; success: boolean; id?: string }

const BUCKET = 'tukang-photos'

async function ctx() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id }
}

function refresh(id?: string) {
  revalidatePath('/tukang')
  revalidatePath('/tukang/kelola')
  if (id) revalidatePath(`/tukang/${id}`)
}

function readForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const specialty = String(formData.get('specialty') ?? '').trim()
  const category = String(formData.get('category') ?? 'lainnya')
  const phone = String(formData.get('phone') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priceRange = String(formData.get('price_range') ?? '').trim()
  const area = String(formData.get('area') ?? '').trim()
  const expRaw = String(formData.get('experience_years') ?? '').trim()
  const experience = expRaw ? Number(expRaw) : null

  let services: { name: string; price: string }[] = []
  try {
    services = parseServices(JSON.parse(String(formData.get('services') ?? '[]')))
  } catch {
    services = []
  }

  if (!name || name.length > 60) return { error: 'Nama tukang wajib diisi (maks 60 karakter).' }
  if (!specialty || specialty.length > 60) return { error: 'Keahlian wajib diisi (maks 60 karakter).' }
  if (!TUKANG_CATEGORIES.some((c) => c.key === category)) return { error: 'Pilih kategori.' }
  if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return { error: 'Nomor HP tidak valid.' }
  if (experience !== null && (!Number.isInteger(experience) || experience < 0 || experience > 70)) return { error: 'Pengalaman 0-70 tahun.' }
  if (priceRange.length > 60) return { error: 'Perkiraan harga maksimal 60 karakter.' }
  if (area.length > 80) return { error: 'Area kerja maksimal 80 karakter.' }
  if (description.length > 1000) return { error: 'Deskripsi maksimal 1000 karakter.' }

  return {
    values: {
      name,
      specialty,
      category,
      phone,
      description: description || null,
      price_range: priceRange || null,
      area: area || null,
      experience_years: experience,
      services,
    },
  }
}

export async function submitTukang(prevState: SubmitTukangState, formData: FormData): Promise<SubmitTukangState> {
  const parsed = readForm(formData)
  if ('error' in parsed) return { error: parsed.error ?? 'Data tidak valid.', success: false }

  const { supabase, userId } = await ctx()
  const id = String(formData.get('id') ?? '')

  if (id) {
    const { data, error } = await supabase.from('tukang_catalog').update(parsed.values).eq('id', id).select('id')
    if (error) return { error: publicError(error), success: false }
    if (!data || data.length === 0) return { error: 'Kamu tidak bisa mengubah data tukang ini.', success: false }
    refresh(id)
    return { error: '', success: true, id }
  }

  const { data, error } = await supabase
    .from('tukang_catalog')
    .insert({ ...parsed.values, submitted_by: userId, status: 'approved' })
    .select('id')
    .single()

  if (error || !data) {
    await logError('tukang: tambah', publicError(error, 'gagal'), { userId })
    return {
      error: error?.message?.includes('row-level security') ? 'Akunmu perlu diverifikasi Pengurus dulu.' : publicError(error, 'Gagal menyimpan.'),
      success: false,
    }
  }

  refresh(data.id)
  return { error: '', success: true, id: data.id }
}

async function collectPaths(supabase: Awaited<ReturnType<typeof createClient>>, tukangId: string) {
  const [{ data: photos }, { data: reviews }] = await Promise.all([
    supabase.from('tukang_photos').select('path').eq('tukang_id', tukangId),
    supabase.from('tukang_reviews').select('photo_paths').eq('tukang_id', tukangId),
  ])
  return [...(photos ?? []).map((p) => p.path as string), ...(reviews ?? []).flatMap((r) => (r.photo_paths as string[]) ?? [])]
}

export async function deleteTukang(id: string) {
  const { supabase } = await ctx()
  const paths = await collectPaths(supabase, id)

  const { data, error } = await supabase.from('tukang_catalog').delete().eq('id', id).select('id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Kamu tidak bisa menghapus data tukang ini.' }

  // Foto milik orang lain hanya bisa dihapus admin; yang gagal dihapus tidak lagi terhubung ke data apa pun
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)

  refresh()
  return { error: null }
}

// ---------------------------------------------------------------------
// Foto portofolio (file diunggah langsung dari HP ke penyimpanan privat, lalu dicatat di sini)
// ---------------------------------------------------------------------
export async function addPortfolioPhoto(tukangId: string, path: string, caption: string) {
  const { supabase, userId } = await ctx()
  if (!path.startsWith(`${userId}/`)) return { error: 'Lokasi file tidak valid.' }

  const { error } = await supabase
    .from('tukang_photos')
    .insert({ tukang_id: tukangId, path, caption: caption.trim().slice(0, 120) || null, created_by: userId })
  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    return { error: error.message.includes('Maksimal') ? 'Maksimal 6 foto portofolio.' : publicError(error) }
  }
  refresh(tukangId)
  return { error: null }
}

export async function deletePortfolioPhoto(photoId: string) {
  const { supabase } = await ctx()
  const { data, error } = await supabase.from('tukang_photos').delete().eq('id', photoId).select('path, tukang_id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Foto tidak ditemukan.' }
  await supabase.storage.from(BUCKET).remove([data[0].path as string])
  refresh(data[0].tukang_id as string)
  return { error: null }
}

// ---------------------------------------------------------------------
// Rating & review (1 per warga per tukang, bisa diubah)
// ---------------------------------------------------------------------
export async function saveReview(tukangId: string, rating: number, comment: string, photoPaths: string[]) {
  const { supabase, userId } = await ctx()
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Pilih 1 sampai 5 bintang.' }
  if (comment.trim().length > 600) return { error: 'Ulasan maksimal 600 karakter.' }
  if (photoPaths.length > 3) return { error: 'Maksimal 3 foto hasil kerja.' }
  if (photoPaths.some((p) => !p.startsWith(`${userId}/`))) return { error: 'Lokasi foto tidak valid.' }

  const { data: existing } = await supabase
    .from('tukang_reviews')
    .select('id, photo_paths')
    .eq('tukang_id', tukangId)
    .eq('user_id', userId)
    .maybeSingle()

  const values = { rating, comment: comment.trim() || null, photo_paths: photoPaths, updated_at: new Date().toISOString() }
  const { error } = existing
    ? await supabase.from('tukang_reviews').update(values).eq('id', existing.id)
    : await supabase.from('tukang_reviews').insert({ ...values, tukang_id: tukangId, user_id: userId })

  if (error) {
    if (error.message.includes('row-level security')) {
      return { error: 'Kamu tidak bisa memberi ulasan untuk tukang yang kamu posting sendiri, atau akunmu belum diverifikasi.' }
    }
    return { error: publicError(error) }
  }

  // Foto lama yang tidak dipakai lagi dihapus dari penyimpanan
  const removed = ((existing?.photo_paths as string[]) ?? []).filter((p) => !photoPaths.includes(p))
  if (removed.length) await supabase.storage.from(BUCKET).remove(removed)

  refresh(tukangId)
  return { error: null }
}

export async function deleteReview(reviewId: string) {
  const { supabase } = await ctx()
  const { data, error } = await supabase.from('tukang_reviews').delete().eq('id', reviewId).select('photo_paths, tukang_id')
  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Ulasan tidak ditemukan.' }
  const paths = (data[0].photo_paths as string[]) ?? []
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths)
  refresh(data[0].tukang_id as string)
  return { error: null }
}