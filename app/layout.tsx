import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import AppFooter from '@/components/AppFooter'
import AppNavbar from '@/components/AppNavbar'
import BrandingProvider from '@/components/BrandingProvider'
import { getBranding } from '@/lib/branding'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
})

// Nama & warna aplikasi mengikuti Identitas Perumahan yang diatur Superadmin (white label)
export async function generateMetadata(): Promise<Metadata> {
  const b = await getBranding()
  return {
    title: { default: b.app_name, template: `%s | ${b.short_name}` },
    description: `Aplikasi komunitas warga ${b.community_name}`,
    applicationName: b.app_name,
    appleWebApp: { capable: true, title: b.short_name, statusBarStyle: 'black-translucent' },
  }
}

export async function generateViewport(): Promise<Viewport> {
  const b = await getBranding()
  return { themeColor: b.theme_color, width: 'device-width', initialScale: 1 }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const branding = await getBranding()
  return (
    <html lang="id" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{
          background: '#0a0b0f',
          color: '#f5f3ee',
          fontFamily: 'var(--font-plus-jakarta), sans-serif',
          // Warna aksen dari Identitas Perumahan (white label)
          ['--brand-accent' as string]: branding.accent_color,
          ['--brand-accent-dark' as string]: `color-mix(in srgb, ${branding.accent_color} 82%, #000)`,
          ['--brand-theme' as string]: branding.theme_color,
        } as React.CSSProperties}
      >
        <BrandingProvider value={branding}>
          <AppNavbar />
          <div className="flex-1">{children}</div>
          <AppFooter />
        </BrandingProvider>
      </body>
    </html>
  )
}