import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import PrintButton from '@/components/PrintButton'
import { addDaysIso, daysBetween, loadPatrolAbsences, loadSecurityPeople, loadShifts, todayWib } from '@/lib/patrol'

export const dynamic = 'force-dynamic'

function dateLong(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Jadwal patroli untuk serah terima shift (cetak / simpan PDF)
export default async function PatrolPrintPage() {
  const access = await getMyAccess()
  const supabase = await createClient()
  const today = todayWib()

  await supabase.from('sensitive_access_logs').insert({ user_id: access.userId, page: 'rumah-kosong-cetak', detail: 'Mencetak jadwal patroli' })

  const [absences, security, shifts] = await Promise.all([loadPatrolAbsences(supabase), loadSecurityPeople(supabase), loadShifts(supabase, today, addDaysIso(today, 1))])
  const active = absences.filter((a) => a.start_date <= today)
  const nameOf = (id: string) => security.find((s) => s.id === id)?.name ?? 'Petugas'
  const todayShifts = shifts.filter((s) => s.shift_date === today)

  return (
    <main className="min-h-screen w-full bg-white print:min-h-0">
      <div className="mx-auto w-full max-w-4xl px-6 py-8 text-[12.5px] print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Link href="/keamanan/rumah-kosong" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>‹ Kembali</Link>
          <PrintButton />
        </div>

        <header className="mb-4 border-b-2 pb-2" style={{ borderColor: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Warga Hinggil Mansion · Rahasia</div>
          <h1 className="text-[20px] font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>Jadwal Patroli Rumah Kosong</h1>
          <div style={{ color: '#5b543f' }}>
            {dateLong(today)} · dicetak oleh {access.fullName}
          </div>
        </header>

        <h2 className="mb-1 font-bold" style={{ color: '#1f1a10' }}>Petugas jaga hari ini</h2>
        <p className="mb-4" style={{ color: '#3d3727' }}>
          {todayShifts.length ? todayShifts.map((s) => `${s.security_name} — ${s.post} ${s.start_time}–${s.end_time}`).join(' · ') : 'Belum ada jadwal jaga.'}
        </p>

        <table className="w-full border-collapse" style={{ border: '1px solid #1f1a10' }}>
          <thead>
            <tr style={{ background: '#f1ece0' }}>
              {['Rumah / Penghuni', 'Periode', 'Kontak darurat', 'Catatan', 'Target & petugas', 'Jam cek & paraf'].map((h) => (
                <th key={h} className="px-2 py-1.5 text-left font-bold" style={{ border: '1px solid #1f1a10' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-3 text-center" style={{ border: '1px solid #1f1a10' }}>Tidak ada rumah kosong hari ini.</td>
              </tr>
            ) : (
              active.map((a) => (
                <tr key={a.id} className="align-top" style={{ breakInside: 'avoid' }}>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10' }}>
                    <b>{a.nomor_rumah}</b>
                    <div>{a.owner_name}</div>
                  </td>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10' }}>
                    {a.start_date.slice(8)}/{a.start_date.slice(5, 7)} – {a.end_date.slice(8)}/{a.end_date.slice(5, 7)}
                    <div>Hari ke-{daysBetween(a.start_date, today) + 1} dari {daysBetween(a.start_date, a.end_date) + 1}</div>
                  </td>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10' }}>
                    {a.contact_phone ?? '-'}
                    {a.owner_phone ? <div>Penghuni: {a.owner_phone}</div> : null}
                  </td>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10' }}>
                    {a.note ?? '-'}
                    {a.internal_note ? <div className="italic">Tim: {a.internal_note}</div> : null}
                  </td>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10' }}>
                    {a.per_day}x/hari
                    <div>{a.assignees.length ? a.assignees.map(nameOf).join(', ') : 'Semua Security'}</div>
                  </td>
                  <td className="px-2 py-1.5" style={{ border: '1px solid #1f1a10', minWidth: 150 }}>
                    {Array.from({ length: a.per_day }).map((_, i) => (
                      <div key={i} className="py-1">{i + 1}. ____:____ paraf ______</div>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <p className="mt-4 text-[10.5px]" style={{ color: '#9c7a3f' }}>
          Dokumen rahasia untuk serah terima shift Security. Jangan difoto/dibagikan. Setelah dipakai, simpan di pos atau musnahkan.
        </p>
      </div>
    </main>
  )
}