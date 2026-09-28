import { logError } from '@/lib/log-error'

// Pesan error yang aman ditampilkan ke pengguna.
// Detail teknis database (nama tabel, kolom, aturan keamanan) TIDAK dikirim ke browser:
// dicatat ke log IT Support, pengguna hanya melihat pesan umum berbahasa Indonesia.
// Pesan dari fungsi database buatan aplikasi (RAISE EXCEPTION, kode P0001) memang ditulis untuk pengguna, jadi tetap ditampilkan.
type ErrLike = { message?: string; code?: string; hint?: string; status?: number } | null | undefined

export function publicError(err: ErrLike | unknown, fallback = 'Terjadi kesalahan. Coba lagi beberapa saat lagi.'): string {
  const e = (err ?? {}) as { message?: string; code?: string; hint?: string }
  const message = typeof e.message === 'string' ? e.message : ''
  const code = typeof e.code === 'string' ? e.code : ''

  if (!message && !code) return fallback
  if (code === 'P0001' && message && message.length <= 240 && !/\b(relation|column|constraint|schema|function)\b/i.test(message)) {
    return message
  }
  if (/Terlalu banyak/.test(message) || e.hint === 'RATE_LIMIT') return 'Terlalu banyak aktivitas dalam waktu singkat. Tunggu beberapa menit lalu coba lagi.'
  if (code === '23505' || /duplicate key/i.test(message)) return 'Data yang sama sudah ada.'
  if (code === '23503') return 'Data terkait tidak ditemukan atau masih dipakai data lain.'
  if (code === '42501' || /row-level security|permission denied/i.test(message)) {
    return 'Kamu tidak punya akses untuk tindakan ini, atau akunmu belum diverifikasi Pengurus.'
  }
  if (['23514', '23502', '22P02', '22001', '22003', '22007', '22008'].includes(code)) return 'Isian tidak valid. Periksa lagi datanya.'
  if (code === 'PGRST116') return 'Data tidak ditemukan.'
  if (/already (been )?registered|already exists/i.test(message)) return 'Email ini sudah terdaftar.'
  if (/fetch failed|network|timeout/i.test(message)) return 'Koneksi ke server terputus. Periksa internet lalu coba lagi.'

  void logError('aksi-pengguna', err, { code })
  return fallback
}