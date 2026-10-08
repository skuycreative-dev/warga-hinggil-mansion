import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import ShiftWeek from '@/components/patroli/ShiftWeek'
import { addDaysIso, loadShifts, onDutyNow } from '@/lib/patrol'
import { rangeLabel, weekFrom } from '@/lib/week'

export const dynamic = 'force-dynamic'

// Jadwal jaga Security untuk semua pengguna (hanya lihat)
export default async function JadwalJagaPage({ searchParams }: { searchParams: Promise<{ minggu?: string }> }) {
  const access = await getMyAccess()
  const { minggu } = await searchParams
  const week = weekFrom(minggu)
  const supabase = await createClient()

  const shifts = await loadShifts(supabase, addDaysIso(week.monday, -1), week.sunday)
  const onDuty = onDutyNow(shifts)

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keamanan Lingkungan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Jadwal Jaga Security
            </h1>
          </div>
          <div className="flex flex-shrink-0 items-center gap-4">
            {access.canPatrol ? <Link href="/keamanan/jadwal-jaga" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Atur</Link> : null}
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        <div className="mb-6 rounded-2xl px-5 py-4" style={{ background: 'var(--brand-theme)' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Sedang jaga sekarang</div>
          {onDuty.length ? (
            onDuty.map((s) => (
              <div key={s.id} className="mt-1 text-[15px] font-bold" style={{ color: 'var(--brand-accent)' }}>
                {s.security_name} <span className="text-[12.5px] font-medium" style={{ color: '#d8cfb8' }}>· {s.post} · {s.start_time}–{s.end_time}</span>
              </div>
            ))
          ) : (
            <div className="mt-1 text-[14px] font-bold" style={{ color: 'var(--brand-accent)' }}>Belum ada jadwal untuk jam ini</div>
          )}
          <Link href="/darurat" className="mt-3 inline-block text-[12.5px] font-bold underline" style={{ color: '#f2b8b0' }}>Butuh bantuan segera? Buka Tombol Darurat</Link>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <Link href={`/jadwal-jaga?minggu=${week.prev}`} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#ffffff', color: '#1f1a10' }}>‹</Link>
          <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{rangeLabel(week.monday, week.sunday)}</span>
          <Link href={`/jadwal-jaga?minggu=${week.next}`} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#ffffff', color: '#1f1a10' }}>›</Link>
        </div>

        <ShiftWeek days={week.days} shifts={shifts.filter((s) => s.shift_date >= week.monday)} today={week.today} onDutyIds={onDuty.map((s) => s.id)} />
      </div>
    </main>
  )
}