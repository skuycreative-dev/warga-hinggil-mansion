'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitTukang, type SubmitTukangState } from '@/app/tukang/actions'

const initialState: SubmitTukangState = { error: '', success: false }

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

export default function TukangForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: SubmitTukangState, formData: FormData) => {
    const result = await submitTukang(prev, formData)
    if (result.success) {
      router.refresh()
      setOpen(false)
    }
    return result
  }, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Rekomendasikan Tukang
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Tukang</label>
        <input type="text" name="name" required placeholder="Pak Slamet" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keahlian</label>
        <input type="text" name="specialty" required placeholder="Tukang Listrik, Ledeng, Bangunan, dll" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP</label>
        <input type="text" name="phone" required placeholder="08xxxxxxxxxx" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Catatan (opsional)</label>
        <textarea name="description" rows={2} placeholder="Pengalaman, area kerja, dll" style={inputStyle} />
      </div>

      <p className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
        Rekomendasi akan ditinjau admin sebelum tampil di katalog.
      </p>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}

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
          {isPending ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
    </form>
  )
}
