'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage, extFor, isImage } from '@/lib/image-upload'
import { rupiah, dateLabel } from '@/lib/format'
import { EMERGENCY_LABEL, FACILITY_LABEL, houseColor, type MapData, type MapHouse } from '@/lib/map-types'
import { addFacility, deleteFacility, moveFacility, saveHouseLocation, saveHousePosition, saveMapCenter, saveSitePlanImage } from '@/app/peta/actions'
import DenahView from '@/components/peta/DenahView'

const StreetMap = dynamic(() => import('@/components/peta/StreetMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center rounded-2xl text-[13px]" style={{ height: '65vh', background: '#efe9dc', color: '#5b543f' }}>Memuat peta...</div>,
})

const OCC_LABEL: Record<string, string> = { pemilik: 'Ditempati pemilik', penyewa: 'Disewakan', sementara: 'Tinggal sementara', kosong: 'Tidak ditempati' }
const DEFAULT_CENTER = { lat: -7.7956, lng: 110.3695, zoom: 14 }
const card: React.CSSProperties = { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', borderRadius: 16 }

type Placing = { kind: 'house' | 'facility' | 'new-facility'; id: string; view: 'denah' | 'jalan' } | null

export default function PetaPerumahan({ data }: { data: MapData }) {
  const router = useRouter()
  const [tab, setTab] = useState<'denah' | 'jalan'>(data.plan.url ? 'denah' : 'jalan')
  const [layers, setLayers] = useState({ emergency: true, absence: true, ipl: data.iplView, occupancy: false })
  const [selected, setSelected] = useState<{ kind: 'house' | 'facility'; id: string } | null>(null)
  const [focusId, setFocusId] = useState<string | null>(data.focusHouseId)
  const [query, setQuery] = useState('')
  const [placing, setPlacing] = useState<Placing>(null)
  const [newFacility, setNewFacility] = useState({ name: '', kind: 'pos_security' })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const viewRef = useRef<{ lat: number; lng: number; zoom: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const mapTopRef = useRef<HTMLDivElement>(null)

  const colorOf = useCallback((h: MapHouse) => houseColor(h, layers, data.staffView), [layers, data.staffView])
  const emergencies = data.houses.filter((h) => h.emergency)
  const placedDenah = data.houses.filter((h) => h.x !== null).length
  const placedJalan = data.houses.filter((h) => h.lat !== null).length
  const house = selected?.kind === 'house' ? data.houses.find((h) => h.id === selected.id) ?? null : null
  const facility = selected?.kind === 'facility' ? data.facilities.find((f) => f.id === selected.id) ?? null : null
  const unplaced = useMemo(
    () => data.houses.filter((h) => (tab === 'denah' ? h.x === null : h.lat === null)).sort((a, b) => a.nomor.localeCompare(b.nomor, 'id', { numeric: true })),
    [data.houses, tab]
  )

  useEffect(() => {
    if (data.focusHouseId) {
      setSelected({ kind: 'house', id: data.focusHouseId })
      const h = data.houses.find((x) => x.id === data.focusHouseId)
      if (h && h.x === null && h.lat !== null) setTab('jalan')
    }
  }, [data.focusHouseId, data.houses])

  // Saat mode meletakkan titik dimulai, gulir ke peta supaya bisa langsung diketuk
  useEffect(() => {
    if (placing) mapTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [placing])

  function run(fn: () => Promise<{ error: string | null }>, okText: string) {
    setMsg(null)
    startTransition(async () => {
      const r = await fn()
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: okText })
      if (!r.error) router.refresh()
    })
  }

  function select(kind: 'house' | 'facility', id: string) {
    setSelected({ kind, id })
    setMsg(null)
  }

  function focusHouse(h: MapHouse) {
    setSelected({ kind: 'house', id: h.id })
    setTab(h.x !== null || h.lat === null ? 'denah' : 'jalan')
    setFocusId(null)
    setTimeout(() => setFocusId(h.id), 30)
  }

  function search(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim().toLowerCase()
    if (!q) return
    const h = data.houses.find((x) => x.nomor.toLowerCase() === q) ?? data.houses.find((x) => x.nomor.toLowerCase().includes(q))
    if (!h) {
      setMsg({ ok: false, text: `Rumah "${query}" tidak ditemukan.` })
      return
    }
    focusHouse(h)
  }

  function placeDenah(x: number, y: number) {
    if (!placing) return
    const p = placing
    setPlacing(null)
    if (p.kind === 'house') run(() => saveHousePosition(p.id, x, y), 'Titik rumah disimpan.')
    else if (p.kind === 'facility') run(() => moveFacility(p.id, { map_x: x, map_y: y }), 'Posisi fasilitas disimpan.')
    else run(() => addFacility({ ...newFacility, map_x: x, map_y: y }), 'Fasilitas ditambahkan.')
  }

  function placeJalan(lat: number, lng: number) {
    if (!placing) return
    const p = placing
    setPlacing(null)
    if (p.kind === 'house') run(() => saveHouseLocation(p.id, lat, lng), 'Lokasi rumah disimpan.')
    else if (p.kind === 'facility') run(() => moveFacility(p.id, { lat, lng }), 'Lokasi fasilitas disimpan.')
    else run(() => addFacility({ ...newFacility, lat, lng }), 'Fasilitas ditambahkan.')
  }

  async function uploadPlan(file: File | undefined) {
    if (!file) return
    if (!isImage(file)) {
      setMsg({ ok: false, text: 'Denah harus berupa gambar JPG, PNG, atau WEBP (PDF: screenshot dulu).' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const blob = await compressImage(file, { maxBytes: 4.5 * 1024 * 1024, maxSize: 3200 })
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(blob)
        img.onload = () => {
          resolve({ w: img.naturalWidth, h: img.naturalHeight })
          URL.revokeObjectURL(url)
        }
        img.onerror = () => reject(new Error('gambar'))
        img.src = url
      })
      const path = `siteplan-${Date.now()}.${extFor(blob.type) === 'jpg' ? 'jpg' : extFor(blob.type) === 'png' ? 'png' : 'webp'}`
      const { error } = await createClient().storage.from('siteplan').upload(path, blob, { contentType: blob.type, upsert: false })
      if (error) throw new Error('upload')
      const r = await saveSitePlanImage(path, dims.w, dims.h)
      setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: 'Denah diperbarui. Titik rumah lama tetap tersimpan.' })
      if (!r.error) {
        setTab('denah')
        router.refresh()
      }
    } catch {
      setMsg({ ok: false, text: 'Gagal mengunggah denah. Coba gambar lain atau periksa internet.' })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const chip = (on: boolean): React.CSSProperties =>
    on ? { background: '#1a1305', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.12)' }
  const center = data.center ?? DEFAULT_CENTER
  const routeTarget = house?.lat != null && house?.lng != null ? { lat: house.lat, lng: house.lng } : data.center

  return (
    <div className="flex flex-col gap-4">
      {data.staffView && emergencies.length ? (
        <div className="rounded-2xl px-4 py-3" style={{ background: '#d62828', color: '#ffffff' }} role="alert">
          <div className="text-[13px] font-bold">DARURAT AKTIF ({emergencies.length})</div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {emergencies.map((h) => (
              <button key={h.id} type="button" onClick={() => focusHouse(h)} className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: '#ffffff', color: '#d62828' }}>
                Rumah {h.nomor} · {EMERGENCY_LABEL[h.emergency!.type] ?? 'Darurat'}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full p-1" style={{ background: '#efe9dc' }} role="tablist">
          {(['denah', 'jalan'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setPlacing(null) }} className="rounded-full px-4 py-1.5 text-[13px] font-bold" style={tab === t ? { background: '#1a1305', color: 'var(--brand-accent)' } : { color: '#5b543f' }}>
              {t === 'denah' ? 'Denah' : 'Peta Jalan'}
            </button>
          ))}
        </div>
        <form onSubmit={search} className="ml-auto flex gap-1.5">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari no. rumah" aria-label="Cari nomor rumah" className="w-32 rounded-full px-3 py-1.5 text-[16px] sm:w-40" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }} />
          <button type="submit" className="rounded-full px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>Cari</button>
        </form>
      </div>

      {data.staffView ? (
        <div className="flex flex-wrap gap-2" aria-label="Lapisan peta">
          <button type="button" onClick={() => setLayers((l) => ({ ...l, emergency: !l.emergency }))} aria-pressed={layers.emergency} className="rounded-full px-3 py-1 text-[12px] font-bold" style={chip(layers.emergency)}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#d62828' }} />Darurat
          </button>
          <button type="button" onClick={() => setLayers((l) => ({ ...l, absence: !l.absence }))} aria-pressed={layers.absence} className="rounded-full px-3 py-1 text-[12px] font-bold" style={chip(layers.absence)}>
            <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#3b5b8a' }} />Rumah kosong
          </button>
          {data.iplView ? (
            <button type="button" onClick={() => setLayers((l) => ({ ...l, ipl: !l.ipl }))} aria-pressed={layers.ipl} className="rounded-full px-3 py-1 text-[12px] font-bold" style={chip(layers.ipl)}>
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: '#c2410c' }} />Tunggakan IPL
            </button>
          ) : null}
          <button type="button" onClick={() => setLayers((l) => ({ ...l, occupancy: !l.occupancy }))} aria-pressed={layers.occupancy} className="rounded-full px-3 py-1 text-[12px] font-bold" style={chip(layers.occupancy)}>
            Status hunian
          </button>
        </div>
      ) : null}
      {data.staffView && layers.occupancy ? (
        <div className="flex flex-wrap gap-3 text-[11.5px] font-semibold" style={{ color: '#5b543f' }}>
          {[['#2f6b4f', 'Pemilik'], ['#7a5a1f', 'Disewakan'], ['#8a4a1f', 'Sementara'], ['#9a9486', 'Tidak ditempati']].map(([c, l]) => (
            <span key={l}><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: c }} />{l}</span>
          ))}
        </div>
      ) : null}

      <div ref={mapTopRef} className="scroll-mt-20" />
      {placing ? (
        <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[12.5px] font-bold" style={{ background: '#dbeafe', color: '#1e3a8a' }}>
          <span>Ketuk {placing.view === 'denah' ? 'denah' : 'peta'} di lokasi yang tepat untuk meletakkan titik.</span>
          <button type="button" onClick={() => setPlacing(null)} className="underline">Batal</button>
        </div>
      ) : null}

      {tab === 'denah' ? (
        data.plan.url ? (
          <DenahView
            url={data.plan.url}
            width={data.plan.width}
            height={data.plan.height}
            houses={data.houses}
            facilities={data.facilities}
            colorOf={colorOf}
            selectedId={selected?.id ?? null}
            focusId={focusId}
            placing={placing?.view === 'denah'}
            onSelect={select}
            onPlace={placeDenah}
          />
        ) : (
          <div className="rounded-2xl px-5 py-10 text-center text-[13px]" style={{ ...card, color: '#5b543f' }}>
            Denah perumahan belum diunggah.{data.canEdit ? ' Unggah gambar siteplan di bagian Atur Peta di bawah.' : ' Pengurus akan segera menambahkannya.'}
          </div>
        )
      ) : (
        <>
          {!data.center ? (
            <p className="text-[12px] font-semibold" style={{ color: '#7a5a1f' }}>
              Lokasi perumahan belum diatur{data.canEdit ? ': geser peta ke perumahan lalu tekan "Simpan tampilan ini sebagai lokasi perumahan".' : '.'}
            </p>
          ) : null}
          <StreetMap
            center={center}
            houses={data.houses}
            facilities={data.facilities}
            colorOf={colorOf}
            focusId={focusId}
            placing={placing?.view === 'jalan'}
            onSelect={select}
            onPlace={placeJalan}
            onView={(lat, lng, zoom) => (viewRef.current = { lat, lng, zoom })}
          />
          {routeTarget ? (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${routeTarget.lat},${routeTarget.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start rounded-xl px-4 py-2 text-[12.5px] font-bold"
              style={{ background: '#ffffff', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Rute ke {house?.lat != null ? `Rumah ${house.nomor}` : 'perumahan'} (Google Maps)
            </a>
          ) : null}
        </>
      )}

      {msg ? (
        <p role="status" className="text-[12.5px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>{msg.text}</p>
      ) : null}

      {house ? (
        <section className="px-5 py-4" style={card}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[16px] font-bold" style={{ color: '#1f1a10' }}>Rumah {house.nomor}{house.mine ? ' (rumahmu)' : ''}</div>
              {data.staffView ? (
                <div className="mt-1.5 flex flex-col gap-1 text-[12.5px]" style={{ color: '#3a3424' }}>
                  {house.emergency ? (
                    <Link href={`/keamanan/darurat/${house.emergency.id}`} className="font-bold" style={{ color: '#d62828' }}>
                      Darurat: {EMERGENCY_LABEL[house.emergency.type] ?? 'Darurat'} ({house.emergency.status}) → buka detail
                    </Link>
                  ) : null}
                  {house.absence ? <span style={{ color: '#3b5b8a' }}>Rumah kosong sampai {dateLabel(house.absence.until)}</span> : null}
                  {data.iplView ? <span style={{ color: house.iplDue > 0 ? '#c2410c' : '#2f6b4f' }}>{house.iplDue > 0 ? `Tunggakan IPL ${rupiah(house.iplDue)}` : 'IPL tidak ada tunggakan'}</span> : null}
                  <span>{OCC_LABEL[house.occupancy ?? ''] ?? 'Status hunian belum diisi'}</span>
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>Tutup</button>
          </div>
          {data.canEdit ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
              <button type="button" disabled={isPending} onClick={() => setPlacing({ kind: 'house', id: house.id, view: tab })} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                {tab === 'denah' ? (house.x === null ? 'Letakkan di denah' : 'Pindahkan titik') : house.lat === null ? 'Letakkan di peta' : 'Pindahkan titik'}
              </button>
              {(tab === 'denah' ? house.x !== null : house.lat !== null) ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => (tab === 'denah' ? saveHousePosition(house.id, null, null) : saveHouseLocation(house.id, null, null)), 'Titik dihapus.')}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
                >
                  Hapus titik
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {facility ? (
        <section className="px-5 py-4" style={card}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[16px] font-bold" style={{ color: '#1f1a10' }}>{facility.name}</div>
              <div className="text-[12px]" style={{ color: '#5b543f' }}>{FACILITY_LABEL[facility.kind] ?? 'Fasilitas'}</div>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>Tutup</button>
          </div>
          {data.canEdit ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
              <button type="button" onClick={() => setPlacing({ kind: 'facility', id: facility.id, view: tab })} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                Pindahkan titik
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (!confirm(`Hapus fasilitas "${facility.name}"?`)) return
                  setSelected(null)
                  run(() => deleteFacility(facility.id), 'Fasilitas dihapus.')
                }}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
              >
                Hapus
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {data.canEdit ? (
        <details className="px-5 py-4" style={card}>
          <summary className="cursor-pointer text-[14px] font-bold" style={{ color: '#1f1a10' }}>
            Atur Peta · denah {placedDenah}/{data.houses.length} rumah · peta jalan {placedJalan}/{data.houses.length} rumah
          </summary>
          <div className="mt-3 flex flex-col gap-4">
            <div>
              <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>1. Gambar denah / siteplan</div>
              <p className="text-[12px]" style={{ color: '#5b543f' }}>Foto atau gambar siteplan (JPG/PNG). Dari PDF: screenshot bagian denahnya dulu. Titik rumah memakai posisi persen, jadi tetap pas walau gambar diganti dengan ukuran sama.</p>
              <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="mt-2 rounded-xl px-4 py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: busy ? 0.6 : 1 }}>
                {busy ? 'Mengunggah...' : data.plan.url ? 'Ganti gambar denah' : 'Unggah gambar denah'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => uploadPlan(e.target.files?.[0])} />
            </div>

            <div>
              <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>2. Letakkan titik rumah ({tab === 'denah' ? 'Denah' : 'Peta Jalan'})</div>
              <p className="text-[12px]" style={{ color: '#5b543f' }}>Pilih rumah, lalu ketuk lokasinya di {tab === 'denah' ? 'denah' : 'peta'}. Rumah yang sudah punya titik: ketuk titiknya lalu &quot;Pindahkan titik&quot;.</p>
              {unplaced.length ? (
                <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                  {unplaced.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelected({ kind: 'house', id: h.id })
                        setPlacing({ kind: 'house', id: h.id, view: tab })
                      }}
                      className="rounded-full px-2.5 py-1 text-[12px] font-bold"
                      style={placing?.id === h.id ? { background: '#2563eb', color: '#fff' } : { background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                    >
                      {h.nomor}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[12px] font-bold" style={{ color: '#2f6b4f' }}>Semua rumah sudah punya titik.</p>
              )}
            </div>

            <div>
              <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>3. Tambah fasilitas umum</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <input value={newFacility.name} onChange={(e) => setNewFacility((f) => ({ ...f, name: e.target.value }))} maxLength={60} placeholder="Nama, mis. Pos Security Utama" aria-label="Nama fasilitas" className="w-full rounded-xl px-3 py-2 text-[16px]" style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }} />
                <select value={newFacility.kind} onChange={(e) => setNewFacility((f) => ({ ...f, kind: e.target.value }))} aria-label="Jenis fasilitas" className="rounded-xl px-3 py-2 text-[14px]" style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}>
                  {Object.entries(FACILITY_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={newFacility.name.trim().length < 2}
                  onClick={() => setPlacing({ kind: 'new-facility', id: 'baru', view: tab })}
                  className="rounded-xl px-3 py-2 text-[12.5px] font-bold"
                  style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: newFacility.name.trim().length < 2 ? 0.5 : 1 }}
                >
                  Letakkan
                </button>
              </div>
            </div>

            {tab === 'jalan' ? (
              <div>
                <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>4. Lokasi perumahan di peta jalan</div>
                <p className="text-[12px]" style={{ color: '#5b543f' }}>Geser & perbesar peta sampai perumahan terlihat pas, lalu simpan.</p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const v = viewRef.current ?? center
                    run(() => saveMapCenter(v.lat, v.lng, Math.max(10, Math.min(20, v.zoom))), 'Lokasi perumahan disimpan.')
                  }}
                  className="mt-2 rounded-xl px-4 py-2 text-[12.5px] font-bold"
                  style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
                >
                  Simpan tampilan ini sebagai lokasi perumahan
                </button>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </div>
  )
}