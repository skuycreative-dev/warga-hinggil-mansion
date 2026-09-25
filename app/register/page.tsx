'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { registerUser, type RegisterState } from './actions'
import { createClient } from '@/lib/supabase/client'

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
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!state.success) return
    if (countdown <= 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [state.success, countdown, router])

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

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

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold"
          style={{
            background: '#ffffff',
            color: '#1f1a10',
            opacity: googleLoading ? 0.7 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3c-7.5 0-14 4.2-17.7 10.4z"/>
            <path fill="#4CAF50" d="M24 45c5.4 0 10.3-1.9 14-5.2l-6.5-5.3C29.4 36.6 26.8 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.9 40.7 16.4 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.3C41.5 35.6 45 30.2 45 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          {googleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-[11px] font-semibold" style={{ color: '#6d6f7a' }}>ATAU</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Nama Lengkap</label>
            <input type="text" name="full_name" placeholder="Nama sesuai KTP" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>NIK (Nomor KTP)</label>
            <input
              type="text"
              name="nik"
              inputMode="numeric"
              placeholder="16 digit sesuai KTP"
              maxLength={16}
              pattern="\d{16}"
              title="NIK harus 16 digit angka"
              required
              style={inputStyle}
            />
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
            <label style={labelStyle}>Status Hunian</label>
            <select name="occupancy_status" defaultValue="pemilik" required style={selectStyle}>
              <option value="pemilik" style={optionStyle}>Pemilik</option>
              <option value="penyewa" style={optionStyle}>Penyewa</option>
              <option value="sementara" style={optionStyle}>Sementara</option>
            </select>
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
