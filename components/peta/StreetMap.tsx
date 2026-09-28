'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, LayerGroup } from 'leaflet'
import type { MapFacility, MapHouse } from '@/lib/map-types'

// Peta jalan OpenStreetMap. Titik rumah memakai lingkaran (tanpa gambar ikon).
export default function StreetMap({
  center,
  houses,
  facilities,
  colorOf,
  focusId,
  placing,
  onSelect,
  onPlace,
  onView,
}: {
  center: { lat: number; lng: number; zoom: number }
  houses: MapHouse[]
  facilities: MapFacility[]
  colorOf: (h: MapHouse) => string
  focusId: string | null
  placing: boolean
  onSelect: (kind: 'house' | 'facility', id: string) => void
  onPlace: (lat: number, lng: number) => void
  onView?: (lat: number, lng: number, zoom: number) => void
}) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layerRef = useRef<LayerGroup | null>(null)
  const LRef = useRef<typeof import('leaflet') | null>(null)
  const placingRef = useRef(placing)
  const cb = useRef({ onSelect, onPlace, onView })
  placingRef.current = placing
  cb.current = { onSelect, onPlace, onView }

  useEffect(() => {
    let alive = true
    import('leaflet').then((L) => {
      if (!alive || !elRef.current || mapRef.current) return
      LRef.current = L
      const map = L.map(elRef.current, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], center.zoom)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map)
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        if (placingRef.current) cb.current.onPlace(Math.round(e.latlng.lat * 1e6) / 1e6, Math.round(e.latlng.lng * 1e6) / 1e6)
      })
      map.on('moveend', () => {
        const c = map.getCenter()
        cb.current.onView?.(c.lat, c.lng, map.getZoom())
      })
      layerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
      draw()
    })
    return () => {
      alive = false
      mapRef.current?.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function draw() {
    const L = LRef.current
    const layer = layerRef.current
    if (!L || !layer) return
    layer.clearLayers()
    for (const f of facilities) {
      if (f.lat === null || f.lng === null) continue
      L.circleMarker([f.lat, f.lng], { radius: 7, color: '#1a1305', weight: 2, fillColor: '#e6c98a', fillOpacity: 1 })
        .bindTooltip(f.name, { direction: 'top' })
        .on('click', () => !placingRef.current && cb.current.onSelect('facility', f.id))
        .addTo(layer)
    }
    for (const h of houses) {
      if (h.lat === null || h.lng === null) continue
      const color = colorOf(h)
      const hot = !!h.emergency && color === '#d62828'
      if (hot) L.circleMarker([h.lat, h.lng], { radius: 16, color: '#d62828', weight: 2, fillColor: '#d62828', fillOpacity: 0.18, className: 'peta-ring' }).addTo(layer)
      L.circleMarker([h.lat, h.lng], { radius: h.mine ? 8 : 6.5, color: h.mine ? '#1a1305' : '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 })
        .bindTooltip(`Rumah ${h.nomor}`, { direction: 'top' })
        .on('click', () => !placingRef.current && cb.current.onSelect('house', h.id))
        .addTo(layer)
    }
  }

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [houses, facilities, colorOf])

  useEffect(() => {
    if (!focusId || !mapRef.current) return
    const h = houses.find((x) => x.id === focusId)
    if (h?.lat != null && h?.lng != null) mapRef.current.setView([h.lat, h.lng], 19)
  }, [focusId, houses])

  useEffect(() => {
    if (elRef.current) elRef.current.style.cursor = placing ? 'crosshair' : ''
  }, [placing])

  return (
    <div>
      <div ref={elRef} className="w-full overflow-hidden rounded-2xl" style={{ height: '65vh', minHeight: 320, border: '1px solid rgba(26,19,5,0.1)', background: '#e8e4da' }} />
      <style>{`
        @keyframes petaRing { 0% { opacity: 1; } 50% { opacity: 0.25; } 100% { opacity: 1; } }
        .peta-ring { animation: petaRing 1s ease-in-out infinite; }
        .leaflet-container { font-family: inherit; }
      `}</style>
    </div>
  )
}