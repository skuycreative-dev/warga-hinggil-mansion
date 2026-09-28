import { addDaysIso, todayWib } from '@/lib/patrol'

// Minggu Senin-Minggu. `param` = tanggal apa pun di minggu yang diminta (YYYY-MM-DD).
export function weekFrom(param: string | undefined) {
  const today = todayWib()
  const base = param && /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : today
  const [y, m, d] = base.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = Minggu
  const monday = addDaysIso(base, dow === 0 ? -6 : 1 - dow)
  const days = Array.from({ length: 7 }).map((_, i) => addDaysIso(monday, i))
  return { today, monday, sunday: days[6], days, prev: addDaysIso(monday, -7), next: addDaysIso(monday, 7) }
}

export function rangeLabel(from: string, to: string) {
  const f = new Date(`${from}T00:00:00`)
  const t = new Date(`${to}T00:00:00`)
  return `${f.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${t.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
}