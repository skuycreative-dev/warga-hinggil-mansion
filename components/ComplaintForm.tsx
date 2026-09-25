'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createComplaint } from '@/app/pengaduan/actions'

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

const CATEGORY_OPTIONS = [
  { value: 'kebersihan', label: 'Kebersihan' },
  { value: 'keamanan', label: 'Keamanan' },
  { value: 'fasilitas', label: 'Fasilitas' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function ComplaintForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createComplaint({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      router.refresh()
      setOpen(false)
    } else {
      setError(result.error)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Buat Pengaduan Baru
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
        <label style={labelStyle}>Kategori</label>
        <select name="category" required style={inputStyle}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value} style={{ color: '#1a1305' }}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Judul</label>
        <input type="text" name="title" required placeholder="Contoh: Lampu jalan Blok C mati" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Detail Pengaduan</label>
        <textarea name="description" required rows={4} placeholder="Jelaskan kejadian atau keluhannya" style={{ ...inputStyle, resize: 'vertical' }} />
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
          {isPending ? 'Mengirim...' : 'Kirim Pengaduan'}
        </button>
      </div>
    </form>
  )
}
