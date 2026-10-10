'use client'

// Kecilkan gambar stiker di HP/laptop Superadmin sebelum diunggah: sisi terpanjang maks 384 px,
// latar transparan dipertahankan (WEBP; PNG kalau browser tidak mendukung WEBP), maks 500 KB.
export const STICKER_MAX_BYTES = 500 * 1024

export async function prepareSticker(file: File): Promise<{ blob: Blob; ext: 'webp' | 'png' }> {
  if (!/^image\/(png|webp|jpeg|jpg|gif)$/i.test(file.type)) throw new Error('Format harus PNG, WEBP, JPG, atau GIF.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran gambar terlalu besar (maks 10 MB sebelum dikecilkan).')
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Gambar tidak bisa dibaca.'))
      img.src = url
    })
    let max = 384
    for (let round = 0; round < 4; round++) {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      for (const q of [0.9, 0.75, 0.6]) {
        const webp = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', q))
        if (webp && webp.type === 'image/webp' && webp.size <= STICKER_MAX_BYTES) return { blob: webp, ext: 'webp' }
      }
      const png = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
      if (png && png.size <= STICKER_MAX_BYTES) return { blob: png, ext: 'png' }
      max = Math.round(max * 0.75)
    }
    throw new Error('Gambar tidak bisa dikecilkan di bawah 500 KB. Pakai gambar yang lebih sederhana.')
  } finally {
    URL.revokeObjectURL(url)
  }
}