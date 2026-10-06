'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportClientError } from '@/app/lapor-error/actions'

// Error yang biasanya berarti "file aplikasi di browser sudah usang" (setelah ada pembaruan aplikasi):
// cukup muat ulang satu kali -- otomatis, supaya pengguna tidak perlu melakukan apa-apa.
const STALE_BUNDLE = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|Server Action.*(not found|was not found)|Failed to find Server Action/i

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (STALE_BUNDLE.test(error.message ?? '')) {
      try {
        const key = 'hinggil-auto-reload'
        const last = Number(sessionStorage.getItem(key) ?? 0)
        if (Date.now() - last > 60_000) {
          sessionStorage.setItem(key, String(Date.now()))
          window.location.reload()
          return
        }
      } catch {
        // abaikan, lanjut ke tampilan error biasa
      }
    }
    reportClientError({
      message: error.message,
      digest: error.digest,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })
  }, [error])

  // Kode singkat supaya pengguna bisa memotret layar dan IT Support bisa mencocokkan dengan log
  const code = (error.digest || error.message || '').slice(0, 120)

  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
      <div className="w-full max-w-sm rounded-2xl px-6 py-8 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Ada yang tidak beres
        </h1>
        <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
          Halaman ini gagal dimuat. Masalahnya sudah otomatis dilaporkan ke tim IT Support.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
          >
            Coba Lagi
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl py-3 text-sm font-bold"
            style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
          >
            Muat Ulang Halaman
          </button>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
        {code ? (
          <p className="mt-4 break-words text-[10.5px] font-medium" style={{ color: '#9c9684' }}>
            Kode: {code}
          </p>
        ) : null}
      </div>
    </main>
  )
}