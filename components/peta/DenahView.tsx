'use client'

import { useEffect, useRef, useState } from 'react'
import type { MapFacility, MapHouse } from '@/lib/map-types'

type Layers = { emergency: boolean; absence: boolean; ipl: boolean; occupancy: boolean }

// Denah (gambar siteplan) dengan titik rumah. Bisa diperbesar & digeser.
// Mode atur: ketuk gambar untuk meletakkan titik yang sedang dipilih.
export default function DenahView({
  url,
  width,
  height,
  houses,
  facilities,
  colorOf,
  selectedId,
  focusId,
  placing,
  onSelect,
  onPlace,
}: {
  url: string
  width: number | null
  height: number | null
  houses: MapHouse[]
  facilities: MapFacility[]
  colorOf: (h: MapHouse) => string
  selectedId: string | null
  focusId: string | null
  placing: boolean
  onSelect: (kind: 'house' | 'facility', id: string) => void
  onPlace: (x: number, y: number) => void
  layers?: Layers
}) {
  const [zoom, setZoom] = useState(1)
  const boxRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const ratio = width && height ? height / width : 0.62

  // Rumah yang dituju (mis. dari alert darurat): perbesar & gulir ke sana
  useEffect(() => {
    if (!focusId) return
    const h = houses.find((x) => x.id === focusId)
    if (!h || h.x === null || h.y === null) return
    setZoom(2.2)
    const t = setTimeout(() => {
      const box = boxRef.current
      const wrap = imgWrapRef.current
      if (!box || !wrap) return
      box.scrollTo({ left: (wrap.clientWidth * h.x!) / 100 - box.clientWidth / 2, top: (wrap.clientHeight * h.y!) / 100 - box.clientHeight / 2, behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(t)
  }, [focusId, houses])

  function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) onPlace(Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000)
  }

  const size = zoom >= 2 ? 26 : zoom >= 1.5 ? 22 : 18

  return (
    <div className="relative">
      <div ref={boxRef} className="overflow-auto rounded-2xl" style={{ maxHeight: '70vh', background: '#efe9dc', border: '1px solid rgba(26,19,5,0.1)', touchAction: 'pan-x pan-y' }}>
        <div ref={imgWrapRef} className="relative" style={{ width: `${zoom * 100}%`, paddingTop: `${ratio * 100 * zoom}%`, minWidth: '100%' }}>
          <div className="absolute inset-0" onClick={tap} style={{ cursor: placing ? 'crosshair' : 'default' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Denah perumahan" className="pointer-events-none h-full w-full select-none object-contain" draggable={false} />
            {facilities
              .filter((f) => f.x !== null && f.y !== null)
              .map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!placing) onSelect('facility', f.id)
                  }}
                  aria-label={f.name}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{
                    left: `${f.x}%`,
                    top: `${f.y}%`,
                    width: size,
                    height: size,
                    background: 'var(--brand-theme)',
                    color: 'var(--brand-accent)',
                    outline: selectedId === f.id ? '3px solid #2563eb' : 'none',
                    pointerEvents: placing ? 'none' : 'auto',
                  }}
                >
                  {f.name.charAt(0).toUpperCase()}
                </button>
              ))}
            {houses
              .filter((h) => h.x !== null && h.y !== null)
              .map((h) => {
                const color = colorOf(h)
                const hot = !!h.emergency && color === '#d62828'
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!placing) onSelect('house', h.id)
                    }}
                    aria-label={`Rumah ${h.nomor}`}
                    className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold ${hot ? 'peta-pulse' : ''}`}
                    style={{
                      left: `${h.x}%`,
                      top: `${h.y}%`,
                      minWidth: size,
                      height: size,
                      padding: '0 3px',
                      fontSize: size >= 22 ? 10 : 8.5,
                      background: color,
                      color: '#ffffff',
                      border: h.mine ? '2px solid #1a1305' : '1.5px solid #ffffff',
                      outline: selectedId === h.id ? '3px solid #2563eb' : 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                      pointerEvents: placing ? 'none' : 'auto',
                    }}
                  >
                    {h.nomor.length > 5 ? h.nomor.slice(-4) : h.nomor}
                  </button>
                )
              })}
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button type="button" onClick={() => setZoom((z) => Math.min(4, Math.round((z + 0.5) * 10) / 10))} aria-label="Perbesar" className="h-9 w-9 rounded-lg text-lg font-bold" style={{ background: '#ffffff', color: '#1f1a10', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
          +
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.5) * 10) / 10))} aria-label="Perkecil" className="h-9 w-9 rounded-lg text-lg font-bold" style={{ background: '#ffffff', color: '#1f1a10', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
          −
        </button>
      </div>
      <style>{`
        @keyframes petaPulse { 0% { box-shadow: 0 0 0 0 rgba(214,40,40,0.7); } 70% { box-shadow: 0 0 0 14px rgba(214,40,40,0); } 100% { box-shadow: 0 0 0 0 rgba(214,40,40,0); } }
        .peta-pulse { animation: petaPulse 1.2s ease-out infinite; z-index: 5; }
      `}</style>
    </div>
  )
}