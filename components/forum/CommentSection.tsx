'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addComment, deleteForumComment } from '@/app/forum/actions'
import type { ForumComment } from '@/lib/forum-data'
import { LevelBadge, timeAgo } from '@/components/forum/PostCard'
import Avatar from '@/components/Avatar'
import { useConfirm } from '@/components/ModalProvider'
import StickerPicker from '@/components/StickerPicker'
import { STICKER_TEXT, type Sticker, stickerUrl } from '@/lib/stickers'

export default function CommentSection({ postId, comments, myId, canModerate }: { postId: string; comments: ForumComment[]; myId: string; canModerate: boolean }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [showStickers, setShowStickers] = useState(false)
  const [sticker, setSticker] = useState<Sticker | null>(null)
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()

  function send() {
    if (!text.trim() && !sticker) return
    setError('')
    startTransition(async () => {
      const r = await addComment(postId, text, sticker?.id ?? null)
      if (r.error) {
        setError(r.error)
        return
      }
      setText('')
      setSticker(null)
      setShowStickers(false)
      router.refresh()
    })
  }

  async function remove(id: string) {
    if (!(await confirmModal('Hapus komentar ini?', { danger: true }))) return
    startTransition(async () => {
      const r = await deleteForumComment(id, postId)
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  return (
    <section className="mt-4 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Komentar ({comments.length})</h2>
      <div className="flex flex-col gap-2.5">
        {comments.length === 0 ? <p className="text-[12.5px]" style={{ color: '#9c7a3f' }}>Belum ada komentar. Jadilah yang pertama.</p> : null}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5 rounded-xl px-3.5 py-2.5" style={{ background: '#faf7f0' }}>
            <Avatar name={c.author_name} url={c.author_avatar} size={28} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{c.author_name}</span>
                  <LevelBadge name={c.author_level} />
                  <span className="text-[10.5px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(c.created_at)}</span>
                </span>
                {c.author_id === myId || canModerate ? (
                  <button type="button" onClick={() => remove(c.id)} disabled={isPending} className="text-[11px] font-bold" style={{ color: '#b3392f' }}>
                    Hapus
                  </button>
                ) : null}
              </div>
              {c.content === STICKER_TEXT ? null : <p className="mt-0.5 whitespace-pre-line text-[13px] font-medium" style={{ color: '#3a3424' }}>{c.content}</p>}
              {c.sticker_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.sticker_url} alt="Stiker" className="mt-1" style={{ width: 112, height: 112, objectFit: 'contain' }} loading="lazy" />
              ) : c.content === STICKER_TEXT ? (
                <p className="mt-0.5 text-[12.5px] font-medium italic" style={{ color: '#9c7a3f' }}>Stiker sudah dihapus</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {showStickers ? (
        <div className="mt-3">
          <StickerPicker onPick={(s) => { setSticker(s); setShowStickers(false) }} onClose={() => setShowStickers(false)} />
        </div>
      ) : null}
      {sticker ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#faf7f0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stickerUrl(sticker.path)} alt="Stiker dipilih" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <span className="text-[12px] font-semibold" style={{ color: '#5b543f' }}>Stiker akan dikirim bersama komentar</span>
          <button type="button" onClick={() => setSticker(null)} aria-label="Lepas stiker" className="ml-auto px-2 text-[18px] font-bold leading-none" style={{ color: '#b3392f' }}>×</button>
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowStickers((v) => !v)}
          aria-label="Stiker"
          aria-pressed={showStickers}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: showStickers ? 'rgba(212,175,106,0.3)' : '#faf7f0', border: '1px solid rgba(26,19,5,0.1)' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5b543f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
            <path d="M15 3v6h6" />
            <path d="M9 13.5h.01M14 13.5h.01" />
            <path d="M9 17c1.5 1.2 4.5 1.2 6 0" />
          </svg>
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send()
          }}
          maxLength={1000}
          placeholder="Tulis komentar..."
          aria-label="Komentar"
          className="min-w-0 flex-1 rounded-full px-4 py-2.5 text-[13px]"
          style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
        />
        <button type="button" onClick={send} disabled={isPending || (!text.trim() && !sticker)} className="rounded-full px-4 py-2 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: '#f5f3ee', opacity: isPending || (!text.trim() && !sticker) ? 0.6 : 1 }}>
          Kirim
        </button>
      </div>
      {error ? <p className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </section>
  )
}