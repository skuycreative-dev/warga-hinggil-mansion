'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import OccupancyEditor from '@/components/hunian/OccupancyEditor'
import { assignHouseOwner } from '@/app/status-hunian/actions'
import { OCCUPANCY_OPTIONS, occupancyInfo } from '@/lib/hunian'
import { inputStyle } from '@/lib/format'

export type HouseRow = {
  id: string
  nomor_rumah: string
  status: string
  owner_id: string | null
  residents: { id: string; name: string; family_role: string | null }[]
  last_change: string | null
}

// Tampilan Pengurus: semua rumah, ubah status & tetapkan pemilik
export default function HouseTable({ houses, canEdit }: { houses: HouseRow[]; canEdit: boolean }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('semua')
  const [openId, setOpenId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    houses.forEach((h) => m.set(h.status, (m.get(h.status) ?? 0) + 1))
    return m
  }, [houses])

  const shown = houses.filter(
    (h) => (filter === 'semua' || h.status === filter) && (!query || h.nomor_rumah.toLowerCase().includes(query.trim().toLowerCase()))
  )

  function setOwner(houseId: string, userId: string) {
    setError('')
    startTransition(async () => {
      const r = await assignHouseOwner(houseId, userId || null)
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OCCUPANCY_OPTIONS.map((o) => (
          <button key={o.key} type="button" onClick={() => setFilter(filter === o.key ? 'semua' : o.key)} className="rounded-xl px-3 py-2.5 text-left" style={filter === o.key ? { background: o.color, color: '#fff' } : { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: filter === o.key ? '#fff' : o.color }}>{o.label}</div>
            <div className="text-lg font-bold" style={{ color: filter === o.key ? '#fff' : '#1f1a10' }}>{counts.get(o.key) ?? 0}</div>
          </button>
        ))}
      </div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nomor rumah" aria-label="Cari nomor rumah" style={{ ...inputStyle, background: '#fff' }} />
      {error ? <p className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex flex-col gap-2">
        {shown.map((h) => {
          const info = occupancyInfo(h.status)
          const owner = h.residents.find((r) => r.id === h.owner_id)
          return (
            <div key={h.id} className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Rumah {h.nomor_rumah}</span>
                  <span className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: info.bg, color: info.color }}>{info.label}</span>
                  <div className="text-[12px]" style={{ color: '#5b543f' }}>
                    Pemilik: {owner ? owner.name : <span style={{ color: '#b3392f' }}>belum ditetapkan</span>} · {h.residents.length} penghuni terdaftar
                    {h.last_change ? ` · diubah ${new Date(h.last_change).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}
                  </div>
                </div>
                {canEdit ? (
                  <button type="button" onClick={() => setOpenId(openId === h.id ? null : h.id)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                    {openId === h.id ? 'Tutup' : 'Ubah'}
                  </button>
                ) : null}
              </div>
              {canEdit && openId === h.id ? (
                <div className="mt-3 flex flex-col gap-3 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
                  <label className="flex flex-col gap-1 text-[12px] font-bold" style={{ color: '#5b543f' }}>
                    Pemilik rumah (bisa mengubah status sendiri)
                    <select value={h.owner_id ?? ''} disabled={isPending} onChange={(e) => setOwner(h.id, e.target.value)} style={{ ...inputStyle, background: '#faf7f0' }}>
                      <option value="">Belum ditetapkan</option>
                      {h.residents.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                          {r.family_role === 'kepala_keluarga' ? ' (Kepala Keluarga)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <OccupancyEditor current={h.status} houseId={h.id} compact />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}