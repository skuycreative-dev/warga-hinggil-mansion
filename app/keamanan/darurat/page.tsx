import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AlertActions from '@/components/darurat/AlertActions'
import LiveTimer from '@/components/darurat/LiveTimer'
import { loadAlerts } from '@/lib/emergency-data'
import { RESOLUTION_LABEL, clock, minutesLabel, typeLabel } from '@/lib/emergency'

export const dynamic = 'force-dynamic'

export default async function AlertCommandCenterPage() {
  const access = await getMyAccess()
  const supabase = await createClient()

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const [open, recent] = await Promise.all([loadAlerts(supabase, { openOnly: true, limit: 50 }), loadAlerts(supabase, { sinceIso: since30, limit: 300 })])

  const closed = recent.filter((a) => a.status === 'selesai')
  const responseTimes = recent.filter((a) => a.accepted_at).map((a) => new Date(a.accepted_at!).getTime() - new Date(a.created_at).getTime())
  const avgResponse = responseTimes.length ? responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length : null
  const falseAlarm = closed.filter((a) => a.resolution === 'alarm_palsu').length
  const waiting = open.filter((a) => a.status === 'aktif').length

  return (
    <AdminLayout portalLabel="Portal Keamanan" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Alert Command Center</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Alert Darurat
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          {open.length} alert aktif · {waiting} menunggu diambil. Halaman ini ter-update otomatis.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Alert Aktif" value={open.length} badge={waiting ? 'BUTUH RESPONS' : undefined} caption={`${waiting} belum diambil`} iconBg="#f2b8b0" iconPath="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <StatCard label="Alert 30 Hari" value={recent.length} caption={`${closed.length} selesai`} iconBg="#a8c8f0" iconPath="M3 3v18h18M7 14l4-4 4 4 5-5" />
        <StatCard label="Rata-rata Respons" value={minutesLabel(avgResponse)} caption="Alert masuk → diambil" iconBg="#a8d8c8" iconPath="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <StatCard label="Alarm Palsu" value={falseAlarm} caption="30 hari terakhir" iconBg="#e6c98a" iconPath="M18 6 6 18M6 6l12 12" />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Alert Aktif ({open.length})</div>
      {open.length === 0 ? (
        <div className="mb-8 rounded-2xl px-5 py-8 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[15px] font-bold" style={{ color: '#2f6b4f' }}>✓ Aman terkendali</div>
          <p className="mt-1 text-[12.5px]" style={{ color: '#5b543f' }}>Tidak ada alert darurat aktif.</p>
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {open.map((a) => (
            <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: `2px solid ${a.status === 'aktif' ? '#b3392f' : 'rgba(47,107,79,0.45)'}` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white" style={{ background: '#b3392f' }}>
                    {typeLabel(a.emergency_type)}
                  </span>
                  {a.escalated_at ? (
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: 'rgba(179,57,47,0.12)', color: '#b3392f' }}>⬆ ESKALASI</span>
                  ) : null}
                </div>
                <LiveTimer since={a.created_at} className="font-mono text-[18px] font-bold" style={{ color: a.status === 'aktif' ? '#b3392f' : '#2f6b4f' }} />
              </div>
              <div className="mt-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>
                {a.reporter_name}
                {a.nomor_rumah ? ` · Rumah ${a.nomor_rumah}` : ''}
              </div>
              {a.message ? <p className="mt-0.5 text-[13px] italic" style={{ color: '#3d3727' }}>“{a.message}”</p> : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: '#5b543f' }}>
                <span>Masuk {clock(a.created_at)}</span>
                {a.reporter_phone ? (
                  <a href={`tel:${a.reporter_phone.replace(/[^0-9+]/g, '')}`} className="font-bold" style={{ color: '#3b5b8a' }}>
                    ☎ {a.reporter_phone}
                  </a>
                ) : null}
                <span style={{ color: a.status === 'aktif' ? '#b3392f' : '#2f6b4f', fontWeight: 700 }}>
                  {a.status === 'aktif' ? 'Belum ada yang mengambil' : `→ ${a.handled_by_name ?? 'Petugas'} menangani`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <AlertActions alertId={a.id} status={a.status} handledByMe={a.handled_by === access.userId} handledByName={a.handled_by_name} escalated={!!a.escalated_at} compact />
                <Link href={`/keamanan/darurat/${a.id}`} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
                  Detail & Response Log →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Riwayat 30 Hari</div>
      {closed.length === 0 ? (
        <p className="text-[13px]" style={{ color: '#5b543f' }}>Belum ada alert yang selesai.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                {['Waktu', 'Jenis', 'Pelapor', 'Respons', 'Hasil', ''].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 font-bold" style={{ color: '#9c7a3f' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {closed.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.05)' }}>
                  <td className="whitespace-nowrap px-4 py-2.5" style={{ color: '#5b543f' }}>{clock(a.created_at, true)}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: '#1f1a10' }}>{typeLabel(a.emergency_type)}</td>
                  <td className="px-4 py-2.5" style={{ color: '#3d3727' }}>
                    {a.reporter_name}
                    {a.nomor_rumah ? ` · ${a.nomor_rumah}` : ''}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5" style={{ color: '#5b543f' }}>
                    {a.accepted_at ? minutesLabel(new Date(a.accepted_at).getTime() - new Date(a.created_at).getTime()) : '-'}
                    {a.handled_by_name ? ` · ${a.handled_by_name}` : ''}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: a.resolution === 'alarm_palsu' ? '#7a5a1f' : '#2f6b4f' }}>{RESOLUTION_LABEL[a.resolution ?? ''] ?? 'Selesai'}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right">
                    <Link href={`/keamanan/darurat/${a.id}`} className="font-bold" style={{ color: '#9c7a3f' }}>Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}