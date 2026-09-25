import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import AppFooter from '@/components/AppFooter'
import AppNavbar from '@/components/AppNavbar'

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

export const metadata: Metadata = {
  title: 'Warga Hinggil Mansion',
  description: 'Aplikasi komunitas warga Hinggil Mansion',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{
          background: '#0a0b0f',
          color: '#f5f3ee',
          fontFamily: 'var(--font-plus-jakarta), sans-serif',
        }}
      >
        <AppNavbar />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </body>
    </html>
  )
}
