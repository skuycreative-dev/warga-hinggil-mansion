'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAnnouncement, deleteAnnouncement } from '@/app/pengumuman/actions'

type Announcement = {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '9px 11px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  width: '100%',
  outline: 'none',
}

export default function AnnouncementItem({ item, canManage, isNew }: { item: Announcement; canManage: boolean; isNew: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [content, setContent] = useState(item.content)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateAnnouncement(item.id, title, content, item.is_pinned)
      router.refresh()
      setEditing(false)
    })
  }

  function handleDelete() {
    if (!confirm('Hapus pengumuman ini?')) return
    startTransition(async () => {
      await deleteAnnouncement(item.id)
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
      style={{
        background: '#ffffff',
        border: item.is_pinned ? '1px solid rgba(212,175,106,0.4)' : '1px solid rgba(26,19,5,0.08)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>
          {formatDate(item.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {item.is_pinned ? (
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}>
              Disematkan
            </span>
          ) : null}
          {isNew ? (
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(47,138,79,0.12)', color: '#2f8a4f' }}>
              Baru
            </span>
          ) : null}
        </div>
      </div>

      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={inputStyle} />
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
              style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSave}
              className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
              style={{ background: '#1a1305', color: '#f5f3ee' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-1.5 text-base font-bold md:text-lg" style={{ color: '#1f1a10' }}>{item.title}</div>
          <div className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#5b543f' }}>
            {item.content}
          </div>
        </>
      )}

      {canManage && !editing ? (
        <div className="mt-3 flex gap-3">
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
            Edit
          </button>
          <button type="button" disabled={isPending} onClick={handleDelete} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
            Hapus
          </button>
        </div>
      ) : null}
    </div>
  )
}
