'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAnnouncement } from '@/app/pengumuman/actions'
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/categories'
import { isImage, removePhotos, uploadPhoto } from '@/lib/image-upload'

const field: React.CSSProperties = { background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }

export default function AnnouncementForm({ userId }: { userId: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
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
          uploaded = await uploadPhoto('announcement-images', userId, 'pengumuman', image)
          formData.set('image_path', uploaded)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar.')
          return
        }
      }
      const result = await createAnnouncement(formData)
      if (result?.error) {
        if (uploaded) await removePhotos('announcement-images', [uploaded])
        setError(result.error)
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
        className="mb-5 w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition"
        style={{ background: '#1a1305', color: '#e6c98a' }}
      >
        + Buat Pengumuman Baru
      </button>
    )
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mb-5 flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Pengumuman Baru</div>

      <select name="category" defaultValue="umum" aria-label="Kategori" className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold outline-none" style={field}>
        {ANNOUNCEMENT_CATEGORIES.map((c) => (
          <option key={c.key} value={c.key}>{c.label}</option>
        ))}
      </select>

      <input name="title" type="text" required maxLength={150} placeholder="Judul pengumuman" aria-label="Judul" className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none" style={field} />

      <textarea name="content" required rows={4} maxLength={5000} placeholder="Isi pengumuman" aria-label="Isi" className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none" style={field} />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl" style={{ background: '#faf7f0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Pratinjau gambar" className="max-h-64 w-full object-cover" />
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
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ ...field, color: '#5b543f' }}>
          + Tambah gambar / poster (opsional, dikompres otomatis)
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
          setImage(f)
          e.target.value = ''
        }}
      />

      <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold" style={{ color: '#1f1a10' }}>
        <input type="checkbox" name="is_pinned" style={{ width: 16, height: 16, accentColor: '#1a1305' }} />
        Sematkan di paling atas
      </label>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setImage(null)
          }}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
        >
          Batal
        </button>
        <button type="submit" disabled={isPending} className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}>
          {isPending ? 'Mengirim...' : 'Kirim ke Semua Warga'}
        </button>
      </div>
    </form>
  )
}