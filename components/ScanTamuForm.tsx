'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkInGuest } from '@/app/keamanan/scan-tamu/actions'

export default function ScanTamuForm() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    setSuccess('')
    const result = await checkInGuest({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      setSuccess('Tamu berhasil diverifikasi masuk.')
      router.refresh()
      const form = document.getElementById('scan-tamu-form') as HTMLFormElement | null
      form?.reset()
    } else {
      setError(result.error)
    }
  }

  return (
    <form
      id="scan-tamu-form"
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <label className="text-[11.5px] font-bold" style={{ color: '#5b543f' }}>Kode Tamu (6 digit)</label>
      <input
        type="text"
        name="visit_code"
        required
        maxLength={6}
        inputMode="numeric"
        placeholder="000000"
        className="text-center text-2xl font-bold tracking-[0.4em]"
        style={{
          background: '#f2f1ec',
          border: '1px solid rgba(26,19,5,0.12)',
          borderRadius: '12px',
          padding: '14px',
          color: '#1f1a10',
          outline: 'none',
        }}
      />

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
      {success ? <p className="text-[12.5px] font-semibold" style={{ color: '#2f6b4f' }}>{success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? 'Memverifikasi...' : 'Verifikasi Masuk'}
      </button>
    </form>
  )
}
