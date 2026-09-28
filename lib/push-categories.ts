// Kelompok notifikasi yang bisa diatur pengguna untuk notifikasi ke HP (Web Push).
// Darurat SELALU dikirim dan tidak bisa dimatikan (demi keselamatan).
export type PushCategory = { key: string; label: string; hint: string; locked?: boolean; types: string[] }

export const PUSH_CATEGORIES: PushCategory[] = [
  { key: 'darurat', label: 'Darurat', hint: 'Alert darurat & info dari pelapor. Selalu aktif.', locked: true, types: ['darurat'] },
  { key: 'pengumuman', label: 'Pengumuman & Polling', hint: 'Pengumuman baru, komentar, polling warga', types: ['pengumuman', 'polling'] },
  { key: 'pesan', label: 'Chat & Pertemanan', hint: 'Pesan baru dan permintaan pertemanan', types: ['pesan', 'pertemanan', 'chat'] },
  { key: 'layanan', label: 'Layanan Surat', hint: 'Balasan & status permintaan surat', types: ['layanan'] },
  { key: 'keuangan', label: 'Iuran & Keuangan', hint: 'Tagihan IPL, pembayaran, pengingat cicilan', types: ['ipl', 'keuangan_rumah', 'iuran'] },
  { key: 'rumah', label: 'Rumah & Keluarga', hint: 'Rumah kosong, patroli, status hunian, catatan keluarga', types: ['rumah_kosong', 'hunian', 'keluarga'] },
  { key: 'lainnya', label: 'Akun & Lainnya', hint: 'Verifikasi akun, keamanan akun, tukang, dll.', types: [] },
]

export function categoryForType(type: string | null | undefined): string {
  const t = (type ?? '').toLowerCase()
  return PUSH_CATEGORIES.find((c) => c.types.includes(t))?.key ?? 'lainnya'
}

// Alamat layanan push resmi browser. Alamat lain ditolak (mencegah server dipakai menembak situs lain).
export function isAllowedPushEndpoint(endpoint: string): boolean {
  try {
    const u = new URL(endpoint)
    if (u.protocol !== 'https:') return false
    const h = u.hostname.toLowerCase()
    return (
      h === 'fcm.googleapis.com' ||
      h === 'android.googleapis.com' ||
      h === 'updates.push.services.mozilla.com' ||
      h === 'push.services.mozilla.com' ||
      h.endsWith('.push.apple.com') ||
      h.endsWith('.notify.windows.com')
    )
  } catch {
    return false
  }
}