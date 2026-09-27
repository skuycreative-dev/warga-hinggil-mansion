'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { completeProfile, type CompleteProfileState } from '@/app/lengkapi-profil/actions'
import HouseholdFields, { type HouseOption } from '@/components/HouseholdFields'

const initialState: CompleteProfileState = { error: '' }

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

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#b9b2a0',
}

export default function LengkapiProfilForm({ houses }: { houses: HouseOption[] }) {
  const [state, formAction, isPending] = useActionState(completeProfile, initialState)

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="flex-1 px-7 pb-14 pt-10">
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
              Lengkapi Data Warga
            </h1>
            <p className="text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Satu langkah lagi sebelum masuk ke aplikasi
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
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
            <label style={labelStyle}>Nama Panggilan (opsional)</label>
            <input type="text" name="nickname" placeholder="Nama yang dilihat warga lain" maxLength={30} style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Nomor HP</label>
            <input type="text" name="phone" placeholder="08xx" inputMode="tel" required style={inputStyle} />
          </div>

          <HouseholdFields houses={houses} />

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
            {isPending ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>
        </form>
      </div>
    </main>
  )
}