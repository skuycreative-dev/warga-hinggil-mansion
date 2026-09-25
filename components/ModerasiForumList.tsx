'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reactivatePost, deletePostPermanently } from '@/app/paguyuban/moderasi-forum/actions'

type HiddenPost = {
  id: string
  content: string
  author_name: string
  report_count: number
  created_at: string
}

export default function ModerasiForumList({ posts }: { posts: HiddenPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReactivate(id: string) {
    startTransition(async () => {
      await reactivatePost(id)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus postingan ini secara permanen?')) return
    startTransition(async () => {
      await deletePostPermanently(id)
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Tidak ada postingan yang perlu direview saat ini.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <div key={p.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.2)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.author_name}</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(179,57,47,0.1)', color: '#b3392f' }}>
              {p.report_count} laporan
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm font-medium" style={{ color: '#3a3424' }}>
            {p.content}
          </p>
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={() => handleReactivate(p.id)}
              disabled={isPending}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#2f8a4f', color: '#ffffff' }}
            >
              Aktifkan Kembali
            </button>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              disabled={isPending}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#b3392f', color: '#ffffff' }}
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
