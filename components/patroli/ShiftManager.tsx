'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ShiftWeek from '@/components/patroli/ShiftWeek'
import { addShifts, copyPreviousWeek, deleteShift } from '@/app/keamanan/jadwal-jaga/actions'
import type { SecurityPerson, Shift } from '@/lib/patrol'
import { inputStyle, labelStyle } from '@/lib/format'
import { useConfirm } from '@/components/ModalProvider'

const PRESETS = [
  { label: 'Pagi 06-18', start: '06:00', end: '18:00' },
  { label: 'Malam 18-06', start: '18:00', end: '06:00' },
  { label: 'Pagi 07-15', start: '07:00', end: '15:00' },
  { label: 'Sore 15-23', start: '15:00', end: '23:00' },
  { label: 'Malam 23-07', start: '23:00', end: '07:00' },
]

export default function ShiftManager({
  days,
  shifts,
  security,
  today,
  weekStart,
  onDutyIds,
}: {
  days: string[]
  shifts: Shift[]
  security: SecurityPerson[]
  today: string
  weekStart: string
  onDutyIds: string[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const [date, setDate] = useState(days.includes(today) ? today : days[0])
  const [repeat, setRepeat] = useState(1)
  const [start, setStart] = useState('06:00')
  const [end, setEnd] = useState('18:00')
  const [people, setPeople] = useState<string[]>([])
  const [post, setPost] = useState('Pos Utama')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function run(fn: () => Promise<{ error: string | null; count?: number }>, okText: (n: number) => string) {
    setMessage(null)
    startTransition(async () => {
      const r = await fn()
      if (r.error) setMessage({ ok: false, text: r.error })
      else setMessage({ ok: true, text: okText(r.count ?? 0) })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
        <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Tambah Jadwal Jaga</div>
        {security.length === 0 ? (
          <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>Belum ada akun Security. Superadmin perlu membuat akun Security dulu di Kelola Admin.</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => { setStart(p.start); setEnd(p.end) }} className="rounded-full px-3 py-1 text-[11.5px] font-bold" style={start === p.start && end === p.end ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f' }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="sh-date">Mulai tanggal</label>
            <input id="sh-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="sh-rep">Ulangi</label>
            <select id="sh-rep" value={repeat} onChange={(e) => setRepeat(Number(e.target.value))} style={inputStyle}>
              {[1, 2, 3, 5, 7, 14, 30].map((n) => (
                <option key={n} value={n}>{n === 1 ? 'Hanya hari itu' : `${n} hari berturut`}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="sh-start">Jam mulai</label>
            <input id="sh-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle} htmlFor="sh-end">Jam selesai</label>
            <input id="sh-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div>
          <div className="mb-1" style={labelStyle}>Petugas</div>
          <div className="flex flex-wrap gap-1.5">
            {security.map((s) => {
              const on = people.includes(s.id)
              return (
                <button key={s.id} type="button" onClick={() => setPeople(on ? people.filter((x) => x !== s.id) : [...people, s.id])} className="rounded-full px-3 py-1 text-[12px] font-bold" style={on ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.12)' }}>
                  {on ? '✓ ' : ''}
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <input value={post} maxLength={40} onChange={(e) => setPost(e.target.value)} placeholder="Pos Utama" aria-label="Pos jaga" style={inputStyle} />
          <input value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional), mis. patroli keliling tiap 2 jam" aria-label="Catatan" style={inputStyle} />
        </div>
        <button
          type="button"
          disabled={isPending || !people.length}
          onClick={() => run(() => addShifts({ date, repeatDays: repeat, startTime: start, endTime: end, securityIds: people, post, note }), (n) => `${n} jadwal ditambahkan.`)}
          className="rounded-xl py-2.5 text-[13px] font-bold"
          style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending || !people.length ? 0.6 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
        {message ? <p className="text-[12.5px] font-bold" style={{ color: message.ok ? '#2f6b4f' : '#b3392f' }}>{message.text}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Jadwal Minggu Ini</span>
        <button
          type="button"
          disabled={isPending}
          onClick={async () => {
            if (!(await confirmModal('Salin semua jadwal minggu lalu ke minggu ini? Jadwal yang sudah ada tidak dobel.'))) return
            run(() => copyPreviousWeek(weekStart), (n) => `${n} jadwal disalin dari minggu lalu.`)
          }}
          className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Salin dari minggu lalu
        </button>
      </div>

      <ShiftWeek
        days={days}
        shifts={shifts}
        today={today}
        onDutyIds={onDutyIds}
        renderAction={(s) => (
          <button
            type="button"
            aria-label="Hapus jadwal"
            disabled={isPending}
            onClick={async () => {
              if (!(await confirmModal(`Hapus jadwal ${s.security_name} ${s.start_time}-${s.end_time}?`, { danger: true }))) return
              run(() => deleteShift(s.id), () => 'Jadwal dihapus.')
            }}
            className="flex-shrink-0 text-[12px] font-bold"
            style={{ color: '#b3392f' }}
          >
            ✕
          </button>
        )}
      />
    </div>
  )
}