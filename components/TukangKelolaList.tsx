'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveTukang, rejectTukang } from '@/app/tukang/actions'

type PendingTukang = {
  id: string
  name: string
  specialty: string
  phone: string
  description: string | null
  submitter_name: string
}

export default function TukangKelolaList({ items }: { items: PendingTukang[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveTukang(id)
      router.refresh()
    })
  }

  function handleReject(id: string) {
    if (!confirm('Tolak rekomendasi ini?')) return
    startTransition(async () => {
      await rejectTukang(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Tidak ada rekomendasi tukang yang menunggu review.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}>
              {t.specialty}
            </span>
          </div>
          <div className="mt-1 text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{t.phone} · diajukan oleh {t.submitter_name}</div>
          {t.description ? <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{t.description}</p> : null}
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleApprove(t.id)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#2f8a4f', color: '#ffffff' }}
            >
              Setujui
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleReject(t.id)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#b3392f', color: '#ffffff' }}
            >
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
