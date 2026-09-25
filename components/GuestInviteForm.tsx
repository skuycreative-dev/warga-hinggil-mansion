'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGuestVisit } from '@/app/qr-tamu/actions'

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
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

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

const PURPOSE_OPTIONS = [
  { value: 'keluarga', label: 'Keluarga / Kerabat' },
  { value: 'kurir', label: 'Kurir / Ojek Online' },
  { value: 'tukang', label: 'Tukang / Jasa' },
  { value: 'delivery', label: 'Delivery / Pengantaran' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function GuestInviteForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createGuestVisit({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      setGeneratedCode(result.code ?? null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  if (generatedCode) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl px-5 py-7 text-center" style={{ background: '#1a1305' }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Kode Tamu</span>
        <span className="text-4xl font-bold tracking-[0.3em]" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#e6c98a' }}>
          {generatedCode}
        </span>
        <p className="text-[12.5px] font-medium" style={{ color: '#c7c9d2' }}>
          Berikan kode ini ke tamu. Tunjukkan ke Security saat tiba di gerbang.
        </p>
        <button
          type="button"
          onClick={() => {
            setGeneratedCode(null)
            setOpen(false)
          }}
          className="mt-1 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ background: '#e6c98a', color: '#1a1305' }}
        >
          Selesai
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Undang Tamu Baru
      </button>
    )
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Tamu</label>
        <input type="text" name="guest_name" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP Tamu (opsional)</label>
        <input type="tel" name="guest_phone" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keperluan</label>
        <select name="purpose" required style={inputStyle}>
          {PURPOSE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value} style={{ color: '#1a1305' }}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Membuat Kode...' : 'Buat Kode Tamu'}
        </button>
      </div>
    </form>
  )
}
