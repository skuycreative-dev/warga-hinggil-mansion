// Tipe data peta perumahan (dipakai halaman /peta)
export type MapHouse = {
  id: string
  nomor: string
  x: number | null
  y: number | null
  lat: number | null
  lng: number | null
  occupancy: string | null
  emergency: { id: string; type: string; status: string } | null
  absence: { until: string } | null
  iplDue: number
  mine: boolean
}

export type MapFacility = { id: string; name: string; kind: string; x: number | null; y: number | null; lat: number | null; lng: number | null }

export type MapData = {
  houses: MapHouse[]
  facilities: MapFacility[]
  plan: { url: string | null; width: number | null; height: number | null }
  center: { lat: number; lng: number; zoom: number } | null
  staffView: boolean
  iplView: boolean
  canEdit: boolean
  focusHouseId: string | null
}

export const FACILITY_LABEL: Record<string, string> = {
  pos_security: 'Pos Security',
  gerbang: 'Gerbang',
  masjid: 'Masjid / Musala',
  taman: 'Taman',
  balai: 'Balai Warga',
  olahraga: 'Fasilitas Olahraga',
  parkir: 'Parkir',
  lainnya: 'Lainnya',
}

export const EMERGENCY_LABEL: Record<string, string> = {
  kebakaran: 'Kebakaran',
  maling: 'Maling',
  perampokan: 'Perampokan',
  kekerasan: 'Kekerasan',
  medis: 'Medis',
  bencana: 'Bencana',
  lainnya: 'Darurat',
}

// Warna titik rumah: darurat > rumah kosong > belum bayar IPL > status hunian
export function houseColor(h: MapHouse, layers: { emergency: boolean; absence: boolean; ipl: boolean; occupancy: boolean }, staff: boolean) {
  if (!staff) return h.mine ? '#2f6b4f' : '#6b6552'
  if (layers.emergency && h.emergency) return '#d62828'
  if (layers.absence && h.absence) return '#3b5b8a'
  if (layers.ipl && h.iplDue > 0) return '#c2410c'
  if (layers.occupancy) {
    if (h.occupancy === 'pemilik') return '#2f6b4f'
    if (h.occupancy === 'penyewa') return '#7a5a1f'
    if (h.occupancy === 'sementara') return '#8a4a1f'
    return '#9a9486'
  }
  return '#6b6552'
}