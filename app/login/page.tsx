'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loginUser } from './actions'

const initialState = { error: '' }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#b9b2a0',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState)

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: '#9a9ca8' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={56}
            height={56}
            className="rounded-2xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Selamat Datang Kembali
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masuk ke akun warga Hinggil Mansion
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="nama@email.com" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label style={labelStyle}>Password</label>
              <Link href="/lupa-password" style={{ fontSize: '12px', color: '#e6c98a', fontWeight: 600 }}>
                Lupa Password?
              </Link>
            </div>
            <input type="password" name="password" placeholder="••••••••" required style={inputStyle} />
          </div>

          {state?.error ? (
            <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="mt-1.5 text-center text-[13px]" style={{ color: '#9a9ca8' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#e6c98a', fontWeight: 600 }}>
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
