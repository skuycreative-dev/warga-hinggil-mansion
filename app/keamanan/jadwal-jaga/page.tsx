import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import ShiftManager from '@/components/patroli/ShiftManager'
import { addDaysIso, loadSecurityPeople, loadShifts, onDutyNow } from '@/lib/patrol'
import { rangeLabel, weekFrom } from '@/lib/week'

export const dynamic = 'force-dynamic'

export default async function JadwalJagaKelolaPage({ searchParams }: { searchParams: Promise<{ minggu?: string }> }) {
  const access = await getMyAccess()
  const { minggu } = await searchParams
  const week = weekFrom(minggu)
  const supabase = await createClient()

  const [security, shifts] = await Promise.all([loadSecurityPeople(supabase), loadShifts(supabase, addDaysIso(week.monday, -1), week.sunday)])
  const onDuty = onDutyNow(shifts)
  const weekShifts = shifts.filter((s) => s.shift_date >= week.monday)

  return (
    <AdminLayout portalLabel="Portal Keamanan" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Security</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Jadwal Jaga
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Diatur Security & Pengurus. Warga hanya melihat jadwal (nama petugas, jam, pos) di menu Jadwal Jaga.
        </p>
      </div>

      <div className="mb-5 rounded-2xl px-4 py-3 text-[13px]" style={{ background: '#1a1305', color: '#e6c98a' }}>
        <b>Sedang jaga sekarang:</b> {onDuty.length ? onDuty.map((s) => `${s.security_name} (${s.post}, ${s.start_time}–${s.end_time})`).join(' · ') : 'belum ada'}
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href={`/keamanan/jadwal-jaga?minggu=${week.prev}`} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#ffffff', color: '#1f1a10' }}>‹ Minggu lalu</Link>
        <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{rangeLabel(week.monday, week.sunday)}</span>
        <Link href={`/keamanan/jadwal-jaga?minggu=${week.next}`} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold" style={{ background: '#ffffff', color: '#1f1a10' }}>Minggu depan ›</Link>
      </div>

      <ShiftManager days={week.days} shifts={weekShifts} security={security} today={week.today} weekStart={week.monday} onDutyIds={onDuty.map((s) => s.id)} />
    </AdminLayout>
  )
}