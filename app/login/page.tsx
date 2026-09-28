'use client'

import { useActionState, useEffect, useState } from 'react'
import { BrandLogo, useBranding } from '@/components/BrandingProvider'
import Link from 'next/link'
import { loginUser, type LoginState } from './actions'
import PasswordInput from '@/components/PasswordInput'

const initialState: LoginState = { error: null }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '16px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#b9b2a0',
}

function useCountdown(untilIso: string | null | undefined) {
  const [left, setLeft] = useState(0)
  useEffect(() => {
    if (!untilIso) {
      setLeft(0)
      return
    }
    const tick = () => setLeft(Math.max(0, Math.ceil((new Date(untilIso).getTime() - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [untilIso])
  return left
}

function mmss(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function LoginPage() {
  const brand = useBranding()
  const [state, formAction, isPending] = useActionState(loginUser, initialState)
  const left = useCountdown(state?.lockedUntil)
  const locked = left > 0
  // Diketik terkendali (controlled) supaya isian TIDAK ikut terhapus saat form
  // di-reset otomatis oleh React setelah gagal login (salah email/password).
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
          <BrandLogo size={56} className="rounded-2xl object-cover" />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Selamat Datang Kembali
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masuk ke akun warga {brand.community_name}
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" style={labelStyle}>Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="nama@email.com"
              required
              autoComplete="username"
              autoCapitalize="none"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" style={labelStyle}>Password</label>
              <Link href="/lupa-password" style={{ fontSize: '12px', color: 'var(--brand-accent)', fontWeight: 600 }}>
                Lupa Password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              style={inputStyle}
            />
          </div>

          {state?.error ? (
            <p role="alert" className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {locked ? `Terlalu banyak percobaan gagal. Demi keamanan, coba lagi dalam ${mmss(left)}.` : state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending || locked}
            className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, var(--brand-accent) 0%, var(--brand-accent-dark) 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending || locked ? 0.6 : 1,
              cursor: isPending || locked ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Memproses...' : locked ? `Tunggu ${mmss(left)}` : 'Masuk'}
          </button>

          <p className="mt-1.5 text-center text-[13px]" style={{ color: '#9a9ca8' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}