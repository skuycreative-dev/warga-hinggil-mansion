'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { verify2fa } from './actions'

type Factor = { id: string; friendly_name?: string | null }

function safeNext() {
  if (typeof window === 'undefined') return '/dashboard'
  const next = new URLSearchParams(window.location.search).get('next') ?? ''
  // Hanya alamat di dalam aplikasi ini (tolak //, \\, skema lain, dan karakter kontrol)
  if (!/^\/[A-Za-z0-9\-._~/?=&%#]*$/.test(next) || next.startsWith('//') || next.startsWith('/login')) return '/dashboard'
  try {
    const url = new URL(next, window.location.origin)
    if (url.origin !== window.location.origin) return '/dashboard'
    return url.pathname + url.search + url.hash
  } catch {
    return '/dashboard'
  }
}

export default function TwoFactorLoginPage() {
  const [factors, setFactors] = useState<Factor[] | null>(null)
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [waitUntil, setWaitUntil] = useState(0)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.mfa.listFactors().then(({ data, error: err }) => {
      if (err) {
        window.location.href = '/login'
        return
      }
      const verified = (data?.totp ?? []).filter((f) => f.status === 'verified') as Factor[]
      if (verified.length === 0) {
        window.location.href = '/keamanan-akun?wajib=1'
        return
      }
      setFactors(verified)
      setFactorId(verified[0].id)
    })
  }, [])

  useEffect(() => {
    if (waitUntil <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [waitUntil])

  const waiting = waitUntil > now
  const waitLeft = Math.ceil((waitUntil - now) / 1000)

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    if (waiting || busy) return
    const clean = code.replace(/\D/g, '')
    if (clean.length !== 6) {
      setError('Masukkan 6 digit kode dari aplikasi Authenticator.')
      return
    }
    setBusy(true)
    setError('')
    const r = await verify2fa(factorId, clean)
    if (!r.ok) {
      setCode('')
      setBusy(false)
      setError(r.error ?? 'Kode salah.')
      if (r.lockedUntil) {
        setWaitUntil(new Date(r.lockedUntil).getTime())
        setNow(Date.now())
      }
      return
    }
    window.location.href = safeNext()
  }

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-7 py-12">
      <div className="mb-7 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(230,201,138,0.12)', border: '1px solid rgba(230,201,138,0.35)' }}
          aria-hidden
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}>
          Verifikasi 2 Langkah
        </h1>
        <p className="mt-1.5 text-[13px]" style={{ color: '#9a9ca8' }}>
          Buka aplikasi Authenticator di HP, lalu masukkan 6 digit kode untuk Hinggil Mansion.
        </p>
      </div>

      {factors === null ? (
        <p className="text-center text-[13px]" style={{ color: '#9a9ca8' }}>Memeriksa perangkat...</p>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-4">
          {factors.length > 1 ? (
            <label className="flex flex-col gap-1.5 text-[12px]" style={{ color: '#b9b2a0' }}>
              Perangkat
              <select
                value={factorId}
                onChange={(e) => setFactorId(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '12px 14px', color: '#f5f3ee', fontSize: 16 }}
              >
                {factors.map((f, i) => (
                  <option key={f.id} value={f.id} style={{ color: '#1f1a10' }}>
                    {f.friendly_name || `Perangkat ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="000000"
            aria-label="Kode 6 digit"
            disabled={waiting}
            className="text-center tabular-nums"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: '16px 14px',
              color: '#f5f3ee',
              fontSize: 28,
              letterSpacing: '0.45em',
              outline: 'none',
            }}
          />

          {error ? (
            <p role="alert" className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {waiting ? `Terlalu banyak kode salah. Coba lagi dalam ${Math.floor(waitLeft / 60)}:${String(waitLeft % 60).padStart(2, '0')}.` : error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || waiting || code.length !== 6}
            className="rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              opacity: busy || waiting || code.length !== 6 ? 0.6 : 1,
            }}
          >
            {busy ? 'Memeriksa...' : 'Verifikasi'}
          </button>

          <p className="text-center text-[12px] leading-relaxed" style={{ color: '#9a9ca8' }}>
            HP hilang atau aplikasi Authenticator terhapus? Hubungi Superadmin untuk mereset 2FA akunmu.
          </p>
          <div className="flex items-center justify-center gap-5">
            <a href="/darurat" className="text-[12.5px] font-bold" style={{ color: '#e08a8a' }}>Tombol Darurat</a>
            <button type="button" onClick={logout} className="text-[12.5px] font-bold" style={{ color: '#e6c98a', background: 'none', border: 'none' }}>
              Keluar
            </button>
          </div>
        </form>
      )}
    </main>
  )
}