import { privateFields } from '@/lib/private-fields'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'

type Supa = Awaited<ReturnType<typeof createClient>>

export type PatrolAbsence = {
  id: string
  house_id: string
  nomor_rumah: string
  start_date: string
  end_date: string
  note: string | null
  contact_phone: string | null
  owner_name: string
  owner_phone: string | null
  per_day: number
  assignees: string[]
  internal_note: string | null
  checks: { id: string; checked_at: string; result: string; note: string | null; checked_by: string; checker_name: string }[]
}

export type SecurityPerson = { id: string; name: string }

export type Shift = {
  id: string
  shift_date: string
  start_time: string
  end_time: string
  security_id: string
  security_name: string
  post: string
  note: string | null
}

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

export function todayWib() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export function addDaysIso(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function daysBetween(a: string, b: string) {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
}

// Wireframe: makin lama makin merah (2 hari kuning, 5 hari amber, 7+ merah)
export function durationTone(days: number) {
  if (days >= 7) return { bg: 'rgba(179,57,47,0.12)', color: '#b3392f', label: 'merah' }
  if (days >= 5) return { bg: 'rgba(214,122,40,0.15)', color: '#a3521a', label: 'amber' }
  if (days >= 2) return { bg: 'rgba(212,175,106,0.25)', color: '#7a5a1f', label: 'kuning' }
  return { bg: '#faf7f0', color: '#5b543f', label: 'biasa' }
}

export async function loadSecurityPeople(supabase: Supa): Promise<SecurityPerson[]> {
  const { data } = await supabase.from('profiles').select('id, full_name, nickname').eq('role', 'security').order('full_name')
  return (data ?? []).map((p: any) => ({ id: p.id as string, name: displayName(p) }))
}

export async function loadShifts(supabase: Supa, from: string, to: string): Promise<Shift[]> {
  const { data } = await supabase
    .from('security_shifts')
    .select('id, shift_date, start_time, end_time, security_id, post, note, security:profiles!security_shifts_security_id_fkey(full_name, nickname)')
    .gte('shift_date', from)
    .lte('shift_date', to)
    .order('shift_date')
    .order('start_time')
  return (data ?? []).map((s: any) => ({
    id: s.id,
    shift_date: s.shift_date,
    start_time: String(s.start_time).slice(0, 5),
    end_time: String(s.end_time).slice(0, 5),
    security_id: s.security_id,
    security_name: displayName(one<any>(s.security), 'Security'),
    post: s.post,
    note: s.note,
  }))
}

// Shift yang sedang berjalan (termasuk shift malam yang melewati tengah malam)
export function onDutyNow(shifts: Shift[], now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(now)
  const yesterday = addDaysIso(today, -1)
  const hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  return shifts.filter((s) => {
    const overnight = s.end_time <= s.start_time
    if (s.shift_date === today) return overnight ? hm >= s.start_time : hm >= s.start_time && hm < s.end_time
    if (s.shift_date === yesterday && overnight) return hm < s.end_time
    return false
  })
}

export async function loadPatrolAbsences(supabase: Supa): Promise<PatrolAbsence[]> {
  const today = todayWib()
  const { data: rows } = await supabase
    .from('house_absences')
    .select('id, house_id, start_date, end_date, note, contact_phone, created_by, house:houses(nomor_rumah)')
    .eq('status', 'aktif')
    .gte('end_date', today)
    .order('start_date')

  const list = rows ?? []
  const ids = list.map((r: any) => r.id as string)
  const ownerIds = Array.from(new Set(list.map((r: any) => r.created_by).filter(Boolean) as string[]))

  const [{ data: plans }, { data: checks }, { data: owners }] = await Promise.all([
    ids.length ? supabase.from('absence_patrol_plans').select('absence_id, per_day, assignees, internal_note').in('absence_id', ids) : Promise.resolve({ data: [] as any[] }),
    ids.length
      ? supabase
          .from('patrol_checks')
          .select('id, absence_id, checked_at, result, note, checked_by')
          .in('absence_id', ids)
          .order('checked_at', { ascending: false })
          .limit(1000)
      : Promise.resolve({ data: [] as any[] }),
    ownerIds.length ? supabase.from('profiles').select('id, full_name, nickname').in('id', ownerIds) : Promise.resolve({ data: [] as any[] }),
  ])
  const ownerPhones = await privateFields(supabase, ownerIds)

  const checkerIds = Array.from(new Set((checks ?? []).map((c: any) => c.checked_by as string)))
  const { data: checkers } = checkerIds.length ? await supabase.from('profiles').select('id, full_name, nickname').in('id', checkerIds) : { data: [] as any[] }
  const checkerName = new Map((checkers ?? []).map((p: any) => [p.id as string, displayName(p, 'Petugas')]))
  const ownerMap = new Map((owners ?? []).map((p: any) => [p.id as string, { ...p, phone: ownerPhones.get(p.id)?.phone ?? null }]))
  const planMap = new Map((plans ?? []).map((p: any) => [p.absence_id as string, p]))

  return list.map((r: any) => {
    const plan: any = planMap.get(r.id)
    const owner: any = ownerMap.get(r.created_by)
    return {
      id: r.id,
      house_id: r.house_id,
      nomor_rumah: one<any>(r.house)?.nomor_rumah ?? '-',
      start_date: r.start_date,
      end_date: r.end_date,
      note: r.note,
      contact_phone: r.contact_phone,
      owner_name: owner ? displayName(owner) : 'Penghuni',
      owner_phone: owner?.phone ?? null,
      per_day: plan?.per_day ?? 2,
      assignees: (plan?.assignees as string[]) ?? [],
      internal_note: plan?.internal_note ?? null,
      checks: (checks ?? [])
        .filter((c: any) => c.absence_id === r.id)
        .map((c: any) => ({
          id: c.id,
          checked_at: c.checked_at,
          result: c.result,
          note: c.note,
          checked_by: c.checked_by,
          checker_name: checkerName.get(c.checked_by) ?? 'Petugas',
        })),
    }
  })
}

export function checkedToday(checks: { checked_at: string }[], today = todayWib()) {
  return checks.filter((c) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(c.checked_at)) === today).length
}