'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Stars from '@/components/tukang/Stars'
import PhotoLightbox from '@/components/tukang/PhotoLightbox'
import { deleteReview, saveReview } from '@/app/tukang/actions'
import { removePhotos, uploadPhoto } from '@/lib/image-upload'
import { inputStyle } from '@/lib/format'

export type ReviewItem = {
  id: string
  user_id: string
  reviewer_name: string
  rating: number
  comment: string | null
  photos: { path: string; url: string }[]
  created_at: string
  updated_at: string
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'hari ini'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan lalu`
  return `${Math.floor(days / 365)} tahun lalu`
}

export default function TukangReviews({
  tukangId,
  reviews,
  userId,
  canReview,
  cannotReviewReason,
  canModerate,
}: {
  tukangId: string
  reviews: ReviewItem[]
  userId: string
  canReview: boolean
  cannotReviewReason: string | null
  canModerate: boolean
}) {
  const router = useRouter()
  const mine = reviews.find((r) => r.user_id === userId) ?? null
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(mine?.rating ?? 0)
  const [comment, setComment] = useState(mine?.comment ?? '')
  const [photos, setPhotos] = useState<{ path: string; url: string }[]>(mine?.photos ?? [])
  const [newPaths, setNewPaths] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [lightbox, setLightbox] = useState<{ photos: { url: string }[]; index: number } | null>(null)

  function startEdit() {
    setRating(mine?.rating ?? 0)
    setComment(mine?.comment ?? '')
    setPhotos(mine?.photos ?? [])
    setNewPaths([])
    setError('')
    setEditing(true)
  }

  async function cancel() {
    await removePhotos('tukang-photos', newPaths)
    setEditing(false)
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setUploading(true)
    try {
      const room = 3 - photos.length
      for (const file of Array.from(files).slice(0, room)) {
        const path = await uploadPhoto('tukang-photos', userId, `review-${tukangId}`, file)
        setNewPaths((p) => [...p, path])
        setPhotos((p) => [...p, { path, url: URL.createObjectURL(file) }])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengunggah foto.')
    } finally {
      setUploading(false)
    }
  }

  function submit() {
    if (!rating) {
      setError('Pilih jumlah bintang dulu.')
      return
    }
    startTransition(async () => {
      const result = await saveReview(tukangId, rating, comment, photos.map((p) => p.path))
      if (result.error) {
        setError(result.error)
        return
      }
      setEditing(false)
      setNewPaths([])
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!confirm('Hapus ulasan ini?')) return
    startTransition(async () => {
      const result = await deleteReview(id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, count: reviews.filter((r) => r.rating === n).length }))

  return (
    <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Ulasan Warga</h2>

      {reviews.length > 0 ? (
        <div className="mb-4 flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: '#faf7f0' }}>
          <div className="text-center">
            <div className="text-[28px] font-bold leading-none" style={{ color: '#1f1a10', fontFamily: 'var(--font-fraunces), serif' }}>{avg.toFixed(1)}</div>
            <Stars value={avg} size={12} />
            <div className="mt-0.5 text-[11px]" style={{ color: '#9c7a3f' }}>{reviews.length} ulasan</div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            {dist.map((d) => (
              <div key={d.n} className="flex items-center gap-2 text-[11px]" style={{ color: '#5b543f' }}>
                <span className="w-3 text-right">{d.n}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: '#e9e2d2' }}>
                  <div className="h-full rounded-full" style={{ width: `${(d.count / reviews.length) * 100}%`, background: '#d4a53a' }} />
                </div>
                <span className="w-4">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="mb-4 flex flex-col gap-2.5 rounded-xl px-4 py-3.5" style={{ background: '#faf7f0', border: '1px solid rgba(212,175,106,0.45)' }}>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} bintang`} onClick={() => setRating(n)} className="p-0.5">
                <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
                  <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" fill={n <= rating ? '#d4a53a' : '#e3dccb'} />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
              {['', 'Kurang', 'Cukup', 'Baik', 'Sangat baik', 'Luar biasa'][rating]}
            </span>
          </div>
          <textarea
            value={comment}
            maxLength={600}
            rows={3}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalamanmu: hasil kerja, ketepatan waktu, harga, respons WA..."
            style={{ ...inputStyle, background: '#fff' }}
          />
          <div>
            <div className="mb-1.5 text-[11.5px] font-bold" style={{ color: '#5b543f' }}>Foto hasil pekerjaan (maks 3)</div>
            <div className="flex flex-wrap gap-2">
              {photos.map((p) => (
                <div key={p.path} className="relative h-20 w-20 overflow-hidden rounded-lg" style={{ background: '#f1ece0' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="Foto hasil kerja" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Hapus foto"
                    onClick={() => {
                      setPhotos((list) => list.filter((x) => x.path !== p.path))
                      if (newPaths.includes(p.path)) {
                        void removePhotos('tukang-photos', [p.path])
                        setNewPaths((list) => list.filter((x) => x !== p.path))
                      }
                    }}
                    className="absolute right-0.5 top-0.5 rounded-full px-1.5 text-[11px] font-bold"
                    style={{ background: 'rgba(10,11,15,0.7)', color: '#fff' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {photos.length < 3 ? (
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg text-center text-[11px] font-bold" style={{ background: '#fff', color: '#9c7a3f', border: '1.5px dashed rgba(156,122,63,0.45)' }}>
                  {uploading ? '...' : '+ Foto'}
                  <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => { void onFiles(e.target.files); e.target.value = '' }} />
                </label>
              ) : null}
            </div>
          </div>
          {error ? <p className="text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={() => void cancel()} className="rounded-lg px-4 py-2 text-[12.5px] font-bold" style={{ background: '#fff', color: '#5b543f' }}>
              Batal
            </button>
            <button type="button" disabled={isPending || uploading} onClick={submit} className="flex-1 rounded-lg py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending || uploading ? 0.7 : 1 }}>
              {isPending ? 'Menyimpan...' : mine ? 'Simpan Ulasan' : 'Kirim Ulasan'}
            </button>
          </div>
        </div>
      ) : canReview ? (
        <button type="button" onClick={startEdit} className="mb-4 w-full rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(212,175,106,0.45)' }}>
          {mine ? 'Ubah ulasanku' : '★ Tulis ulasan (sudah pakai jasanya)'}
        </button>
      ) : cannotReviewReason ? (
        <p className="mb-4 text-[12px]" style={{ color: '#9c7a3f' }}>{cannotReviewReason}</p>
      ) : null}

      {reviews.length === 0 ? (
        <p className="text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada ulasan.</p>
      ) : (
        <div className="flex flex-col">
          {reviews.map((r) => (
            <div key={r.id} className="py-3" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>
                    {r.reviewer_name}
                    {r.user_id === userId ? <span className="ml-1.5 text-[10.5px]" style={{ color: '#9c7a3f' }}>(kamu)</span> : null}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stars value={r.rating} size={12} />
                    <span className="text-[11px]" style={{ color: '#9c7a3f' }}>
                      {timeAgo(r.created_at)}
                      {r.updated_at !== r.created_at ? ' · diubah' : ''}
                    </span>
                  </div>
                </div>
                {r.user_id === userId || canModerate ? (
                  <button type="button" disabled={isPending} onClick={() => remove(r.id)} className="text-[11px] font-bold" style={{ color: '#b3392f' }}>
                    Hapus
                  </button>
                ) : null}
              </div>
              {r.comment ? <p className="mt-1.5 whitespace-pre-line text-[13px]" style={{ color: '#3d3727' }}>{r.comment}</p> : null}
              {r.photos.length ? (
                <div className="mt-2 flex gap-2">
                  {r.photos.map((p, i) => (
                    <button key={p.path} type="button" onClick={() => setLightbox({ photos: r.photos, index: i })} className="h-20 w-20 overflow-hidden rounded-lg" style={{ background: '#f1ece0' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="Foto hasil kerja" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <PhotoLightbox
        photos={lightbox?.photos ?? []}
        index={lightbox ? lightbox.index : null}
        onClose={() => setLightbox(null)}
        onIndex={(i) => setLightbox((l) => (l ? { ...l, index: i } : l))}
      />
    </section>
  )
}