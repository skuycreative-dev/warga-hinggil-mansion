'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

type RoleOption = { value: string; label: string }

export default function AdminAccountForm({
  roleOptions,
  createAction,
  buttonLabel,
}: {
  roleOptions: RoleOption[]
  createAction: (prevState: { error: string; success: boolean }, formData: FormData) => Promise<{ error: string; success: boolean }>
  buttonLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createAction({ error: '', success: false }, formData)
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
        {buttonLabel}
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
        <label style={labelStyle}>Nama Lengkap</label>
        <input type="text" name="full_name" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Email</label>
        <input type="email" name="email" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Password Sementara</label>
        <input type="text" name="password" required minLength={6} placeholder="Minimal 6 karakter" style={inputStyle} />
        <p className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
          Beritahukan password ini ke orang yang bersangkutan secara langsung/pribadi.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Role</label>
        <select name="role" required style={inputStyle}>
          {roleOptions.map((r) => (
            <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
              {r.label}
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
          {isPending ? 'Membuat...' : 'Buat Akun'}
        </button>
      </div>
    </form>
  )
}
