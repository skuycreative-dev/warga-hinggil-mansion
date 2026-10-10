'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { stickerUrl, type Sticker, type StickerPack } from '@/lib/stickers'

// Daftar stiker dimuat sekali per kunjungan lalu dipakai bersama (chat, forum, komentar)
let cache: StickerPack[] | null = null
let loading: Promise<StickerPack[]> | null = null

async function loadPacks(): Promise<StickerPack[]> {
  if (cache) return cache
  if (!loading) {
    loading = (async () => {
      const supabase = createClient()
      const [{ data: packs }, { data: stickers }] = await Promise.all([
        supabase.from('sticker_packs').select('id, name').eq('is_active', true).order('sort_order').order('created_at'),
        supabase.from('stickers').select('id, pack_id, path, label').eq('is_active', true).order('sort_order').order('created_at'),
      ])
      const result = ((packs ?? []) as { id: string; name: string }[])
        .map((p) => ({ id: p.id, name: p.name, stickers: ((stickers ?? []) as Sticker[]).filter((s) => s.pack_id === p.id) }))
        .filter((p) => p.stickers.length > 0)
      cache = result
      return result
    })().finally(() => {
      loading = null
    })
  }
  return loading
}

export default function StickerPicker({ onPick, onClose }: { onPick: (s: Sticker) => void; onClose: () => void }) {
  const [packs, setPacks] = useState<StickerPack[] | null>(cache)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let alive = true
    loadPacks().then((p) => alive && setPacks(p)).catch(() => alive && setPacks([]))
    return () => {
      alive = false
    }
  }, [])

  const pack = packs?.[Math.min(active, Math.max(0, (packs?.length ?? 1) - 1))]

  return (
    <div className="rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.1)', boxShadow: '0 8px 24px -12px rgba(26,19,5,0.25)' }}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: 'rgba(26,19,5,0.08)' }}>
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">
          {(packs ?? []).map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className="flex-shrink-0 rounded-full px-3 py-1 text-[12px] font-bold"
              style={i === active ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f' }}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup stiker" className="flex-shrink-0 px-2 text-[18px] font-bold leading-none" style={{ color: '#9c7a3f' }}>
          ×
        </button>
      </div>
      <div className="max-h-52 overflow-y-auto p-3">
        {packs === null ? (
          <p className="py-4 text-center text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>Memuat stiker...</p>
        ) : !pack ? (
          <p className="py-4 text-center text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>Belum ada stiker. Pengurus belum menambahkan paket stiker.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {pack.stickers.map((s) => (
              <button key={s.id} type="button" onClick={() => onPick(s)} aria-label={s.label ?? 'Stiker'} className="flex aspect-square items-center justify-center rounded-xl p-1 transition hover:opacity-80" style={{ background: '#faf7f0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stickerUrl(s.path)} alt={s.label ?? 'Stiker'} className="max-h-full max-w-full object-contain" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}