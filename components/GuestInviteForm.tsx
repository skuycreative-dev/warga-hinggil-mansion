'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createGuestInvite, type GuestInviteState } from '@/app/qr-tamu/actions'

const initialState: GuestInviteState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#5b543f',
}

export default function GuestInviteForm() {
  const [state, formAction, isPending] = useActionState(createGuestInvite, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isPending && state.success) {
      formRef.current?.reset()
    }
  }, [isPending, state.success])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5 md:px-6 md:py-6"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Tamu</label>
        <input type="text" name="guest_name" placeholder="Nama lengkap tamu" required style={inputStyle} />
      </div>

      <div className="flex gap-2.5">
        <div className="flex flex-1 flex-col gap-1.5">
          <label style={labelStyle}>Nomor HP (opsional)</label>
          <input type="text" name="guest_phone" placeholder="08xx" style={inputStyle} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label style={labelStyle}>Tanggal Kunjungan</label>
          <input type="date" name="visit_date" required style={inputStyle} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keperluan (opsional)</label>
        <input type="text" name="purpose" placeholder="Contoh: kunjungan keluarga" style={inputStyle} />
      </div>

      {state.error ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>
          Kode QR tamu berhasil dibuat, lihat di daftar di bawah.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-xl py-3 text-sm font-bold"
        style={{
          border: 'none',
          background: '#1a1305',
          color: '#f5f3ee',
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'default' : 'pointer',
        }}
      >
        {isPending ? 'Membuat...' : 'Buat Kode QR Tamu'}
      </button>
    </form>
  )
}
