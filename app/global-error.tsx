'use client'

import { useEffect } from 'react'
import { reportClientError } from '@/app/lapor-error/actions'

// Dipakai kalau layout utama sendiri yang gagal. Harus punya <html> dan <body> sendiri.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({
      message: error.message,
      digest: error.digest,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

  return (
    <html lang="id">
      <body style={{ margin: 0, background: 'var(--brand-theme, #0a0b0f)', fontFamily: 'sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 360, width: '100%', background: '#ffffff', borderRadius: 16, padding: '32px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, margin: 0, color: '#1f1a10' }}>Aplikasi sedang bermasalah</h1>
            <p style={{ fontSize: 14, color: '#5b543f' }}>Masalahnya sudah otomatis dilaporkan ke tim IT Support.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: 'none', background: 'var(--brand-theme, #0a0b0f)', color: 'var(--brand-accent, #e6c98a)', fontWeight: 700 }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}