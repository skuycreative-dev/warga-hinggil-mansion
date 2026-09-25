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
  created_at: string
  submitter_name: string
}

export default function TukangKelolaTable({ items }: { items: PendingTukang[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveTukang(id)
      router.refresh()
    })
  }

  function handleReject(id: string) {
    if (!confirm('Tolak pendaftaran tukang ini?')) return
    startTransition(async () => {
      await rejectTukang(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Tidak ada tukang yang menunggu verifikasi.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</div>
              <div className="text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>{t.specialty} · {t.phone}</div>
              {t.description ? <p className="mt-1.5 text-[13px]" style={{ color: '#5b543f' }}>{t.description}</p> : null}
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                Diajukan oleh {t.submitter_name} ·{' '}
                {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReject(t.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Tolak
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleApprove(t.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#1a1305', color: '#e6c98a' }}
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
