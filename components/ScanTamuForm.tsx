'use client'

import { useActionState, useRef } from 'react'
import { scanGuestCode, type ScanState } from '@/app/keamanan/scan-tamu/actions'

const initialState: ScanState = { error: '', guest: null }

export default function ScanTamuForm() {
  const [state, formAction, isPending] = useActionState(scanGuestCode, initialState)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-5">
      <form
        action={(fd) => {
          formAction(fd)
          inputRef.current?.select()
        }}
        className="flex flex-col gap-3"
      >
        <input
          ref={inputRef}
          type="text"
          name="code"
          autoFocus
          placeholder="Masukkan kode tamu (contoh: A1B2C3D4E5)"
          className="rounded-xl px-4 py-4 text-center text-lg font-bold tracking-widest"
          style={{
            background: '#ffffff',
            border: '2px solid rgba(26,19,5,0.15)',
            color: '#1f1a10',
            fontFamily: 'inherit',
            textTransform: 'uppercase',
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl py-4 text-base font-bold"
          style={{
            border: 'none',
            background: '#1a1305',
            color: '#f5f3ee',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? 'Memeriksa...' : 'Cek & Check-in Tamu'}
        </button>
      </form>

      {state.error ? (
        <div
          className="rounded-2xl px-5 py-4 text-center text-sm font-bold"
          style={{ background: 'rgba(179,57,47,0.08)', color: '#b3392f' }}
        >
          {state.error}
        </div>
      ) : null}

      {state.guest ? (
        <div
          className="rounded-2xl px-6 py-6 text-center"
          style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
        >
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: 'rgba(47,138,79,0.12)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2f8a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="text-lg font-bold" style={{ color: '#1f1a10' }}>
            {state.guest.guest_name}
          </div>
          <div className="mt-1 text-sm font-medium" style={{ color: '#5b543f' }}>
            Tujuan: Rumah {state.guest.house_nomor ?? '-'}
          </div>
          {state.guest.purpose ? (
            <div className="text-sm font-medium" style={{ color: '#5b543f' }}>
              Keperluan: {state.guest.purpose}
            </div>
          ) : null}
          <div className="mt-3 inline-block rounded-full px-4 py-1.5 text-xs font-bold" style={{ background: 'rgba(47,138,79,0.12)', color: '#2f8a4f' }}>
            Sudah Masuk
          </div>
        </div>
      ) : null}
    </div>
  )
}
