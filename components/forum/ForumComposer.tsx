'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createForumPost } from '@/app/forum/actions'
import { FORUM_CATEGORIES } from '@/lib/categories'
import { isImage, removePhotos, uploadPhoto } from '@/lib/image-upload'
import StickerPicker from '@/components/StickerPicker'
import { type Sticker, stickerUrl } from '@/lib/stickers'

const MAX_PHOTOS = 4

export default function ForumComposer({ userId, defaultCategory }: { userId: string; defaultCategory?: string }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(defaultCategory && FORUM_CATEGORIES.some((c) => c.key === defaultCategory) ? defaultCategory : 'umum')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [sticker, setSticker] = useState<Sticker | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function pick(list: FileList | null) {
    setError('')
    const chosen = Array.from(list ?? []).filter((f) => isImage(f))
    if (Array.from(list ?? []).length !== chosen.length) setError('Hanya foto (JPG, PNG, WEBP) yang bisa dilampirkan.')
    setFiles((prev) => [...prev, ...chosen].slice(0, MAX_PHOTOS))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) {
      setError('Tulis pesan terlebih dahulu.')
      return
    }
    setBusy(true)
    setError('')
    const uploaded: string[] = []
    try {
      for (const f of files) uploaded.push(await uploadPhoto('forum-photos', userId, 'forum', f))
    } catch (err) {
      await removePhotos('forum-photos', uploaded)
      setBusy(false)
      setError(err instanceof Error ? err.message : 'Gagal mengunggah foto.')
      return
    }
    const r = await createForumPost({ content, category, imagePaths: uploaded, stickerId: sticker?.id ?? null })
    setBusy(false)
    if (r.error) {
      await removePhotos('forum-photos', uploaded)
      setError(r.error)
      return
    }
    setContent('')
    setFiles([])
    setSticker(null)
    setShowStickers(false)
    startTransition(() => router.refresh())
  }

  return (
    <form onSubmit={submit} className="mb-6 flex flex-col gap-2.5 rounded-2xl px-4 py-4 md:px-5 md:py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={3000}
        placeholder="Tulis sesuatu untuk warga lain..."
        aria-label="Isi postingan"
        className="rounded-xl px-4 py-3 text-sm"
        style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10', fontFamily: 'inherit', resize: 'vertical' }}
      />

      {previews.length ? (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-xl" style={{ background: '#faf7f0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, k) => k !== i))}
                aria-label="Hapus foto"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold"
                style={{ background: 'rgba(26,19,5,0.75)', color: '#fff' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {sticker ? (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#faf7f0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stickerUrl(sticker.path)} alt="Stiker dipilih" style={{ width: 56, height: 56, objectFit: 'contain' }} />
          <span className="text-[12px] font-semibold" style={{ color: '#5b543f' }}>Stiker akan ikut di postingan</span>
          <button type="button" onClick={() => setSticker(null)} aria-label="Lepas stiker" className="ml-auto px-2 text-[18px] font-bold leading-none" style={{ color: '#b3392f' }}>×</button>
        </div>
      ) : null}

      {showStickers ? <StickerPicker onPick={(s) => { setSticker(s); setShowStickers(false) }} onClose={() => setShowStickers(false)} /> : null}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Kategori"
          className="rounded-full px-3 py-2 text-[13px] font-semibold"
          style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
        >
          {FORUM_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={files.length >= MAX_PHOTOS || busy}
          onClick={() => fileRef.current?.click()}
          className="rounded-full px-3 py-2 text-[13px] font-bold"
          style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#5b543f', opacity: files.length >= MAX_PHOTOS ? 0.5 : 1 }}
        >
          + Foto ({files.length}/{MAX_PHOTOS})
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} />
        <button
          type="button"
          disabled={busy}
          onClick={() => setShowStickers((v) => !v)}
          aria-pressed={showStickers}
          className="rounded-full px-3 py-2 text-[13px] font-bold"
          style={{ background: showStickers || sticker ? 'rgba(212,175,106,0.3)' : '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#5b543f' }}
        >
          + Stiker
        </button>
        <button
          type="submit"
          disabled={busy}
          className="ml-auto rounded-full px-6 py-2.5 text-sm font-bold"
          style={{ border: 'none', background: 'var(--brand-theme)', color: '#f5f3ee', opacity: busy ? 0.7 : 1 }}
        >
          {busy ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </form>
  )
}