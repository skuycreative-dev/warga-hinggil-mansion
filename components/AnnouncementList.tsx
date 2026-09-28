'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAnnouncement, updateAnnouncement, setAnnouncementPinned } from '@/app/pengumuman/actions'
import AnnouncementEngagement, { type AnnComment } from '@/components/AnnouncementEngagement'

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
  is_pinned: boolean
  author_name: string
  is_new?: boolean
  my_reaction?: string | null
  reaction_counts?: Record<string, number>
  read_count?: number | null
  comments?: AnnComment[]
}

const fieldStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.1)',
  color: '#1f1a10',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
}

export default function AnnouncementList({
  items,
  canManage,
  myId = '',
  totalWarga = null,
}: {
  items: Announcement[]
  canManage: boolean
  myId?: string
  totalWarga?: number | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  function run(fn: () => Promise<{ error: string | null } | undefined>, after?: () => void) {
    startTransition(async () => {
      const result = await fn()
      if (result?.error) {
        setError(result.error)
        return
      }
      setError('')
      after?.()
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Belum ada pengumuman.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {error ? <p className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
      {items.map((a) =>
        editingId === a.id ? (
          <div key={a.id} className="flex flex-col gap-2.5 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
            <input value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} style={fieldStyle} />
            <textarea value={content} rows={5} onChange={(e) => setContent(e.target.value)} style={{ ...fieldStyle, resize: 'vertical' }} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                style={{ background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => updateAnnouncement(a.id, title, content), () => setEditingId(null))}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                style={{ background: '#1a1305', color: '#e6c98a' }}
              >
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        ) : (
          <div
            key={a.id}
            id={`p-${a.id}`}
            className="scroll-mt-20 rounded-2xl px-5 py-4"
            style={{ background: '#ffffff', border: a.is_pinned ? '1px solid rgba(212,175,106,0.6)' : '1px solid rgba(26,19,5,0.08)' }}
          >
            <div className="min-w-0">
              {a.is_pinned ? (
                <span className="mb-1.5 mr-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
                  Disematkan
                </span>
              ) : null}
              {a.is_new ? (
                <span className="mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold" style={{ background: '#b3392f', color: '#ffffff' }}>
                  Baru
                </span>
              ) : null}
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{a.title}</div>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px]" style={{ color: '#5b543f' }}>{a.content}</p>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                {a.author_name} · {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            {myId ? (
              <AnnouncementEngagement
                announcementId={a.id}
                myId={myId}
                myReaction={a.my_reaction ?? null}
                reactionCounts={a.reaction_counts ?? {}}
                comments={a.comments ?? []}
                canModerate={canManage}
                readCount={canManage ? a.read_count ?? 0 : null}
                totalWarga={totalWarga}
              />
            ) : null}
            {canManage ? (
              <div className="mt-3 flex flex-wrap gap-4 border-t pt-2.5" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => setAnnouncementPinned(a.id, !a.is_pinned))}
                  className="text-[12px] font-bold"
                  style={{ color: '#1f1a10' }}
                >
                  {a.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(a.id)
                    setTitle(a.title)
                    setContent(a.content)
                    setError('')
                  }}
                  className="text-[12px] font-bold"
                  style={{ color: '#9c7a3f' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm('Hapus pengumuman ini?')) return
                    run(() => deleteAnnouncement(a.id))
                  }}
                  className="text-[12px] font-bold"
                  style={{ color: '#b3392f' }}
                >
                  Hapus
                </button>
              </div>
            ) : null}
          </div>
        )
      )}
    </div>
  )
}