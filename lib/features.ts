// Daftar fitur yang bisa diaktifkan / dinonaktifkan Superadmin (untuk white label perumahan lain).
// Fitur yang nonaktif TETAP tampil tombolnya, tapi terkunci dengan pesan "hubungi Superadmin".
// File ini dipakai di server maupun di browser, jadi tidak boleh mengimpor apa pun dari Supabase.

export type FeatureKey =
  | 'darurat'
  | 'forum'
  | 'warga'
  | 'chat'
  | 'pengumuman'
  | 'pengaduan'
  | 'qr_tamu'
  | 'anggaran'
  | 'iuran_ipl'
  | 'polling'
  | 'tukang'
  | 'rumah_kosong'
  | 'keluarga'
  | 'keuangan_rumah'
  | 'cctv'
  | 'layanan'
  | 'status_hunian'

export const FEATURES: { key: FeatureKey; label: string; description: string; paths: string[] }[] = [
  { key: 'darurat', label: 'Tombol Darurat', description: 'Alert darurat + nomor darurat. Disarankan selalu aktif.', paths: ['/darurat'] },
  { key: 'forum', label: 'Forum Warga', description: 'Diskusi, komentar, level warga.', paths: ['/forum'] },
  { key: 'warga', label: 'Warga & Teman', description: 'Daftar warga, pertemanan, status pribadi.', paths: ['/warga'] },
  { key: 'chat', label: 'Pesan', description: 'Chat pribadi antar teman.', paths: ['/chat'] },
  { key: 'pengumuman', label: 'Pengumuman', description: 'Pengumuman dari Manajemen & Paguyuban.', paths: ['/pengumuman'] },
  { key: 'pengaduan', label: 'Pengaduan', description: 'Laporan & tracking pengaduan warga.', paths: ['/pengaduan'] },
  { key: 'qr_tamu', label: 'QR Tamu', description: 'Undangan tamu & verifikasi di pos Security.', paths: ['/qr-tamu'] },
  { key: 'anggaran', label: 'Anggaran Paguyuban', description: 'Kas paguyuban, grafik pemasukan & pengeluaran.', paths: ['/anggaran'] },
  { key: 'iuran_ipl', label: 'Iuran IPL', description: 'Tagihan & status bayar iuran per rumah.', paths: ['/iuran-ipl'] },
  { key: 'polling', label: 'Polling Warga', description: 'Polling dari Paguyuban.', paths: ['/polling'] },
  { key: 'tukang', label: 'Katalog Tukang', description: 'Daftar tukang rekomendasi warga.', paths: ['/tukang'] },
  { key: 'rumah_kosong', label: 'Rumah Kosong', description: 'Warga melapor rumah kosong, dipantau Security.', paths: ['/rumah-kosong'] },
  { key: 'keluarga', label: 'Catatan & Kalender Keluarga', description: 'Catatan & event khusus penghuni 1 rumah.', paths: ['/keluarga'] },
  { key: 'keuangan_rumah', label: 'Keuangan Rumah Tangga', description: 'Khusus Kepala Keluarga & Ibu Rumah Tangga.', paths: ['/keuangan-rumah'] },
  { key: 'layanan', label: 'Layanan Surat', description: 'Chat & kirim file dengan Pengurus (surat domisili, pengantar, dll).', paths: ['/layanan'] },
  { key: 'status_hunian', label: 'Status Hunian', description: 'Status rumah (pemilik/penyewa/sementara/kosong), diubah pemilik rumah.', paths: ['/status-hunian'] },
  { key: 'cctv', label: 'CCTV Jogja', description: 'Tautan ke cctv.jogjaprov.go.id.', paths: [] },
]

export const CCTV_URL = 'https://cctv.jogjaprov.go.id/'

export function featureLabel(key: string) {
  return FEATURES.find((f) => f.key === key)?.label ?? 'Fitur ini'
}

export function featureForPath(path: string): FeatureKey | null {
  for (const f of FEATURES) {
    if (f.paths.some((p) => path === p || path.startsWith(p + '/'))) return f.key
  }
  return null
}

// Baris yang belum ada di database dianggap AKTIF
export function disabledSet(rows: { key: string; enabled: boolean }[] | null | undefined) {
  return new Set((rows ?? []).filter((r) => r.enabled === false).map((r) => r.key))
}

// Isi pop-up fitur terkunci
export const LOCKED_BY_SUPERADMIN = (label: string) => ({
  title: `${label} terkunci`,
  message: 'Fitur ini belum aktif untuk perumahan kamu. Hubungi Superadmin untuk mengaktifkan fitur ini.',
})

export const LOCKED_BY_VERIFICATION = (label: string) => ({
  title: `${label} terkunci`,
  message: 'Fitur ini terbuka otomatis setelah akunmu diverifikasi Pengurus.',
})