import type { MetadataRoute } from 'next'
import { getBranding } from '@/lib/branding'

// Membuat aplikasi bisa di-install ke layar utama HP (PWA). Nama & warna mengikuti Identitas Perumahan.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const b = await getBranding()
  return {
    name: b.app_name,
    short_name: b.short_name,
    description: `Aplikasi komunitas warga ${b.community_name}`,
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: b.theme_color,
    theme_color: b.theme_color,
    lang: 'id',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}