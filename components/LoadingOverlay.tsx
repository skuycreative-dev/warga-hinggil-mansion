import PixelDinoLoader from '@/components/PixelDinoLoader'

// Layar loading yang sama dengan app/loading.tsx, dipakai juga saat pindah tab / filter
// (Next.js tidak menampilkan loading.tsx kalau yang berubah hanya ?tab=... di alamat yang sama).
// Tanpa tulisan: hanya dinosaurus piksel yang berlari.
export default function LoadingOverlay({ label = 'Memuat halaman' }: { label?: string }) {
  return <PixelDinoLoader label={label} />
}