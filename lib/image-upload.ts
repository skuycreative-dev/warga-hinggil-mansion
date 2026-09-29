'use client'

import { createClient } from '@/lib/supabase/client'

// Semua foto yang diunggah di aplikasi dikompres otomatis di HP pengguna sebelum dikirim:
// maksimal 2 MB (biasanya jauh lebih kecil), sisi terpanjang maksimal 1600 px, format WebP (JPEG kalau WebP tidak didukung).
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export function isImage(file: File | Blob) {
  return /^image\/(jpeg|jpg|png|webp|heic|heif|gif|bmp)$/i.test(file.type)
}

async function loadImage(file: Blob) {
  // createImageBitmap mengikuti orientasi foto HP (EXIF) di browser modern
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
    } catch {
      // lanjut ke cara lama
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Foto tidak bisa dibaca. Coba foto lain (JPG/PNG).'))
      el.src = url
    })
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function compressImage(file: File | Blob, opts: { maxBytes?: number; maxSize?: number } = {}): Promise<Blob> {
  const maxBytes = opts.maxBytes ?? MAX_IMAGE_BYTES
  let maxSize = opts.maxSize ?? 1600
  if (!isImage(file)) throw new Error('File harus berupa foto.')
  if (file.size > MAX_INPUT_BYTES) throw new Error('Ukuran foto terlalu besar (maks 25 MB sebelum dikompres).')

  const img = await loadImage(file)
  const w = 'naturalWidth' in img ? img.naturalWidth : img.width
  const h = 'naturalHeight' in img ? img.naturalHeight : img.height

  // Coba WebP dulu; turunkan kualitas lalu ukuran sampai di bawah batas
  for (let round = 0; round < 5; round++) {
    const scale = Math.min(1, maxSize / Math.max(w, h))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(w * scale))
    canvas.height = Math.max(1, Math.round(h * scale))
    const c = canvas.getContext('2d')
    if (!c) break
    c.fillStyle = '#ffffff' // PNG transparan -> latar putih (penting untuk JPEG)
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.drawImage(img as CanvasImageSource, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.85, 0.75, 0.62, 0.5]) {
      let blob = await toBlob(canvas, 'image/webp', quality)
      if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', quality)
      if (blob && blob.size <= maxBytes) return blob
    }
    maxSize = Math.round(maxSize * 0.75)
  }
  throw new Error('Foto tidak bisa dikecilkan di bawah 2 MB. Coba foto lain.')
}

// Ubah gambar jadi PNG dengan sisi terpanjang maksimal `max` px -- dipakai untuk logo & kop surat
// (butuh PNG polos berkualitas tinggi, beda dari compressImage di atas yang WebP untuk foto biasa).
export async function toPngResized(file: File, max: number, maxBytes = 2 * 1024 * 1024): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('gambar'))
      img.src = url
    })
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob || blob.size > maxBytes) throw new Error('besar')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function extFor(type: string) {
  if (type === 'image/webp') return 'webp'
  if (type === 'image/png') return 'png'
  if (type === 'image/jpeg') return 'jpg'
  if (type === 'application/pdf') return 'pdf'
  if (type === 'application/msword') return 'doc'
  if (type.includes('wordprocessingml')) return 'docx'
  return 'bin'
}

// Unggah foto ke bucket privat. Folder pertama = id pengguna (dicek database).
export async function uploadPhoto(bucket: string, userId: string, folder: string, file: File) {
  const blob = await compressImage(file, { maxSize: 1280 })
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(blob.type)}`
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw new Error('Gagal mengunggah foto. Periksa internet lalu coba lagi.')
  return path
}

export async function removePhotos(bucket: string, paths: string[]) {
  if (!paths.length) return
  const supabase = createClient()
  await supabase.storage.from(bucket).remove(paths)
}