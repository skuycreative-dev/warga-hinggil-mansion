import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import PrintButton from '@/components/PrintButton'
import { loadAlerts, loadEvents } from '@/lib/emergency-data'
import { EVENT_LABEL, RESOLUTION_LABEL, formatDuration, minutesLabel, typeLabel } from '@/lib/emergency'

export const dynamic = 'force-dynamic'

function full(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Laporan insiden untuk arsip Paguyuban (cetak / simpan PDF dari browser)
export default async function IncidentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const access = await getMyAccess()
  const supabase = await createClient()
  const [alert] = await loadAlerts(supabase, { ids: [id], limit: 1 })
  if (!alert) notFound()

  const events = (await loadEvents(supabase, [id])).get(id) ?? []
  const logbook = events.filter((e) => e.kind === 'logbook')
  const timeline = events.filter((e) => e.kind !== 'chat' && e.kind !== 'logbook')
  const chat = events.filter((e) => e.kind === 'chat')

  const row = (label: string, value: string) => (
    <tr>
      <td className="w-44 py-1 pr-3 align-top font-bold" style={{ color: '#5b543f' }}>{label}</td>
      <td className="py-1 align-top" style={{ color: '#1f1a10' }}>{value}</td>
    </tr>
  )

  return (
    <main className="min-h-screen w-full bg-white print:min-h-0">
      <div className="mx-auto w-full max-w-3xl px-6 py-8 text-[13px] print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Link href={`/keamanan/darurat/${id}`} className="text-sm font-bold" style={{ color: '#9c7a3f' }}>‹ Kembali ke detail alert</Link>
          <PrintButton />
        </div>

        <header className="mb-5 border-b-2 pb-3" style={{ borderColor: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Warga Hinggil Mansion · Laporan Insiden</div>
          <h1 className="mt-1 text-[22px] font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
            {typeLabel(alert.emergency_type)} — #{alert.id.slice(0, 8).toUpperCase()}
          </h1>
          <div className="text-[11.5px]" style={{ color: '#5b543f' }}>
            Dicetak {full(new Date().toISOString())} oleh {access.fullName} ({access.roleLabel})
          </div>
        </header>

        <table className="mb-5 w-full border-collapse">
          <tbody>
            {row('Status', alert.status === 'selesai' ? RESOLUTION_LABEL[alert.resolution ?? ''] ?? 'Selesai' : 'Masih aktif')}
            {row('Pelapor', `${alert.reporter_name}${alert.nomor_rumah ? ` · Rumah ${alert.nomor_rumah}` : ''}${alert.reporter_phone ? ` · ${alert.reporter_phone}` : ''}`)}
            {row('Alert masuk', full(alert.created_at))}
            {row('Diambil petugas', `${full(alert.accepted_at)}${alert.accepted_at ? ` (${minutesLabel(new Date(alert.accepted_at).getTime() - new Date(alert.created_at).getTime())})` : ''}`)}
            {row('Penanggung jawab', alert.handled_by_name ?? '-')}
            {row('Eskalasi', alert.escalated_at ? full(alert.escalated_at) : 'Tidak')}
            {row('Selesai', `${full(alert.resolved_at)}${alert.resolved_by_name ? ` · oleh ${alert.resolved_by_name}` : ''}`)}
            {row('Durasi total', alert.resolved_at ? formatDuration(new Date(alert.resolved_at).getTime() - new Date(alert.created_at).getTime()) : '-')}
            {row('Deskripsi pelapor', alert.message ?? '-')}
            {row('Ringkasan penanganan', alert.resolution_note ?? '-')}
          </tbody>
        </table>

        <h2 className="mb-2 mt-6 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Logbook Petugas ({logbook.length})</h2>
        {logbook.length === 0 ? (
          <p style={{ color: '#5b543f' }}>Tidak ada catatan logbook.</p>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {logbook.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #e9e2d2' }}>
                  <td className="w-40 py-1.5 pr-3 align-top" style={{ color: '#5b543f' }}>{full(e.created_at)}</td>
                  <td className="w-32 py-1.5 pr-3 align-top font-bold">{e.actor_name ?? '-'}</td>
                  <td className="whitespace-pre-line py-1.5 align-top">{e.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className="mb-2 mt-6 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Kronologi Respons</h2>
        <table className="w-full border-collapse">
          <tbody>
            {timeline.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #e9e2d2' }}>
                <td className="w-40 py-1.5 pr-3 align-top" style={{ color: '#5b543f' }}>{full(e.created_at)}</td>
                <td className="w-44 py-1.5 pr-3 align-top font-bold">{EVENT_LABEL[e.kind] ?? e.kind}</td>
                <td className="whitespace-pre-line py-1.5 align-top">
                  {e.actor_name ? `${e.actor_name}: ` : ''}
                  {e.body ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {chat.length ? (
          <>
            <h2 className="mb-2 mt-6 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Chat Internal Tim ({chat.length})</h2>
            <table className="w-full border-collapse">
              <tbody>
                {chat.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #e9e2d2' }}>
                    <td className="w-40 py-1.5 pr-3 align-top" style={{ color: '#5b543f' }}>{full(e.created_at)}</td>
                    <td className="w-32 py-1.5 pr-3 align-top font-bold">{e.actor_name ?? '-'}</td>
                    <td className="whitespace-pre-line py-1.5 align-top">{e.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}

        <div className="mt-12 grid grid-cols-2 gap-10 text-center text-[12px]" style={{ color: '#5b543f' }}>
          <div>
            Petugas Security
            <div className="mt-16 border-t pt-1" style={{ borderColor: '#1f1a10' }}>{alert.handled_by_name ?? '(nama & tanda tangan)'}</div>
          </div>
          <div>
            Mengetahui, Ketua Paguyuban
            <div className="mt-16 border-t pt-1" style={{ borderColor: '#1f1a10' }}>(nama & tanda tangan)</div>
          </div>
        </div>
        <p className="mt-8 text-[10.5px]" style={{ color: '#9c7a3f' }}>Dokumen internal. Catatan log respons tersimpan permanen dan tidak dapat diubah.</p>
      </div>
    </main>
  )
}