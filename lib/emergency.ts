// Label & hitungan untuk Tombol Darurat dan Pusat Alert (wireframe screen 25-31)

export const EMERGENCY_TYPE_LABEL: Record<string, string> = {
  kebakaran: 'Kebakaran',
  maling: 'Maling',
  perampokan: 'Perampokan',
  kekerasan: 'Kekerasan',
  medis: 'Darurat Medis',
  bencana: 'Bencana Alam',
  lainnya: 'Darurat Lainnya',
}

export const RESOLUTION_LABEL: Record<string, string> = {
  asli: 'Kejadian asli, sudah ditangani',
  alarm_palsu: 'Alarm palsu',
  polisi: 'Diteruskan ke polisi',
  pelapor_aman: 'Pelapor menandai aman',
}

export const EVENT_LABEL: Record<string, string> = {
  dikirim: 'Alert dikirim',
  diterima: 'Alert diterima petugas',
  menuju: 'Petugas menuju lokasi',
  tiba: 'Petugas tiba di lokasi',
  update: 'Update kondisi',
  chat: 'Chat tim',
  logbook: 'Logbook',
  eskalasi: 'Eskalasi',
  selesai: 'Selesai',
  info_pelapor: 'Info tambahan pelapor',
}

export const EVENT_COLOR: Record<string, string> = {
  dikirim: '#b3392f',
  diterima: '#2f6b4f',
  menuju: '#3b5b8a',
  tiba: '#3b5b8a',
  update: '#5b543f',
  chat: '#7a5a1f',
  logbook: '#6b4f8a',
  eskalasi: '#b3392f',
  selesai: '#2f6b4f',
  info_pelapor: '#9c7a3f',
}

export type EmergencyEvent = {
  id: string
  kind: string
  body: string | null
  is_internal: boolean
  created_at: string
  actor_name: string | null
}

export function typeLabel(type: string) {
  return EMERGENCY_TYPE_LABEL[type] ?? type
}

export function formatDuration(ms: number) {
  if (ms < 0) ms = 0
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}j ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function minutesLabel(ms: number | null) {
  if (ms === null || !Number.isFinite(ms)) return '-'
  const min = ms / 60000
  if (min < 1) return `${Math.max(1, Math.round(ms / 1000))} dtk`
  if (min < 60) return `${Math.round(min)} mnt`
  return `${(min / 60).toFixed(1)} jam`
}

export function clock(iso: string, withDate = false) {
  return new Date(iso).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    ...(withDate ? { day: 'numeric', month: 'short' } : {}),
  })
}