'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import Stars from '@/components/tukang/Stars'
import { TUKANG_CATEGORIES, categoryIcon, categoryLabel, initials, waNumber, type TukangSummary } from '@/lib/tukang'
import { inputStyle } from '@/lib/format'
import { useBranding } from '@/components/BrandingProvider'

type Sort = 'rating' | 'terbaru' | 'ulasan'

export default function TukangCatalog({ items, myId }: { items: TukangSummary[]; myId: string }) {
  const brand = useBranding()
  const [category, setCategory] = useState('semua')
  const [sort, setSort] = useState<Sort>('rating')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    items.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + 1))
    return map
  }, [items])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter((t) => category === 'semua' || t.category === category)
      .filter((t) => !q || `${t.name} ${t.specialty} ${t.area ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === 'terbaru') return b.created_at.localeCompare(a.created_at)
        if (sort === 'ulasan') return b.review_count - a.review_count
        return (b.avg_rating ?? 0) - (a.avg_rating ?? 0) || b.review_count - a.review_count
      })
  }, [items, category, sort, query])

  return (
    <div>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {[{ key: 'semua', label: 'Semua' }, ...TUKANG_CATEGORIES.filter((c) => counts.has(c.key))].map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold"
            style={category === c.key ? { background: '#1a1305', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
          >
            {c.label}
            {c.key !== 'semua' ? ` (${counts.get(c.key)})` : ` (${items.length})`}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama / keahlian" aria-label="Cari tukang" style={{ ...inputStyle, background: '#fff', flex: '1 1 180px', width: 'auto' }} />
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Urutkan" style={{ ...inputStyle, background: '#fff', width: 'auto' }}>
          <option value="rating">Rating tertinggi</option>
          <option value="ulasan">Ulasan terbanyak</option>
          <option value="terbaru">Terbaru</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
          {items.length === 0 ? 'Belum ada tukang direkomendasikan. Jadilah yang pertama!' : 'Tidak ada tukang yang cocok.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {shown.map((t) => {
            const wa = waNumber(t.phone)
            return (
              <div key={t.id} className="rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                <Link href={`/tukang/${t.id}`} className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-[15px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                    {initials(t.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="text-[14.5px] font-bold" style={{ color: '#1f1a10' }}>{t.name}</span>
                      {t.submitted_by === myId ? <span className="text-[10.5px] font-bold" style={{ color: '#9c7a3f' }}>postinganmu</span> : null}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px]" style={{ color: '#5b543f' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9c7a3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d={categoryIcon(t.category)} />
                      </svg>
                      <span className="truncate">
                        {categoryLabel(t.category)} · {t.specialty}
                        {t.experience_years ? ` · ${t.experience_years} thn` : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
                      {t.review_count > 0 && t.avg_rating ? (
                        <>
                          <Stars value={t.avg_rating} size={13} />
                          <b style={{ color: '#1f1a10' }}>{t.avg_rating.toFixed(1)}</b>
                          <span style={{ color: '#9c7a3f' }}>({t.review_count} ulasan)</span>
                        </>
                      ) : (
                        <span style={{ color: '#9c7a3f' }}>Belum ada ulasan</span>
                      )}
                      {t.price_range ? <span className="font-bold" style={{ color: '#2f6b4f' }}>· {t.price_range}</span> : null}
                    </div>
                  </div>
                </Link>
                {wa ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${t.name}, saya warga ${brand.community_name}. Saya dapat kontak dari Katalog Tukang.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg py-2 text-center text-[12.5px] font-bold"
                      style={{ background: '#1f7a45', color: '#ffffff' }}
                    >
                      Chat WA
                    </a>
                    <a href={`tel:+${wa}`} className="rounded-lg py-2 text-center text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}>
                      Telepon
                    </a>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}