type Absence = {
  id: string
  start_date: string
  end_date: string
  note: string | null
  contact_phone: string | null
  house?: { nomor_rumah: string } | null
  reporter_name?: string | null
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function daysLeft(end: string) {
  const ms = new Date(`${end}T23:59:59`).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

// Daftar untuk Security / Paguyuban / Superadmin: hanya melihat (status diaktifkan oleh warga sendiri)
export default function RumahKosongList({ absences }: { absences: Absence[] }) {
  if (absences.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
        Tidak ada rumah yang sedang kosong.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {absences.map((a) => {
        const started = new Date(`${a.start_date}T00:00:00`).getTime() <= Date.now()
        return (
          <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.25)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Rumah {a.house?.nomor_rumah ?? '-'}</div>
                <div className="text-[12.5px] font-semibold" style={{ color: '#9c7a3f' }}>
                  {formatDate(a.start_date)} s/d {formatDate(a.end_date)}
                  {a.reporter_name ? ` · dilaporkan ${a.reporter_name}` : ''}
                </div>
              </div>
              <span
                className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                style={started ? { background: '#b3392f', color: '#ffffff' } : { background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
              >
                {started ? `Kosong · ${daysLeft(a.end_date)} hari lagi` : 'Akan kosong'}
              </span>
            </div>
            {a.note ? <p className="mt-2 text-[13px]" style={{ color: '#3a3424' }}>{a.note}</p> : null}
            {a.contact_phone ? (
              <a href={`tel:${a.contact_phone.replace(/[^0-9+]/g, '')}`} className="mt-1.5 inline-block text-[13px] font-bold" style={{ color: '#b3392f' }}>
                Hubungi penghuni: {a.contact_phone}
              </a>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}