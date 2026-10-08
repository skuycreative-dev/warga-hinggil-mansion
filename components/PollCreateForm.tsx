'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPoll } from '@/app/polling/actions'
import { isImage, removePhotos, uploadPhoto } from '@/lib/image-upload'

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

export default function PollCreateForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!image) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(image)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [image])

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      let uploaded: string | null = null
      if (image) {
        try {
          uploaded = await uploadPhoto('poll-images', userId, 'polling', image)
          formData.set('image_path', uploaded)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
          return
        }
      }
      const result = await createPoll({ error: '', success: false }, formData)
      if (!result.success) {
        if (uploaded) await removePhotos('poll-images', [uploaded])
        setError(result.error || 'Gagal membuat polling.')
        return
      }
      formRef.current?.reset()
      setImage(null)
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: 'var(--brand-theme)', color: '#f5f3ee' }}
      >
        + Buat Polling Baru
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Judul Polling</label>
        <input type="text" name="title" required maxLength={150} placeholder="Renovasi Pos Satpam?" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Deskripsi (opsional)</label>
        <textarea name="description" rows={2} placeholder="Jelaskan konteks polling..." style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Gambar (opsional)</label>
        {preview ? (
          <div className="relative overflow-hidden rounded-xl" style={{ background: '#faf7f0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Pratinjau gambar polling" className="max-h-64 w-full object-cover" />
            <button
              type="button"
              onClick={() => setImage(null)}
              className="absolute right-2 top-2 rounded-full px-3 py-1 text-[12px] font-bold"
              style={{ background: 'rgba(26,19,5,0.8)', color: '#fff' }}
            >
              Hapus gambar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl px-4 py-2.5 text-[13px] font-bold"
            style={{ ...inputStyle, color: '#5b543f', textAlign: 'left' }}
          >
            + Tambah gambar (denah, foto lokasi, dll. -- dikompres otomatis)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            if (f && !isImage(f)) {
              setError('Hanya gambar JPG, PNG, atau WEBP.')
              return
            }
            setError(null)
            setImage(f)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Pilihan Jawaban (satu per baris, minimal 2)</label>
        <textarea name="options" rows={4} required placeholder={'Setuju\nTidak Setuju\nAbstain'} style={inputStyle} />
      </div>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setImage(null)
            setError(null)
          }}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: 'var(--brand-theme)', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Buat Polling'}
        </button>
      </div>
    </form>
  )
}