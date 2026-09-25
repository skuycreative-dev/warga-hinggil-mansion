'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { registerUser } from './actions'

const initialState = { error: '' }

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

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#b9b2a0',
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)

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
              <option value="kepala_keluarga">Kepala Keluarga</option>
              <option value="anggota_keluarga">Anggota Keluarga</option>
              <option value="asisten_rumah_tangga">Asisten Rumah Tangga</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          {state?.error ? (
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
