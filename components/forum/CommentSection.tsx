'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addComment, deleteForumComment } from '@/app/forum/actions'
import type { ForumComment } from '@/lib/forum-data'
import { LevelBadge, timeAgo } from '@/components/forum/PostCard'
import Avatar from '@/components/Avatar'
import { useConfirm } from '@/components/ModalProvider'

export default function CommentSection({ postId, comments, myId, canModerate }: { postId: string; comments: ForumComment[]; myId: string; canModerate: boolean }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()

  function send() {
    if (!text.trim()) return
    setError('')
    startTransition(async () => {
      const r = await addComment(postId, text)
      if (r.error) {
        setError(r.error)
        return
      }
      setText('')
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
              <p className="mt-0.5 whitespace-pre-line text-[13px] font-medium" style={{ color: '#3a3424' }}>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
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
        <button type="button" onClick={send} disabled={isPending || !text.trim()} className="rounded-full px-4 py-2 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: '#f5f3ee', opacity: isPending || !text.trim() ? 0.6 : 1 }}>
          Kirim
        </button>
      </div>
      {error ? <p className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </section>
  )
}