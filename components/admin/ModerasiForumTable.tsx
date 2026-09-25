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

export default function ModerasiForumTable({ posts }: { posts: HiddenPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReactivate(id: string) {
    startTransition(async () => {
      await reactivatePost(id)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus postingan ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return
    startTransition(async () => {
      await deletePostPermanently(id)
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Tidak ada postingan yang disembunyikan.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {posts.map((p) => (
        <div key={p.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.author_name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: '#f2b8b0', color: '#7a231b' }}
                >
                  {p.report_count} laporan
                </span>
              </div>
              <p className="mt-1.5 text-[13px]" style={{ color: '#5b543f' }}>{p.content}</p>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(p.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Hapus Permanen
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReactivate(p.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#1a1305', color: '#e6c98a' }}
              >
                Aktifkan Kembali
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
