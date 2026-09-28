// Layanan Surat: warga <-> Pengurus (Ketua, Sekretaris, Superadmin)

export const LAYANAN_CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: 'domisili', label: 'Surat Keterangan Domisili', hint: 'Untuk bank, sekolah, kantor, dll.' },
  { key: 'pengantar', label: 'Surat Pengantar RT/RW', hint: 'Pengantar ke kelurahan / kecamatan.' },
  { key: 'keterangan_usaha', label: 'Surat Keterangan Usaha', hint: 'Usaha rumahan di lingkungan perumahan.' },
  { key: 'tidak_mampu', label: 'Surat Keterangan Tidak Mampu', hint: 'Untuk bantuan / keringanan biaya.' },
  { key: 'kelahiran', label: 'Pengantar Kelahiran', hint: 'Pengurusan akta kelahiran.' },
  { key: 'kematian', label: 'Pengantar Kematian', hint: 'Pengurusan akta kematian.' },
  { key: 'pindah', label: 'Surat Pindah Datang / Keluar', hint: 'Pindah alamat KTP / KK.' },
  { key: 'lainnya', label: 'Keperluan Lain', hint: 'Pertanyaan atau keperluan khusus ke Pengurus.' },
]

export const LAYANAN_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  baru: { label: 'Baru', bg: 'rgba(179,57,47,0.1)', color: '#b3392f' },
  diproses: { label: 'Diproses', bg: 'rgba(212,175,106,0.22)', color: '#7a5a1f' },
  selesai: { label: 'Selesai', bg: 'rgba(47,107,79,0.12)', color: '#2f6b4f' },
  dibatalkan: { label: 'Dibatalkan', bg: 'rgba(107,101,82,0.14)', color: '#6b6552' },
}

export function categoryLabel(key: string) {
  return LAYANAN_CATEGORIES.find((c) => c.key === key)?.label ?? 'Keperluan Lain'
}

// File yang boleh dikirim (sama dengan aturan penyimpanan di database)
export const DOC_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'image/jpeg': 'Foto',
  'image/png': 'Foto',
  'image/webp': 'Foto',
}

export const MAX_DOC_BYTES = 10 * 1024 * 1024
export const ACCEPT_ATTR = '.pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/*'

// Beberapa HP mengirim .doc/.docx dengan tipe kosong; tebak dari nama file
export function guessType(file: File) {
  if (file.type) return file.type
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf')) return 'application/pdf'
  if (name.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (name.endsWith('.doc')) return 'application/msword'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  return ''
}

export function fileSizeLabel(bytes: number | null | undefined) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function safeFileName(name: string) {
  return (
    name
      .normalize('NFKD')
      .replace(/[^\w.\- ]+/g, '')
      .replace(/\s+/g, '-')
      .slice(-80) || 'file'
  )
}