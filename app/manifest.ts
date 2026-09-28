import type { MetadataRoute } from 'next'

// Membuat aplikasi bisa di-install ke layar utama HP (PWA)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Warga Hinggil Mansion',
    short_name: 'Hinggil Mansion',
    description: 'Aplikasi komunitas warga Hinggil Mansion',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0b0f',
    theme_color: '#0a0b0f',
    lang: 'id',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}