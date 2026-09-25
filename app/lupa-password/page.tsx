'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsSubmitting(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

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
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: '#9a9ca8' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Masuk
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={52}
            height={52}
            className="rounded-2xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Lupa Password
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masukkan email kamu, kami kirimkan link untuk atur ulang password
            </p>
          </div>
        </div>

        {sent ? (
          <div
            className="rounded-2xl px-6 py-7 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,106,0.15)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#f5f3ee' }}>
              Link berhasil dikirim ke {email}
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Cek inbox atau folder spam kamu, lalu ikuti link untuk membuat password baru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '12px', color: '#b9b2a0' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={inputStyle}
              />
            </div>

            {error ? (
              <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
              style={{
                border: 'none',
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
                boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
