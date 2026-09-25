'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { registerUser, type RegisterState } from './actions'

const initialState: RegisterState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '11px',
  padding: '12px 13px',
  color: '#f5f3ee',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
}

const optionStyle: React.CSSProperties = {
  color: '#1a1305',
  background: '#ffffff',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#b9b2a0',
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!state.success) return
    if (countdown <= 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [state.success, countdown, router])

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      {state.success ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(10,11,15,0.82)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl px-7 py-8 text-center"
            style={{ background: '#141620', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,106,0.15)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Pendaftaran Berhasil
            </h2>
            <p className="mt-2 text-sm font-medium" style={{ color: '#9a9ca8' }}>
              Akun kamu sudah dibuat. Silakan masuk menggunakan email dan password kamu.
            </p>
            <p className="mt-4 text-xs font-semibold" style={{ color: '#6d6f7a' }}>
              Mengarahkan ke halaman Masuk dalam {countdown} detik...
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block w-full rounded-xl py-3 text-sm font-bold"
              style={{
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
              }}
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      ) : null}

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

      <div className="flex-1 px-7 pb-14 pt-4">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={48}
            height={48}
            className="rounded-xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-[21px] font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Daftar Warga
            </h1>
            <p className="text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Bergabung dengan komunitas Hinggil Mansion
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Nama Lengkap</label>
            <input type="text" name="full_name" placeholder="Nama sesuai KTP" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="nama@email.com" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" placeholder="••••••••" required minLength={6} style={inputStyle} />
          </div>

          <div className="flex gap-2.5">
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor HP</label>
              <input type="text" name="phone" placeholder="08xx" required style={inputStyle} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor Rumah</label>
              <input type="text" name="nomor_rumah" placeholder="D6" required style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Peran dalam Keluarga</label>
            <select name="family_role" defaultValue="anggota_keluarga" required style={selectStyle}>
              <option value="kepala_keluarga" style={optionStyle}>Kepala Keluarga</option>
              <option value="anggota_keluarga" style={optionStyle}>Anggota Keluarga</option>
              <option value="asisten_rumah_tangga" style={optionStyle}>Asisten Rumah Tangga</option>
              <option value="lainnya" style={optionStyle}>Lainnya</option>
            </select>
          </div>

          {state.error ? (
            <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="mt-1 text-center text-[12.5px]" style={{ color: '#9a9ca8' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#e6c98a', fontWeight: 600 }}>
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
