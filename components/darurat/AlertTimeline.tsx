import { EVENT_COLOR, EVENT_LABEL, clock, type EmergencyEvent } from '@/lib/emergency'

// Log respons (urut waktu). Catatan internal diberi tanda supaya jelas tidak terlihat pelapor.
export default function AlertTimeline({ events, showInternalBadge = true }: { events: EmergencyEvent[]; showInternalBadge?: boolean }) {
  if (events.length === 0) return <p className="text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada catatan.</p>

  return (
    <ol className="relative flex flex-col gap-3 pl-5">
      <span aria-hidden className="absolute bottom-1 left-[5px] top-1 w-0.5" style={{ background: '#e9e2d2' }} />
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden className="absolute -left-5 top-1 h-3 w-3 rounded-full" style={{ background: EVENT_COLOR[e.kind] ?? '#5b543f', border: '2px solid #fff' }} />
          <div className="flex flex-wrap items-center gap-x-2 text-[12.5px]">
            <b style={{ color: '#1f1a10' }}>{EVENT_LABEL[e.kind] ?? e.kind}</b>
            <span style={{ color: '#9c7a3f' }}>
              {clock(e.created_at, true)}
              {e.actor_name ? ` · ${e.actor_name}` : ''}
            </span>
            {showInternalBadge && e.is_internal ? (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'rgba(107,79,138,0.12)', color: '#6b4f8a' }}>
                internal
              </span>
            ) : null}
          </div>
          {e.body ? <p className="mt-0.5 whitespace-pre-line text-[13px]" style={{ color: '#3d3727' }}>{e.body}</p> : null}
        </li>
      ))}
    </ol>
  )
}