'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { flagHouseEmpty, unflagHouseEmpty } from '@/app/rumah-kosong/actions'

type House = {
  id: string
  nomor_rumah: string
  is_empty_flagged: boolean
  empty_since: string | null
}

function daysSince(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  return days
}

export default function RumahKosongList({ houses }: { houses: House[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'semua' | 'kosong'>('semua')

  function handleToggle(house: House) {
    startTransition(async () => {
      if (house.is_empty_flagged) {
        await unflagHouseEmpty(house.id)
      } else {
        await flagHouseEmpty(house.id)
      }
      router.refresh()
    })
  }

  const filtered = filter === 'kosong' ? houses.filter((h) => h.is_empty_flagged) : houses

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('semua')}
          className="rounded-full px-4 py-1.5 text-[12.5px] font-bold"
          style={{
            background: filter === 'semua' ? '#1a1305' : '#ffffff',
            color: filter === 'semua' ? '#f5f3ee' : '#5b543f',
            border: '1px solid rgba(26,19,5,0.12)',
          }}
        >
          Semua Rumah
        </button>
        <button
          type="button"
          onClick={() => setFilter('kosong')}
          className="rounded-full px-4 py-1.5 text-[12.5px] font-bold"
          style={{
            background: filter === 'kosong' ? '#b3392f' : '#ffffff',
            color: filter === 'kosong' ? '#ffffff' : '#5b543f',
            border: '1px solid rgba(26,19,5,0.12)',
          }}
        >
          Ditandai Kosong
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada data.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-2xl px-5 py-4"
              style={{
                background: '#ffffff',
                border: h.is_empty_flagged ? '1px solid rgba(179,57,47,0.3)' : '1px solid rgba(26,19,5,0.08)',
              }}
            >
              <div>
                <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Rumah {h.nomor_rumah}</div>
                {h.is_empty_flagged && h.empty_since ? (
                  <div className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#b3392f' }}>
                    Kosong {daysSince(h.empty_since)} hari
                  </div>
                ) : (
                  <div className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#2f8a4f' }}>Berpenghuni</div>
                )}
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggle(h)}
                className="rounded-xl px-3.5 py-2 text-[12.5px] font-bold"
                style={{
                  background: h.is_empty_flagged ? '#faf7f0' : '#b3392f',
                  color: h.is_empty_flagged ? '#1f1a10' : '#ffffff',
                  border: h.is_empty_flagged ? '1px solid rgba(26,19,5,0.12)' : 'none',
                }}
              >
                {h.is_empty_flagged ? 'Tandai Berpenghuni' : 'Tandai Kosong'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
