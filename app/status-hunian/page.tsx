import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { displayName } from '@/lib/display-name'
import OccupancyEditor from '@/components/hunian/OccupancyEditor'
import HouseTable, { type HouseRow } from '@/components/hunian/HouseTable'
import { occupancyInfo } from '@/lib/hunian'
import { sortHouse } from '@/lib/ipl'

export const dynamic = 'force-dynamic'

export default async function StatusHunianPage() {
  const access = await getMyAccess()
  const supabase = await createClient()
  const canSeeAll = access.isServiceStaff || ['manajemen', 'staff_paguyuban'].includes(access.role)

  const { data: me } = await supabase.from('profiles').select('house_id, is_house_owner, account_status').eq('id', access.userId).maybeSingle()
  const myHouseId = (me?.house_id as string) ?? null

  const [{ data: myHouse }, { data: residents }, { data: history }, { data: pendingRequest }] = await Promise.all([
    myHouseId ? supabase.from('houses').select('id, nomor_rumah, occupancy_status').eq('id', myHouseId).maybeSingle() : Promise.resolve({ data: null as any }),
    myHouseId
      ? supabase.from('profiles').select('id, full_name, nickname, family_role, is_house_owner').eq('house_id', myHouseId).eq('account_status', 'aktif')
      : Promise.resolve({ data: [] as any[] }),
    myHouseId
      ? supabase.from('house_occupancy_history').select('id, old_status, new_status, note, changed_by, created_at').eq('house_id', myHouseId).order('created_at', { ascending: false }).limit(20)
      : Promise.resolve({ data: [] as any[] }),
    myHouseId
      ? supabase.from('house_occupancy_requests').select('id, new_status, note, requested_by, created_at').eq('house_id', myHouseId).eq('status', 'menunggu').maybeSingle()
      : Promise.resolve({ data: null as any }),
  ])

  const changerIds = Array.from(new Set((history ?? []).map((h: any) => h.changed_by).filter(Boolean) as string[]))
  const { data: changers } = changerIds.length ? await supabase.from('profiles').select('id, full_name, nickname').in('id', changerIds) : { data: [] as any[] }
  const changerName = new Map((changers ?? []).map((p: any) => [p.id as string, displayName(p)]))
  const owners = (residents ?? []).filter((r: any) => r.is_house_owner)
  const isOwner = !!me?.is_house_owner && me?.account_status === 'aktif'
  const isActiveResident = (residents ?? []).some((r: any) => r.id === access.userId)
  const requesterName = pendingRequest ? changerName.get(pendingRequest.requested_by) ?? (residents ?? []).find((r: any) => r.id === pendingRequest.requested_by)?.full_name ?? 'Penghuni' : null

  // Pengurus: semua rumah
  let houses: HouseRow[] = []
  if (canSeeAll) {
    const [{ data: allHouses }, { data: allPeople }, { data: lastChanges }] = await Promise.all([
      supabase.from('houses').select('id, nomor_rumah, occupancy_status').limit(3000),
      supabase.from('profiles').select('id, full_name, nickname, family_role, is_house_owner, house_id').eq('role', 'warga').eq('account_status', 'aktif').not('house_id', 'is', null).limit(10000),
      supabase.from('house_occupancy_history').select('house_id, created_at').order('created_at', { ascending: false }).limit(3000),
    ])
    const lastMap = new Map<string, string>()
    ;(lastChanges ?? []).forEach((c: any) => {
      if (!lastMap.has(c.house_id)) lastMap.set(c.house_id, c.created_at)
    })
    houses = (allHouses ?? [])
      .map((h: any) => {
        const people = (allPeople ?? []).filter((p: any) => p.house_id === h.id)
        return {
          id: h.id,
          nomor_rumah: h.nomor_rumah,
          status: h.occupancy_status ?? 'kosong',
          owner_id: (people.find((p: any) => p.is_house_owner)?.id as string) ?? null,
          residents: people.map((p: any) => ({ id: p.id, name: displayName(p), family_role: p.family_role })),
          last_change: lastMap.get(h.id) ?? null,
        }
      })
      .sort((a, b) => sortHouse(a.nomor_rumah, b.nomor_rumah))
  }

  const info = occupancyInfo(myHouse?.occupancy_status)

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Data Rumah</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Status Hunian
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Status dicatat per rumah. Pemilik rumah bisa mengubah langsung; penghuni lain bisa mengajukan, menunggu disetujui Pengurus. Setiap perubahan tersimpan di riwayat.
            </p>
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {myHouse ? (
          <section className="mb-8 flex flex-col gap-4">
            <div className="rounded-2xl px-5 py-5" style={{ background: '#1a1305' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah {myHouse.nomor_rumah}</div>
              <div className="mt-1 text-[22px] font-bold" style={{ color: 'var(--brand-accent)', fontFamily: 'var(--font-fraunces), serif' }}>{info.label}</div>
              <div className="mt-1 text-[12.5px]" style={{ color: '#d8cfb8' }}>
                Pemilik: {owners.length ? owners.map((o: any) => displayName(o)).join(', ') : 'belum ditetapkan Pengurus'}
              </div>
            </div>

            {isOwner ? (
              <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
                <div className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Ubah status rumahmu</div>
                <OccupancyEditor current={myHouse.occupancy_status ?? 'kosong'} />
              </div>
            ) : isActiveResident && pendingRequest ? (
              <div className="rounded-2xl px-5 py-4 text-[12.5px]" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)', color: '#5b543f' }}>
                <b style={{ color: '#1f1a10' }}>Ada pengajuan menunggu persetujuan:</b> {occupancyInfo(pendingRequest.new_status).label}
                {pendingRequest.note ? ` · ${pendingRequest.note}` : ''} -- diajukan {requesterName} pada{' '}
                {new Date(pendingRequest.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}. Menunggu disetujui Admin Paguyuban/Sekretaris Paguyuban.
              </div>
            ) : isActiveResident ? (
              <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
                <div className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Ajukan perubahan status rumahmu</div>
                <p className="mb-3 text-[12px]" style={{ color: '#5b543f' }}>
                  Kamu bukan pemilik rumah ini, jadi perubahan akan menunggu disetujui Admin Paguyuban atau Sekretaris Paguyuban dulu.
                </p>
                <OccupancyEditor current={myHouse.occupancy_status ?? 'kosong'} mode="request" />
              </div>
            ) : (
              <p className="rounded-2xl px-5 py-4 text-[12.5px]" style={{ background: '#ffffff', color: '#5b543f' }}>
                Hanya pemilik rumah yang bisa mengubah status hunian. {owners.length ? `Hubungi ${owners.map((o: any) => displayName(o)).join(', ')}.` : 'Pemilik rumah ini belum ditetapkan; minta Ketua / Sekretaris Paguyuban menetapkannya di menu Status Hunian.'}
              </p>
            )}

            <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
              <div className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Riwayat Perubahan</div>
              {(history ?? []).length === 0 ? <p className="text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada perubahan.</p> : null}
              {(history ?? []).map((h: any) => (
                <div key={h.id} className="py-2 text-[12.5px]" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                  <b style={{ color: '#1f1a10' }}>
                    {occupancyInfo(h.old_status).label} → {occupancyInfo(h.new_status).label}
                  </b>
                  <div style={{ color: '#5b543f' }}>
                    {new Date(h.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {h.changed_by ? ` · ${changerName.get(h.changed_by) ?? 'Pengguna'}` : ''}
                    {h.note ? ` · ${h.note}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {canSeeAll ? (
          <section>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Semua Rumah ({houses.length})</div>
            <HouseTable houses={houses} canEdit={access.isServiceStaff} />
          </section>
        ) : null}

        {!myHouse && !canSeeAll ? (
          <p className="rounded-2xl px-5 py-6 text-center text-sm" style={{ background: '#ffffff', color: '#5b543f' }}>Akunmu belum terhubung ke rumah.</p>
        ) : null}
      </div>
    </main>
  )
}