'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkOutGuest } from '@/app/keamanan/scan-tamu/actions'

type GuestVisit = {
  id: string
  guest_name: string
  purpose: string
  visit_code: string
  status: string
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
  house?: { nomor_rumah: string } | null
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Menunggu' },
  masuk: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Di Dalam' },
  keluar: { bg: 'rgba(107,101,82,0.14)', text: '#6b6552', label: 'Sudah Keluar' },
  dibatalkan: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Dibatalkan' },
}

export default function GuestLogTable({ guests }: { guests: GuestVisit[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCheckOut(id: string) {
    startTransition(async () => {
      await checkOutGuest(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama Tamu</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Status</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada log tamu.
              </td>
            </tr>
          ) : (
            guests.map((g) => {
              const statusStyle = STATUS_STYLE[g.status] ?? STATUS_STYLE.menunggu
              return (
                <tr key={g.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                  <td className="px-5 py-3.5">
                    <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{g.guest_name}</div>
                    <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>Kode: {g.visit_code}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                    {g.house?.nomor_rumah ?? '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                      style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {g.status === 'masuk' ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCheckOut(g.id)}
                        className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                        style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
                      >
                        Keluar
                      </button>
                    ) : (
                      <span className="text-[12px] font-medium" style={{ color: '#9c7a3f' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
