'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addAnnouncementComment, deleteAnnouncementComment, toggleReaction } from '@/app/pengumuman/actions'

export type AnnComment = { id: string; user_id: string; name: string; body: string; created_at: string }

// Emoji ditulis sebagai kode escape supaya aman di semua editor & PowerShell
const REACTIONS: { key: string; icon: string; label: string }[] = [
  { key: 'suka', icon: '\u{1F44D}', label: 'Suka' },
  { key: 'setuju', icon: '\u{2705}', label: 'Setuju' },
  { key: 'terima_kasih', icon: '\u{1F64F}', label: 'Terima kasih' },
  { key: 'wow', icon: '\u{1F62E}', label: 'Wow' },
]

function ago(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'baru saja'
  if (min < 60) return `${min} mnt lalu`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} jam lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function AnnouncementEngagement({
  announcementId,
  myId,
  myReaction,
  reactionCounts,
  comments,
  canModerate,
  readCount,
  totalWarga,
}: {
  announcementId: string
  myId: string
  myReaction: string | null
  reactionCounts: Record<string, number>
  comments: AnnComment[]
  canModerate: boolean
  readCount: number | null
  totalWarga: number | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    setError('')
    startTransition(async () => {
      const r = await fn()
      if (r.error) {
        setError(r.error)
        return
      }
      after?.()
      router.refresh()
    })
  }

  return (
    <div className="mt-3 border-t pt-2.5" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
      <div className="flex flex-wrap items-center gap-1.5">
        {REACTIONS.map((r) => {
          const count = reactionCounts[r.key] ?? 0
          const mine = myReaction === r.key
          return (
            <button
              key={r.key}
              type="button"
              disabled={isPending}
              aria-pressed={mine}
              aria-label={`${r.label}${count ? ` (${count})` : ''}`}
              title={r.label}
              onClick={() => run(() => toggleReaction(announcementId, r.key))}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-bold"
              style={mine ? { background: '#1a1305', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.08)' }}
            >
              <span aria-hidden>{r.icon}</span>
              {count ? <span>{count}</span> : null}
            </button>
          )
        })}
        <button type="button" onClick={() => setOpen(!open)} className="ml-auto text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
          {open ? 'Tutup komentar' : `Komentar (${comments.length})`}
        </button>
      </div>

      {readCount !== null ? (
        <div className="mt-2 text-[11.5px] font-semibold" style={{ color: '#3b5b8a' }}>
          Dibaca {readCount}
          {totalWarga ? ` dari ${totalWarga} warga aktif (${Math.round((Math.min(readCount, totalWarga) / totalWarga) * 100)}%)` : ' orang'}
        </div>
      ) : null}

      {open ? (
        <div className="mt-2.5 flex flex-col gap-2">
          {comments.length === 0 ? <p className="text-[12px]" style={{ color: '#9c7a3f' }}>Belum ada komentar.</p> : null}
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl px-3 py-2" style={{ background: '#faf7f0' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-bold" style={{ color: '#1f1a10' }}>
                  {c.name} <span className="font-medium" style={{ color: '#9c7a3f' }}>· {ago(c.created_at)}</span>
                </span>
                {c.user_id === myId || canModerate ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm('Hapus komentar ini?')) return
                      run(() => deleteAnnouncementComment(c.id))
                    }}
                    className="text-[11px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    Hapus
                  </button>
                ) : null}
              </div>
              <p className="whitespace-pre-line text-[13px]" style={{ color: '#3d3727' }}>{c.body}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && text.trim()) run(() => addAnnouncementComment(announcementId, text), () => setText(''))
              }}
              placeholder="Tulis komentar…"
              aria-label="Komentar"
              className="min-w-0 flex-1 rounded-xl px-3 py-2 text-[13px]"
              style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', outline: 'none' }}
            />
            <button
              type="button"
              disabled={isPending || !text.trim()}
              onClick={() => run(() => addAnnouncementComment(announcementId, text), () => setText(''))}
              className="rounded-xl px-4 text-[12.5px] font-bold"
              style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending || !text.trim() ? 0.6 : 1 }}
            >
              Kirim
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </div>
  )
}