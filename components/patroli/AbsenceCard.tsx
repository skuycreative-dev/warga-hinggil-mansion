'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { recordPatrol, savePatrolPlan, undoPatrol } from '@/app/keamanan/rumah-kosong/actions'
import type { PatrolAbsence, SecurityPerson } from '@/lib/patrol'
import { inputStyle } from '@/lib/format'

type Tone = { bg: string; color: string }

function dateLabel(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AbsenceCard({
  absence,
  security,
  myId,
  daysEmpty,
  totalDays,
  tone,
  doneToday,
  upcoming,
}: {
  absence: PatrolAbsence
  security: SecurityPerson[]
  myId: string
  daysEmpty: number
  totalDays: number
  tone: Tone
  doneToday: number
  upcoming: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mode, setMode] = useState<'none' | 'plan' | 'check' | 'history'>('none')
  const [perDay, setPerDay] = useState(absence.per_day)
  const [assignees, setAssignees] = useState<string[]>(absence.assignees)
  const [planNote, setPlanNote] = useState(absence.internal_note ?? '')
  const [result, setResult] = useState<'aman' | 'mencurigakan'>('aman')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const nameOf = (id: string) => security.find((s) => s.id === id)?.name ?? 'Petugas'
  const progress = Math.min(doneToday / absence.per_day, 1)

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    setError('')
    startTransition(async () => {
      const r = await fn()
      if (r.error) {
        setError(r.error)
        return
      }
      after?.()
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: `1px solid ${upcoming ? 'rgba(26,19,5,0.08)' : tone.color}33` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>{absence.nomor_rumah}</span>
            <span className="text-[13px]" style={{ color: '#5b543f' }}>· {absence.owner_name}</span>
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: '#5b543f' }}>
            {dateLabel(absence.start_date)} – {dateLabel(absence.end_date)} · {totalDays} hari
          </div>
        </div>
        <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase" style={upcoming ? { background: '#eef2f8', color: '#3b5b8a' } : { background: tone.bg, color: tone.color }}>
          {upcoming ? `Mulai ${dateLabel(absence.start_date)}` : `Hari ke-${daysEmpty + 1}`}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2 text-[12.5px] sm:grid-cols-2">
        <div className="rounded-lg px-3 py-2" style={{ background: '#faf7f0' }}>
          <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: '#9c7a3f' }}>Kontak darurat</div>
          {absence.contact_phone ? (
            <a href={`tel:${absence.contact_phone.replace(/[^0-9+]/g, '')}`} className="font-bold" style={{ color: '#3b5b8a' }}>☎ {absence.contact_phone}</a>
          ) : (
            <span style={{ color: '#5b543f' }}>-</span>
          )}
          {absence.owner_phone ? (
            <div style={{ color: '#5b543f' }}>
              Penghuni: <a href={`tel:${absence.owner_phone.replace(/[^0-9+]/g, '')}`} className="font-bold" style={{ color: '#3b5b8a' }}>{absence.owner_phone}</a>
            </div>
          ) : null}
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: '#faf7f0' }}>
          <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: '#9c7a3f' }}>Catatan warga</div>
          <span style={{ color: '#3d3727' }}>{absence.note ?? '-'}</span>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: '#5b543f' }}>
        <span>
          Target <b style={{ color: '#1f1a10' }}>{absence.per_day}x/hari</b>
        </span>
        <span>Petugas: {absence.assignees.length ? absence.assignees.map(nameOf).join(', ') : 'semua Security'}</span>
        {absence.internal_note ? <span className="italic">· {absence.internal_note}</span> : null}
      </div>

      {!upcoming ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11.5px] font-bold" style={{ color: doneToday >= absence.per_day ? '#2f6b4f' : '#7a5a1f' }}>
            <span>Patroli hari ini: {doneToday}/{absence.per_day}</span>
            {absence.checks[0] ? <span style={{ color: '#9c7a3f' }}>Terakhir {timeLabel(absence.checks[0].checked_at)} · {absence.checks[0].checker_name}</span> : null}
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#f1ece0' }} aria-hidden>
            <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: doneToday >= absence.per_day ? '#2f6b4f' : '#d4a53a' }} />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {!upcoming ? (
          <button type="button" onClick={() => setMode(mode === 'check' ? 'none' : 'check')} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
            ✓ Catat Patroli
          </button>
        ) : null}
        <button type="button" onClick={() => setMode(mode === 'plan' ? 'none' : 'plan')} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}>
          Atur Target & Petugas
        </button>
        <button type="button" onClick={() => setMode(mode === 'history' ? 'none' : 'history')} className="rounded-lg px-3.5 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
          Riwayat ({absence.checks.length})
        </button>
      </div>

      {mode === 'check' ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: '#faf7f0' }}>
          <div className="grid grid-cols-2 gap-2">
            {(['aman', 'mencurigakan'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setResult(r)}
                className="rounded-lg py-2 text-[12.5px] font-bold"
                style={result === r ? { background: r === 'aman' ? '#2f6b4f' : '#b3392f', color: '#fff' } : { background: '#fff', color: '#5b543f' }}
              >
                {r === 'aman' ? 'Aman ✓' : '⚠ Mencurigakan'}
              </button>
            ))}
          </div>
          <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={result === 'aman' ? 'Catatan (opsional), mis. pagar terkunci, lampu teras menyala' : 'Apa yang mencurigakan?'} style={{ ...inputStyle, background: '#fff' }} />
          <p className="text-[11px]" style={{ color: '#9c7a3f' }}>
            Penghuni rumah langsung mendapat notifikasi. {result === 'mencurigakan' ? 'Pengurus & Security lain juga diberi tahu.' : ''}
          </p>
          <button type="button" disabled={isPending} onClick={() => run(() => recordPatrol(absence.id, absence.house_id, result, note), () => { setMode('none'); setNote(''); setResult('aman') })} className="rounded-lg py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
            {isPending ? 'Menyimpan...' : 'Simpan Patroli'}
          </button>
        </div>
      ) : null}

      {mode === 'plan' ? (
        <div className="mt-3 flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: '#faf7f0' }}>
          <label className="flex items-center gap-2 text-[12.5px] font-bold" style={{ color: '#5b543f' }}>
            Target
            <select value={perDay} onChange={(e) => setPerDay(Number(e.target.value))} style={{ ...inputStyle, background: '#fff', width: 'auto', padding: '6px 10px' }}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}x per hari</option>
              ))}
            </select>
          </label>
          <div className="text-[12px] font-bold" style={{ color: '#5b543f' }}>Petugas (kosongkan = semua Security)</div>
          <div className="flex flex-wrap gap-1.5">
            {security.length === 0 ? <span className="text-[12px]" style={{ color: '#9c7a3f' }}>Belum ada akun Security.</span> : null}
            {security.map((s) => {
              const on = assignees.includes(s.id)
              return (
                <button key={s.id} type="button" onClick={() => setAssignees(on ? assignees.filter((x) => x !== s.id) : [...assignees, s.id])} className="rounded-full px-3 py-1 text-[12px] font-bold" style={on ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#fff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.12)' }}>
                  {on ? '✓ ' : ''}
                  {s.name}
                </button>
              )
            })}
          </div>
          <input value={planNote} maxLength={300} onChange={(e) => setPlanNote(e.target.value)} placeholder="Catatan internal tim (mis. cek pagar samping)" style={{ ...inputStyle, background: '#fff' }} />
          <button type="button" disabled={isPending} onClick={() => run(() => savePatrolPlan(absence.id, perDay, assignees, planNote), () => setMode('none'))} className="rounded-lg py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
            Simpan
          </button>
        </div>
      ) : null}

      {mode === 'history' ? (
        <div className="mt-3 flex max-h-64 flex-col overflow-y-auto rounded-xl px-3.5 py-2" style={{ background: '#faf7f0' }}>
          {absence.checks.length === 0 ? <p className="py-2 text-[12px]" style={{ color: '#5b543f' }}>Belum ada patroli tercatat.</p> : null}
          {absence.checks.map((c) => {
            const canUndo = c.checked_by === myId && Date.now() - new Date(c.checked_at).getTime() < 15 * 60 * 1000
            return (
              <div key={c.id} className="flex items-start justify-between gap-2 py-1.5 text-[12px]" style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                <div>
                  <b style={{ color: c.result === 'aman' ? '#2f6b4f' : '#b3392f' }}>{c.result === 'aman' ? 'Aman' : 'Mencurigakan'}</b>
                  <span style={{ color: '#5b543f' }}> · {timeLabel(c.checked_at)} · {c.checker_name}</span>
                  {c.note ? <div style={{ color: '#3d3727' }}>{c.note}</div> : null}
                </div>
                {canUndo ? (
                  <button type="button" disabled={isPending} onClick={() => run(() => undoPatrol(c.id))} className="flex-shrink-0 text-[11px] font-bold" style={{ color: '#b3392f' }}>
                    Batalkan
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
    </div>
  )
}