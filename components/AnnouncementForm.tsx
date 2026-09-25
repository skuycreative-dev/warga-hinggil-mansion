'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAnnouncement } from '@/app/pengumuman/actions'

export default function AnnouncementForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createAnnouncement(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      formRef.current?.reset()
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-5 w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition"
        style={{ background: '#1a1305', color: '#e6c98a' }}
      >
        + Buat Pengumuman Baru
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-5 flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Pengumuman Baru</div>

      <input
        name="title"
        type="text"
        required
        placeholder="Judul pengumuman"
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
        style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
      />

      <textarea
        name="content"
        required
        rows={4}
        placeholder="Isi pengumuman"
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
        style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
      />

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#1a1305', color: '#e6c98a' }}
        >
          {isPending ? 'Mengirim...' : 'Kirim ke Semua Warga'}
        </button>
      </div>
    </form>
  )
}
