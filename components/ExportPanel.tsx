'use client'

import { useState } from 'react'

// Unduh laporan keuangan sebagai Excel atau PDF berkop perumahan
export default function ExportPanel({
  kinds,
  defaultFrom,
  defaultTo,
}: {
  kinds: { key: 'anggaran' | 'ipl' | 'tunggakan'; label: string }[]
  defaultFrom: string
  defaultTo: string
}) {
  const [kind, setKind] = useState(kinds[0]?.key ?? 'anggaran')
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [open, setOpen] = useState(false)
  const onlyTo = kind === 'tunggakan'
  const href = (format: 'xlsx' | 'pdf') => `/api/ekspor?jenis=${kind}&format=${format}&dari=${from}&sampai=${to}`
  const field: React.CSSProperties = { background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', borderRadius: 10, padding: '8px 10px', color: '#1f1a10', fontSize: 16 }

  if (!kinds.length) return null

  return (
    <div className="mb-5 rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between text-left">
        <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Unduh Laporan (Excel / PDF)</span>
        <span className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>{open ? 'Tutup' : 'Buka'}</span>
      </button>
      {open ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {kinds.length > 1 ? (
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Jenis laporan">
              {kinds.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  role="radio"
                  aria-checked={kind === k.key}
                  onClick={() => setKind(k.key)}
                  className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
                  style={kind === k.key ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
                >
                  {k.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            {!onlyTo ? (
              <label className="flex flex-col gap-1 text-[11.5px] font-bold" style={{ color: '#5b543f' }}>
                Dari bulan
                <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} style={field} />
              </label>
            ) : null}
            <label className={`flex flex-col gap-1 text-[11.5px] font-bold ${onlyTo ? 'col-span-2' : ''}`} style={{ color: '#5b543f' }}>
              {onlyTo ? 'Sampai bulan' : 'Sampai bulan'}
              <input type="month" value={to} onChange={(e) => setTo(e.target.value)} style={field} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={href('xlsx')} className="rounded-xl py-2.5 text-center text-[13px] font-bold" style={{ background: '#2f6b4f', color: '#ffffff' }}>
              Excel (.xlsx)
            </a>
            <a href={href('pdf')} className="rounded-xl py-2.5 text-center text-[13px] font-bold" style={{ background: '#b3392f', color: '#ffffff' }}>
              PDF berkop
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}