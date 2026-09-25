'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#5b543f' }

type RoleOption = { value: string; label: string }

export default function AdminAccountPanel({
  title,
  roleOptions,
  createAction,
}: {
  title: string
  roleOptions: RoleOption[]
  createAction: (prevState: { error: string; success: boolean }, formData: FormData) => Promise<{ error: string; success: boolean }>
}) {
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
      const form = document.getElementById('admin-account-panel-form') as HTMLFormElement | null
      form?.reset()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#1a1305' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{title}</span>
      </div>

      <form id="admin-account-panel-form" action={handleSubmit} className="flex flex-col gap-3">
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

        {error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Membuat Akun...' : '+ Buat Akun'}
        </button>

        <p className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
          Beritahukan password ini ke orang yang bersangkutan secara langsung/pribadi.
        </p>
      </form>
    </div>
  )
}
