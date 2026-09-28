import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { displayName } from '@/lib/display-name'
import AdminLayout from '@/components/admin/AdminLayout'
import AlertActions from '@/components/darurat/AlertActions'
import AlertTimeline from '@/components/darurat/AlertTimeline'
import TeamNotes from '@/components/darurat/TeamNotes'
import LiveTimer from '@/components/darurat/LiveTimer'
import { loadAlerts, loadEvents } from '@/lib/emergency-data'
import { RESOLUTION_LABEL, clock, minutesLabel, typeLabel } from '@/lib/emergency'

export const dynamic = 'force-dynamic'

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const access = await getMyAccess()
  const supabase = await createClient()

  const [alert] = await loadAlerts(supabase, { ids: [id], limit: 1 })
  if (!alert) notFound()

  const events = (await loadEvents(supabase, [id])).get(id) ?? []
  const timeline = events.filter((e) => e.kind !== 'chat' && e.kind !== 'logbook')

  const { data: household } = alert.house_id
    ? await supabase.from('profiles').select('id, full_name, nickname, family_role').eq('house_id', alert.house_id).neq('id', alert.reporter_id).limit(12)
    : { data: [] as any[] }

  const closed = alert.status === 'selesai'
  const shortId = `#${alert.id.slice(0, 8).toUpperCase()}`

  return (
    <AdminLayout portalLabel="Portal Keamanan" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <Link href="/keamanan/darurat" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>‹ Alert Command Center</Link>

      <div className="mb-5 mt-3 rounded-2xl px-5 py-5" style={{ background: closed ? '#1f2b25' : '#2a0f0c' }}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: closed ? '#a8d8c8' : '#f2b8b0' }}>
              Alert {shortId} · {closed ? 'Selesai' : alert.status === 'ditangani' ? 'Sedang ditangani' : 'Menunggu respons'}
            </div>
            <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
              {typeLabel(alert.emergency_type).toUpperCase()}
            </h1>
            <div className="mt-1 text-[12.5px]" style={{ color: '#e8dccd' }}>
              Masuk {clock(alert.created_at, true)}
              {alert.handled_by_name ? ` · Response: ${alert.handled_by_name}` : ''}
              {alert.accepted_at ? ` · diambil dalam ${minutesLabel(new Date(alert.accepted_at).getTime() - new Date(alert.created_at).getTime())}` : ''}
              {alert.escalated_at ? ' · ⬆ dieskalasi' : ''}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#e8dccd' }}>Durasi</div>
            <LiveTimer since={alert.created_at} until={alert.resolved_at} className="font-mono text-[26px] font-bold" style={{ color: '#ffffff' }} />
          </div>
        </div>
        {closed ? (
          <div className="mt-3 rounded-xl px-3.5 py-2.5 text-[13px]" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff' }}>
            <b>{RESOLUTION_LABEL[alert.resolution ?? ''] ?? 'Selesai'}</b>
            {alert.resolved_by_name ? ` · oleh ${alert.resolved_by_name}` : ''}
            {alert.resolved_at ? ` · ${clock(alert.resolved_at, true)}` : ''}
            {alert.resolution_note ? <div className="mt-1" style={{ color: '#e8dccd' }}>{alert.resolution_note}</div> : null}
          </div>
        ) : null}
      </div>

      {!closed ? (
        <div className="mb-5 rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.25)' }}>
          <AlertActions alertId={alert.id} status={alert.status} handledByMe={alert.handled_by === access.userId} handledByName={alert.handled_by_name} escalated={!!alert.escalated_at} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Pelapor</h2>
            <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{alert.reporter_name}</div>
            <div className="text-[12.5px]" style={{ color: '#5b543f' }}>{alert.nomor_rumah ? `Rumah ${alert.nomor_rumah}` : 'Nomor rumah tidak tercatat'}</div>
            {alert.reporter_phone ? (
              <div className="mt-2 flex gap-2">
                <a href={`tel:${alert.reporter_phone.replace(/[^0-9+]/g, '')}`} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>☎ Telepon</a>
                <a href={`https://wa.me/${alert.reporter_phone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#1f7a45', color: '#fff' }}>
                  WhatsApp
                </a>
              </div>
            ) : null}
            {household && household.length > 0 ? (
              <div className="mt-3 text-[12px]" style={{ color: '#5b543f' }}>
                <b>Penghuni lain di rumah:</b> {household.map((h: any) => displayName(h)).join(', ')}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Deskripsi Kejadian</h2>
            <p className="text-[13.5px]" style={{ color: '#3d3727' }}>{alert.message ? `“${alert.message}”` : 'Pelapor tidak menambahkan keterangan.'}</p>
            {events
              .filter((e) => e.kind === 'info_pelapor')
              .map((e) => (
                <p key={e.id} className="mt-2 rounded-lg px-3 py-2 text-[13px]" style={{ background: '#faf7f0', color: '#3d3727' }}>
                  <b>Info tambahan {clock(e.created_at)}:</b> {e.body}
                </p>
              ))}
          </section>

          <Link href={`/keamanan/darurat/${alert.id}/laporan`} className="rounded-xl py-3 text-center text-[13px] font-bold" style={{ background: '#ffffff', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.15)' }}>
            {'\u{1F5A8}'} Cetak / Simpan PDF Laporan Insiden
          </Link>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3">
          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Response Log</h2>
            <AlertTimeline events={timeline} />
          </section>
          <TeamNotes alertId={alert.id} events={events} closed={closed} />
        </div>
      </div>
    </AdminLayout>
  )
}