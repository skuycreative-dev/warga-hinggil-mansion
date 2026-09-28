'use client'

import { useEffect } from 'react'

// Tampilan foto layar penuh (tap foto -> besar, tap di luar / Esc -> tutup)
export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: { url: string; caption?: string | null }[]
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
}) {
  useEffect(() => {
    if (index === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index! + 1) % photos.length)
      if (e.key === 'ArrowLeft') onIndex((index! - 1 + photos.length) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, photos.length, onClose, onIndex])

  if (index === null || !photos[index]) return null
  const photo = photos[index]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center px-4"
      style={{ background: 'rgba(10,11,15,0.92)' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.caption ?? 'Foto'} className="max-h-[78vh] max-w-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
      {photo.caption ? <p className="mt-3 text-center text-[13px]" style={{ color: '#f5f3ee' }}>{photo.caption}</p> : null}
      <div className="mt-4 flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 ? (
          <button type="button" onClick={() => onIndex((index - 1 + photos.length) % photos.length)} className="rounded-full px-4 py-2 text-[13px] font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            ‹ Sebelumnya
          </button>
        ) : null}
        <span className="text-[12px]" style={{ color: '#d8cfb8' }}>{index + 1} / {photos.length}</span>
        {photos.length > 1 ? (
          <button type="button" onClick={() => onIndex((index + 1) % photos.length)} className="rounded-full px-4 py-2 text-[13px] font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
            Berikutnya ›
          </button>
        ) : null}
      </div>
      <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-[13px] font-bold" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
        Tutup ✕
      </button>
    </div>
  )
}