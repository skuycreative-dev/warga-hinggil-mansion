import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { todayWib } from '@/lib/format'
import { billOutstanding } from '@/lib/ipl'
import PetaPerumahan from '@/components/peta/PetaPerumahan'
import type { MapData, MapHouse } from '@/lib/map-types'

export const dynamic = 'force-dynamic'

const STAFF = ['security', 'paguyuban', 'staff_paguyuban', 'manajemen', 'superadmin']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PetaPage({ searchParams }: { searchParams: Promise<{ rumah?: string }> }) {
  const sp = await searchParams
  const access = await getMyAccess()
  const supabase = await createClient()
  const staffView = STAFF.includes(access.role)
  const iplView = staffView && access.role !== 'security'
  const canEdit = access.isSuperadmin || access.isKetuaPaguyuban || access.isSekretaris
  const today = todayWib()
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

  const [{ data: plan }, { data: houses }, { data: facilities }, { data: me }] = await Promise.all([
    supabase.from('site_plan').select('image_path, image_width, image_height, center_lat, center_lng, zoom').eq('id', 1).maybeSingle(),
    supabase.from('houses').select(staffView ? 'id, nomor_rumah, map_x, map_y, lat, lng, occupancy_status' : 'id, nomor_rumah, map_x, map_y, lat, lng').limit(3000),
    supabase.from('map_facilities').select('id, name, kind, map_x, map_y, lat, lng').limit(200),
    supabase.from('profiles').select('house_id').eq('id', access.userId).maybeSingle(),
  ])

  // Lapisan status hanya untuk Security & Pengurus (warga hanya melihat nomor rumah & fasilitas)
  const [{ data: alerts }, { data: absences }, { data: bills }] = staffView
    ? await Promise.all([
        supabase.from('emergency_alerts').select('id, house_id, emergency_type, status').in('status', ['aktif', 'ditangani']).gte('created_at', since).limit(50),
        supabase.from('house_absences').select('house_id, end_date').eq('status', 'aktif').gte('end_date', today).limit(1000),
        iplView
          ? supabase.from('iuran_payment_status').select('house_id, amount_due, late_fee, amount_paid, status, due_date').neq('status', 'lunas').lte('due_date', today).limit(10000)
          : Promise.resolve({ data: [] as any[] }),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }, { data: [] as any[] }]

  const alertMap = new Map<string, any>()
  for (const a of alerts ?? []) if (a.house_id && !alertMap.has(a.house_id)) alertMap.set(a.house_id, a)
  const absenceMap = new Map<string, string>()
  for (const a of absences ?? []) absenceMap.set(a.house_id, a.end_date)
  const dueMap = new Map<string, number>()
  for (const b of bills ?? []) dueMap.set(b.house_id, (dueMap.get(b.house_id) ?? 0) + billOutstanding(b))

  const myHouse = (me?.house_id as string | null) ?? null
  const list: MapHouse[] = ((houses ?? []) as any[]).map((h) => {
    const a = alertMap.get(h.id)
    return {
      id: h.id,
      nomor: h.nomor_rumah,
      x: h.map_x === null ? null : Number(h.map_x),
      y: h.map_y === null ? null : Number(h.map_y),
      lat: h.lat === null ? null : Number(h.lat),
      lng: h.lng === null ? null : Number(h.lng),
      occupancy: staffView ? h.occupancy_status ?? null : null,
      emergency: a ? { id: a.id, type: a.emergency_type, status: a.status } : null,
      absence: absenceMap.has(h.id) ? { until: absenceMap.get(h.id)! } : null,
      iplDue: dueMap.get(h.id) ?? 0,
      mine: h.id === myHouse,
    }
  })

  let planUrl: string | null = null
  if (plan?.image_path) {
    const { data: signed } = await supabase.storage.from('siteplan').createSignedUrl(plan.image_path as string, 60 * 60)
    planUrl = signed?.signedUrl ?? null
  }

  const data: MapData = {
    houses: list,
    facilities: ((facilities ?? []) as any[]).map((f) => ({
      id: f.id,
      name: f.name,
      kind: f.kind,
      x: f.map_x === null ? null : Number(f.map_x),
      y: f.map_y === null ? null : Number(f.map_y),
      lat: f.lat === null ? null : Number(f.lat),
      lng: f.lng === null ? null : Number(f.lng),
    })),
    plan: { url: planUrl, width: (plan?.image_width as number) ?? null, height: (plan?.image_height as number) ?? null },
    center: plan?.center_lat != null && plan?.center_lng != null ? { lat: Number(plan.center_lat), lng: Number(plan.center_lng), zoom: Number(plan.zoom ?? 17) } : null,
    staffView,
    iplView,
    canEdit,
    focusHouseId: sp.rumah && UUID.test(sp.rumah) ? sp.rumah : null,
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{staffView ? access.roleLabel : 'Lingkungan'}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Peta Perumahan
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              {staffView ? 'Status rumah diperbarui otomatis: darurat, rumah kosong, tunggakan IPL, dan status hunian.' : 'Denah perumahan, nomor rumah, dan fasilitas umum.'}
            </p>
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>
        <PetaPerumahan data={data} />
      </div>
    </main>
  )
}