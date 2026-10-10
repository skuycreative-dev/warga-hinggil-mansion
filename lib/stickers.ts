// Stiker: gambar kecil (WEBP/PNG transparan) yang diunggah Superadmin ke bucket publik "stickers".
export type Sticker = { id: string; pack_id: string; path: string; label: string | null }
export type StickerPack = { id: string; name: string; stickers: Sticker[] }

// Isi kolom teks untuk pesan/komentar yang hanya berisi stiker (kolom content di database wajib terisi)
export const STICKER_TEXT = '[Stiker]'

export function stickerUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stickers/${path}`
}

// Hasil join `sticker:stickers(path)` bisa berupa objek atau larik, tergantung versi PostgREST
export function stickerPathOf(row: { sticker?: { path?: string | null } | { path?: string | null }[] | null }): string | null {
  const s = Array.isArray(row.sticker) ? row.sticker[0] : row.sticker
  return s?.path ?? null
}