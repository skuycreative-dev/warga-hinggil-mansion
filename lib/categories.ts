// Kategori forum & pengumuman. Harus sama dengan aturan database (Step 343).
export type Category = { key: string; label: string; color: string; bg: string }

export const FORUM_CATEGORIES: Category[] = [
  { key: 'umum', label: 'Umum', color: '#5b543f', bg: 'rgba(91,84,63,0.1)' },
  { key: 'info', label: 'Info & Tips', color: '#3b5b8a', bg: 'rgba(59,91,138,0.12)' },
  { key: 'kegiatan', label: 'Kegiatan', color: '#2f6b4f', bg: 'rgba(47,107,79,0.12)' },
  { key: 'jual_beli', label: 'Jual Beli', color: '#7a5a1f', bg: 'rgba(212,175,106,0.22)' },
  { key: 'kehilangan', label: 'Kehilangan & Temuan', color: '#8a4a1f', bg: 'rgba(201,120,60,0.14)' },
  { key: 'keluhan', label: 'Keluhan Lingkungan', color: '#b3392f', bg: 'rgba(179,57,47,0.1)' },
]

export const ANNOUNCEMENT_CATEGORIES: Category[] = [
  { key: 'umum', label: 'Umum', color: '#5b543f', bg: 'rgba(91,84,63,0.1)' },
  { key: 'kegiatan', label: 'Kegiatan', color: '#2f6b4f', bg: 'rgba(47,107,79,0.12)' },
  { key: 'keamanan', label: 'Keamanan', color: '#3b5b8a', bg: 'rgba(59,91,138,0.12)' },
  { key: 'keuangan', label: 'Keuangan & Iuran', color: '#7a5a1f', bg: 'rgba(212,175,106,0.22)' },
  { key: 'pemeliharaan', label: 'Pemeliharaan', color: '#8a4a1f', bg: 'rgba(201,120,60,0.14)' },
  { key: 'darurat', label: 'Darurat', color: '#ffffff', bg: '#b3392f' },
]

export function findCategory(list: Category[], key: string | null | undefined): Category {
  return list.find((c) => c.key === key) ?? list[0]
}