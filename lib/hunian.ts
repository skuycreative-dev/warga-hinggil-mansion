export const OCCUPANCY_OPTIONS: { key: string; label: string; hint: string; color: string; bg: string }[] = [
  { key: 'pemilik', label: 'Ditempati Pemilik', hint: 'Pemilik rumah tinggal di rumah ini.', color: '#2f6b4f', bg: 'rgba(47,107,79,0.12)' },
  { key: 'penyewa', label: 'Disewakan', hint: 'Rumah ditempati penyewa / kontrak.', color: '#3b5b8a', bg: 'rgba(59,91,138,0.12)' },
  { key: 'sementara', label: 'Tinggal Sementara', hint: 'Ditempati keluarga / kerabat sementara.', color: '#7a5a1f', bg: 'rgba(212,175,106,0.22)' },
  { key: 'kosong', label: 'Tidak Ditempati', hint: 'Rumah kosong (belum dihuni).', color: '#6b6552', bg: 'rgba(107,101,82,0.14)' },
]

export function occupancyInfo(key: string | null | undefined) {
  return OCCUPANCY_OPTIONS.find((o) => o.key === key) ?? OCCUPANCY_OPTIONS[3]
}