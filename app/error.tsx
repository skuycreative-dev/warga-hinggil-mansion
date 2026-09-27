'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { reportClientError } from '@/app/lapor-error/actions'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError({
      message: error.message,
      digest: error.digest,
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }, [error])

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
            style={{ background: '#1a1305', color: '#e6c98a' }}
          >
            Coba Lagi
          </button>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  )
}