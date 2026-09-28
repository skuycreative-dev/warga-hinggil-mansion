import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AbsenceCard from '@/components/patroli/AbsenceCard'
import { addDaysIso, checkedToday, daysBetween, durationTone, loadPatrolAbsences, loadSecurityPeople, loadShifts, onDutyNow, todayWib } from '@/lib/patrol'

export const dynamic = 'force-dynamic'

export default async function RumahKosongDashboardPage() {
  const access = await getMyAccess()
  const supabase = await createClient()
  const today = todayWib()

  // Data sensitif: setiap kali dibuka dicatat (bisa dilihat Superadmin)
  await supabase.from('sensitive_access_logs').insert({ user_id: access.userId, page: 'rumah-kosong', detail: 'Membuka daftar rumah kosong' })

  const monthStart = `${today.slice(0, 7)}-01`
  const [absences, security, shifts, { count: suspicious }] = await Promise.all([
    loadPatrolAbsences(supabase),
    loadSecurityPeople(supabase),
    loadShifts(supabase, addDaysIso(today, -1), today),
    supabase.from('patrol_checks').select('id', { count: 'exact', head: true }).eq('result', 'mencurigakan').gte('checked_at', `${monthStart}T00:00:00+07:00`),
  ])

  const active = absences.filter((a) => a.start_date <= today)
  const upcoming = absences.filter((a) => a.start_date > today)
  const endingSoon = active.filter((a) => daysBetween(today, a.end_date) <= 6)
  const targetToday = active.reduce((s, a) => s + a.per_day, 0)
  const doneToday = active.reduce((s, a) => s + Math.min(checkedToday(a.checks, today), a.per_day), 0)
  const onDuty = onDutyNow(shifts)

  return (
    <AdminLayout portalLabel="Portal Keamanan" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Data sensitif · Rahasiakan</span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
            Rumah Kosong
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
            {active.length} rumah sedang kosong · {upcoming.length} akan kosong. Penghuni dapat notifikasi setiap patroli dicatat.
          </p>
        </div>
        <Link href="/keamanan/rumah-kosong/cetak" className="rounded-lg px-4 py-2 text-[13px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
          {'\u{1F5A8}'} Cetak Jadwal Patroli
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Kosong Sekarang" value={active.length} caption={`${upcoming.length} akan kosong`} iconBg="#e6c98a" iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
        <StatCard label="Patroli Hari Ini" value={`${doneToday}/${targetToday}`} badge={doneToday < targetToday ? 'BELUM LENGKAP' : undefined} caption="Tercatat / target" iconBg="#a8d8c8" iconPath="m9 12 2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <StatCard label="Berakhir Minggu Ini" value={endingSoon.length} caption={endingSoon.map((a) => a.nomor_rumah).join(', ') || '-'} iconBg="#a8c8f0" iconPath="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <StatCard label="Mencurigakan" value={suspicious ?? 0} caption="Bulan ini" iconBg="#f2b8b0" iconPath="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </div>

      <div className="mb-6 rounded-2xl px-4 py-3 text-[12.5px]" style={{ background: '#1a1305', color: '#e6c98a' }}>
        <b>Sedang jaga:</b> {onDuty.length ? onDuty.map((s) => `${s.security_name} (${s.post}, ${s.start_time}–${s.end_time})`).join(' · ') : 'belum ada jadwal jaga untuk jam ini'}
        {' · '}
        <Link href="/keamanan/jadwal-jaga" className="underline">Atur jadwal jaga</Link>
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Sedang Kosong ({active.length})</div>
      {active.length === 0 ? (
        <div className="mb-8 rounded-2xl px-5 py-8 text-center text-sm" style={{ background: '#ffffff', color: '#5b543f' }}>Tidak ada rumah yang sedang kosong.</div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {active
            .map((a) => ({ a, days: daysBetween(a.start_date, today) }))
            .sort((x, y) => y.days - x.days)
            .map(({ a, days }) => (
              <AbsenceCard
                key={a.id}
                absence={a}
                security={security}
                myId={access.userId}
                daysEmpty={days}
                totalDays={daysBetween(a.start_date, a.end_date) + 1}
                tone={durationTone(days + 1)}
                doneToday={checkedToday(a.checks, today)}
                upcoming={false}
              />
            ))}
        </div>
      )}

      {upcoming.length ? (
        <>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Akan Kosong ({upcoming.length})</div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {upcoming.map((a) => (
              <AbsenceCard
                key={a.id}
                absence={a}
                security={security}
                myId={access.userId}
                daysEmpty={0}
                totalDays={daysBetween(a.start_date, a.end_date) + 1}
                tone={durationTone(0)}
                doneToday={0}
                upcoming
              />
            ))}
          </div>
        </>
      ) : null}

      <p className="mt-8 text-center text-[11.5px]" style={{ color: '#9c7a3f' }}>
        Info sensitif. Jangan dibagikan ke pihak lain. Setiap akses ke halaman ini dicatat dan dapat diaudit Superadmin.
      </p>
    </AdminLayout>
  )
}