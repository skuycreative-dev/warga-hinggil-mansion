'use client'

import { createClient } from '@/lib/supabase/client'

// Foto dari HP dikecilkan dulu (maks 1280px, WebP) supaya hemat kuota & cepat diunggah.
export async function compressImage(file: File, maxSize = 1280, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa foto.')
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Foto tidak bisa dibaca.'))
      el.src = url
    })
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (blob && blob.type === 'image/webp') return blob
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    return jpeg ?? file
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Unggah ke bucket privat. Folder pertama = id pengguna (dicek database).
export async function uploadPhoto(bucket: string, userId: string, folder: string, file: File) {
  if (file.size > 15 * 1024 * 1024) throw new Error('Ukuran foto maksimal 15 MB.')
  const blob = await compressImage(file)
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw new Error(`Gagal mengunggah foto: ${error.message}`)
  return path
}

export async function removePhotos(bucket: string, paths: string[]) {
  if (!paths.length) return
  const supabase = createClient()
  await supabase.storage.from(bucket).remove(paths)
}