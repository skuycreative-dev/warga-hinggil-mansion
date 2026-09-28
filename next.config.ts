import type { NextConfig } from 'next'

// Alamat Supabase diambil dari env saat build (hanya alamat publik, BUKAN kunci rahasia)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseHost = supabaseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
const supabaseHttp = supabaseHost ? `https://${supabaseHost}` : 'https://*.supabase.co'
const onVercel = !!process.env.VERCEL
const isDev = process.env.NODE_ENV !== 'production'
const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : 'wss://*.supabase.co'

// Content Security Policy: browser hanya boleh memuat skrip, gambar, dan koneksi dari
// situs ini sendiri + Supabase. Skrip dari situs lain, iframe, plugin, dan form ke luar diblokir.
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' hanya saat npm run dev (dibutuhkan fitur hot reload), tidak pernah di produksi
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHttp}`,
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseHttp} ${supabaseWs}${isDev ? ' ws: http://localhost:*' : ''}`,
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Hanya di server Vercel (HTTPS). Di laptop (http://localhost) baris ini dimatikan supaya npm run dev tetap jalan.
  ...(onVercel ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  ...(onVercel ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 768, 1024, 1280],
    imageSizes: [32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Halaman yang baru dibuka disimpan sebentar di HP: kembali ke halaman itu dalam 30 detik terasa instan.
    // Data tetap segar karena ada pembaruan real-time & setiap simpan data memuat ulang halaman terkait.
    staleTimes: { dynamic: 30, static: 300 },
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig