'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { kirimDarurat, type DaruratState } from './actions'

const initialState: DaruratState = { error: '', success: false }

const jenisDarurat = [
  { value: 'kebakaran', label: 'Kebakaran' },
  { value: 'medis', label: 'Medis / Kesehatan' },
  { value: 'keamanan', label: 'Keamanan' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function DaruratPage() {
  const [state, formAction, isPending] = useActionState(kirimDarurat, initialState)

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-lg px-6 py-10 md:px-10 md:py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: '#9c7a3f' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="mt-6 mb-7 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>
            Darurat
          </span>
          <h1
            className="mt-2 text-2xl font-bold md:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
          >
            Kirim Laporan Darurat
          </h1>
          <p className="mt-2 text-sm font-medium md:text-base" style={{ color: '#5b543f' }}>
            Laporan akan langsung diteruskan ke warga dan tim keamanan.
          </p>
        </div>

        {state.success ? (
          <div
            className="rounded-2xl px-6 py-8 text-center"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
          >
            <div className="text-lg font-bold" style={{ color: '#1f1a10' }}>
              Laporan berhasil dikirim
            </div>
            <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
              Tim keamanan dan warga sudah diberi tahu. Tetap tenang dan ikuti instruksi keamanan.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-block rounded-xl px-8 py-3 text-sm font-bold"
              style={{ background: '#1a1305', color: '#f5f3ee' }}
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold" style={{ color: '#3a3424' }}>
                Jenis Darurat
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {jenisDarurat.map((j) => (
                  <label
                    key={j.value}
                    className="flex cursor-pointer items-center justify-center rounded-xl px-3 py-3.5 text-sm font-bold"
                    style={{ background: '#ffffff', border: '2px solid rgba(26,19,5,0.15)', color: '#1f1a10' }}
                  >
                    <input type="radio" name="emergency_type" value={j.value} required className="mr-2" />
                    {j.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold" style={{ color: '#3a3424' }}>
                Keterangan (opsional)
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Contoh: asap terlihat dari dapur rumah D6"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(26,19,5,0.15)',
                  color: '#1f1a10',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {state.error ? (
              <p className="text-sm font-semibold" style={{ color: '#b3392f' }}>
                {state.error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 rounded-xl py-4 text-base font-bold"
              style={{
                border: 'none',
                background: '#b3392f',
                color: '#ffffff',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'default' : 'pointer',
              }}
            >
              {isPending ? 'Mengirim...' : 'Kirim Laporan Darurat'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
