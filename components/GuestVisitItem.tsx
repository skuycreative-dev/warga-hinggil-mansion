'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelGuestVisit } from '@/app/qr-tamu/actions'

type GuestVisit = {
  id: string
  guest_name: string
  purpose: string
  visit_code: string
  status: string
  created_at: string
  checked_in_at: string | null
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Menunggu' },
  masuk: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Di Dalam' },
  keluar: { bg: 'rgba(107,101,82,0.14)', text: '#6b6552', label: 'Sudah Keluar' },
  dibatalkan: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Dibatalkan' },
}

const PURPOSE_LABEL: Record<string, string> = {
  keluarga: 'Keluarga / Kerabat',
  kurir: 'Kurir / Ojek Online',
  tukang: 'Tukang / Jasa',
  delivery: 'Delivery / Pengantaran',
  lainnya: 'Lainnya',
}

export default function GuestVisitItem({ item }: { item: GuestVisit }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const statusStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.menunggu

  function handleCancel() {
    if (!confirm(`Batalkan undangan untuk ${item.guest_name}?`)) return
    startTransition(async () => {
      await cancelGuestVisit(item.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
        <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{item.guest_name}</div>
      <p className="mt-0.5 text-[12.5px]" style={{ color: '#5b543f' }}>{PURPOSE_LABEL[item.purpose] ?? item.purpose}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#9c7a3f' }}>
          {item.visit_code}
        </span>
        {item.status === 'menunggu' ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="text-[12px] font-bold"
            style={{ color: '#b3392f' }}
          >
            Batalkan
          </button>
        ) : null}
      </div>
    </div>
  )
}
