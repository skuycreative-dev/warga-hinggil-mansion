'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PhotoLightbox from '@/components/tukang/PhotoLightbox'
import { addPortfolioPhoto, deletePortfolioPhoto } from '@/app/tukang/actions'
import { uploadPhoto } from '@/lib/image-upload'

export type PortfolioPhoto = { id: string; url: string; caption: string | null }

export default function TukangPortfolio({
  tukangId,
  photos,
  canEdit,
  userId,
}: {
  tukangId: string
  photos: PortfolioPhoto[]
  canEdit: boolean
  userId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setBusy(true)
    try {
      const room = 6 - photos.length
      for (const file of Array.from(files).slice(0, room)) {
        const path = await uploadPhoto('tukang-photos', userId, `tukang-${tukangId}`, file)
        const result = await addPortfolioPhoto(tukangId, path, '')
        if (result.error) throw new Error(result.error)
      }
      if (files.length > room) setError(`Hanya ${room} foto pertama yang diunggah (maks 6).`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah foto.')
    } finally {
      setBusy(false)
    }
  }

  if (photos.length === 0 && !canEdit) return null

  return (
    <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Portofolio</h2>
        <span className="text-[11.5px]" style={{ color: '#9c7a3f' }}>{photos.length}/6 foto</span>
      </div>
      {photos.length === 0 ? <p className="mb-3 text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada foto hasil kerja.</p> : null}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={p.id} className="relative">
            <button type="button" onClick={() => setOpen(i)} className="block aspect-square w-full overflow-hidden rounded-xl" style={{ background: '#f1ece0' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption ?? `Portofolio ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
            </button>
            {canEdit ? (
              <button
                type="button"
                aria-label="Hapus foto"
                disabled={isPending}
                onClick={() => {
                  if (!confirm('Hapus foto ini?')) return
                  startTransition(async () => {
                    const r = await deletePortfolioPhoto(p.id)
                    if (r.error) setError(r.error)
                    router.refresh()
                  })
                }}
                className="absolute right-1 top-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
                style={{ background: 'rgba(10,11,15,0.7)', color: '#fff' }}
              >
                ✕
              </button>
            ) : null}
          </div>
        ))}
        {canEdit && photos.length < 6 ? (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl text-center text-[11.5px] font-bold" style={{ background: '#faf7f0', color: '#9c7a3f', border: '1.5px dashed rgba(156,122,63,0.45)' }}>
            {busy ? 'Mengunggah...' : '+ Foto'}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(e) => { void onFiles(e.target.files); e.target.value = '' }} />
          </label>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
      <PhotoLightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </section>
  )
}