import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
import type { EmergencyEvent } from '@/lib/emergency'

type Supa = Awaited<ReturnType<typeof createClient>>

export type AlertRow = {
  id: string
  emergency_type: string
  message: string | null
  status: string
  created_at: string
  accepted_at: string | null
  resolved_at: string | null
  escalated_at: string | null
  resolution: string | null
  resolution_note: string | null
  reporter_id: string
  handled_by: string | null
  house_id: string | null
  nomor_rumah: string | null
  reporter_name: string
  reporter_phone: string | null
  handled_by_name: string | null
  resolved_by_name: string | null
}

const ALERT_COLUMNS =
  'id, emergency_type, message, status, created_at, accepted_at, resolved_at, escalated_at, resolution, resolution_note, reporter_id, handled_by, resolved_by, house_id, house:houses(nomor_rumah)'

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

async function peopleMap(supabase: Supa, ids: (string | null | undefined)[]) {
  const unique = Array.from(new Set(ids.filter(Boolean) as string[]))
  if (!unique.length) return new Map<string, { name: string; phone: string | null }>()
  const { data } = await supabase.from('profiles').select('id, full_name, nickname, phone').in('id', unique)
  return new Map((data ?? []).map((p: any) => [p.id as string, { name: displayName(p), phone: (p.phone as string) ?? null }]))
}

export async function loadAlerts(supabase: Supa, filter: { openOnly?: boolean; sinceIso?: string; ids?: string[]; limit?: number }) {
  let q = supabase.from('emergency_alerts').select(ALERT_COLUMNS).order('created_at', { ascending: false }).limit(filter.limit ?? 200)
  if (filter.openOnly) q = q.in('status', ['aktif', 'ditangani'])
  if (filter.sinceIso) q = q.gte('created_at', filter.sinceIso)
  if (filter.ids) q = q.in('id', filter.ids)
  const { data } = await q
  const rows = data ?? []
  const people = await peopleMap(supabase, rows.flatMap((r: any) => [r.reporter_id, r.handled_by, r.resolved_by]))
  return rows.map((r: any): AlertRow => ({
    id: r.id,
    emergency_type: r.emergency_type,
    message: r.message,
    status: r.status,
    created_at: r.created_at,
    accepted_at: r.accepted_at,
    resolved_at: r.resolved_at,
    escalated_at: r.escalated_at,
    resolution: r.resolution,
    resolution_note: r.resolution_note,
    reporter_id: r.reporter_id,
    handled_by: r.handled_by,
    house_id: r.house_id,
    nomor_rumah: one<any>(r.house)?.nomor_rumah ?? null,
    reporter_name: people.get(r.reporter_id)?.name ?? 'Warga',
    reporter_phone: people.get(r.reporter_id)?.phone ?? null,
    handled_by_name: r.handled_by ? people.get(r.handled_by)?.name ?? null : null,
    resolved_by_name: r.resolved_by ? people.get(r.resolved_by)?.name ?? null : null,
  }))
}

export async function loadEvents(supabase: Supa, alertIds: string[]) {
  if (!alertIds.length) return new Map<string, EmergencyEvent[]>()
  const { data } = await supabase
    .from('emergency_events')
    .select('id, alert_id, actor_id, kind, body, is_internal, created_at')
    .in('alert_id', alertIds)
    .order('created_at', { ascending: true })
    .limit(2000)
  const people = await peopleMap(supabase, (data ?? []).map((e: any) => e.actor_id))
  const map = new Map<string, EmergencyEvent[]>()
  ;(data ?? []).forEach((e: any) => {
    const list = map.get(e.alert_id) ?? []
    list.push({
      id: e.id,
      kind: e.kind,
      body: e.body,
      is_internal: !!e.is_internal,
      created_at: e.created_at,
      actor_name: e.actor_id ? people.get(e.actor_id)?.name ?? null : null,
    })
    map.set(e.alert_id, list)
  })
  return map
}