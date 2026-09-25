'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPoll, type CreatePollState } from '@/app/polling/actions'

const initialState: CreatePollState = { error: '', success: false }

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

export default function PollCreateForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: CreatePollState, formData: FormData) => {
    const result = await createPoll(prev, formData)
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
        + Buat Polling Baru
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
        <label style={labelStyle}>Judul Polling</label>
        <input type="text" name="title" required placeholder="Renovasi Pos Satpam?" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Deskripsi (opsional)</label>
        <textarea name="description" rows={2} placeholder="Jelaskan konteks polling..." style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Pilihan Jawaban (satu per baris, minimal 2)</label>
        <textarea name="options" rows={4} required placeholder={'Setuju\nTidak Setuju\nAbstain'} style={inputStyle} />
      </div>

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
          {isPending ? 'Menyimpan...' : 'Buat Polling'}
        </button>
      </div>
    </form>
  )
}
