'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAnnouncement } from '@/app/pengumuman/actions'

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
  author_name: string
}

export default function AnnouncementList({ items, canManage }: { items: Announcement[]; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    startTransition(async () => {
      await deleteAnnouncement(id)
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
      {items.map((a) => (
        <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{a.title}</div>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px]" style={{ color: '#5b543f' }}>{a.content}</p>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                {a.author_name} ·{' '}
                {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            {canManage ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(a.id)}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Hapus
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
