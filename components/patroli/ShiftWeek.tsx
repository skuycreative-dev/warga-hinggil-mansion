import type { Shift } from '@/lib/patrol'

const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function dayLabel(d: string) {
  const dt = new Date(`${d}T00:00:00`)
  return `${DAY[dt.getDay()]}, ${dt.getDate()} ${dt.toLocaleDateString('id-ID', { month: 'short' })}`
}

// Tampilan jadwal jaga per hari (dipakai halaman kelola & halaman warga)
export default function ShiftWeek({
  days,
  shifts,
  today,
  onDutyIds = [],
  renderAction,
}: {
  days: string[]
  shifts: Shift[]
  today: string
  onDutyIds?: string[]
  renderAction?: (s: Shift) => React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {days.map((d) => {
        const list = shifts.filter((s) => s.shift_date === d)
        const isToday = d === today
        return (
          <div key={d} className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: isToday ? '2px solid #d4a53a' : '1px solid rgba(26,19,5,0.08)' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{dayLabel(d)}</span>
              {isToday ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: '#fff4dc', color: '#7a5a1f' }}>HARI INI</span> : null}
            </div>
            {list.length === 0 ? (
              <p className="text-[12px]" style={{ color: '#9c7a3f' }}>Belum ada jadwal.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {list.map((s) => {
                  const live = onDutyIds.includes(s.id)
                  return (
                    <div key={s.id} className="flex items-start justify-between gap-2 rounded-lg px-2.5 py-1.5" style={{ background: live ? 'rgba(47,107,79,0.1)' : '#faf7f0' }}>
                      <div className="min-w-0 text-[12.5px]">
                        <b style={{ color: '#1f1a10' }}>
                          {s.start_time}–{s.end_time}
                        </b>{' '}
                        <span style={{ color: '#3d3727' }}>{s.security_name}</span>
                        <div className="text-[11px]" style={{ color: '#9c7a3f' }}>
                          {s.post}
                          {s.end_time <= s.start_time ? ' · sampai besok' : ''}
                          {s.note ? ` · ${s.note}` : ''}
                          {live ? <b style={{ color: '#2f6b4f' }}> · sedang jaga</b> : null}
                        </div>
                      </div>
                      {renderAction ? renderAction(s) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}