import type { Metadata } from 'next'
import './globals.css'
import AppFooter from '@/components/AppFooter'

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
    <html lang="id">
      <body className="flex min-h-screen flex-col antialiased">
        <div className="flex-1">{children}</div>
        <AppFooter />
      </body>
    </html>
  )
}
