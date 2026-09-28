'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTukang } from '@/app/tukang/actions'
import { categoryLabel } from '@/lib/tukang'
import { inputStyle } from '@/lib/format'

export type KelolaTukang = {
  id: string
  name: string
  specialty: string
  category: string
  phone: string | null
  created_at: string
  submitter_name: string
  avg_rating: number | null
  review_count: number
  low_reviews: number
}

// Postingan warga langsung tampil; di sini Pengurus memantau & menghapus yang bermasalah.
export default function TukangKelolaTable({ items }: { items: KelolaTukang[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [onlyFlagged, setOnlyFlagged] = useState(false)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((t) => !onlyFlagged || t.low_reviews > 0)
      .filter((t) => !q || `${t.name} ${t.specialty} ${t.submitter_name}`.toLowerCase().includes(q))
  }, [items, query, onlyFlagged])

  function remove(t: KelolaTukang) {
    if (!confirm(`Hapus ${t.name} dari katalog? Ulasan & foto ikut terhapus.`)) return
    startTransition(async () => {
      const result = await deleteTukang(t.id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama / keahlian / pemosting" aria-label="Cari" style={{ ...inputStyle, background: '#fff', flex: '1 1 220px', width: 'auto' }} />
        <label className="flex items-center gap-2 text-[12.5px] font-bold" style={{ color: '#5b543f' }}>
          <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} />
          Hanya yang punya ulasan bintang 1-2
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
          Tidak ada data.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                {['Nama', 'Kategori', 'Rating', 'Diposting', ''].map((h) => (
                  <th key={h} className="px-4 py-2.5 font-bold" style={{ color: '#9c7a3f' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.05)' }}>
                  <td className="px-4 py-2.5">
                    <Link href={`/tukang/${t.id}`} className="font-bold hover:underline" style={{ color: '#1f1a10' }}>{t.name}</Link>
                    <div className="text-[11px]" style={{ color: '#5b543f' }}>{t.specialty} · {t.phone}</div>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: '#5b543f' }}>{categoryLabel(t.category)}</td>
                  <td className="px-4 py-2.5" style={{ color: '#1f1a10' }}>
                    {t.avg_rating ? `${t.avg_rating.toFixed(1)} ★ (${t.review_count})` : '-'}
                    {t.low_reviews > 0 ? <div className="text-[11px] font-bold" style={{ color: '#b3392f' }}>{t.low_reviews} ulasan buruk</div> : null}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: '#5b543f' }}>
                    {t.submitter_name}
                    <div className="text-[11px]" style={{ color: '#9c7a3f' }}>{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button type="button" disabled={isPending} onClick={() => remove(t)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}