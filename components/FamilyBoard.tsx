'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveFamilyItem, deleteFamilyItem, type FamilyItemInput } from '@/app/keluarga/actions'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'

export type FamilyMember = { id: string; name: string; familyRole: string | null }

export type FamilyItem = {
  id: string
  kind: 'catatan' | 'event'
  title: string
  content: string | null
  event_date: string | null
  event_time: string | null
  share_all: boolean
  visible_to: string[]
  created_by: string
  author_name: string
  updated_at: string
}

const ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  anggota_keluarga: 'Anggota Keluarga',
  asisten_rumah_tangga: 'ART',
  lainnya: 'Penghuni',
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

function todayWib() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

function emptyForm(kind: 'catatan' | 'event', date?: string): FamilyItemInput {
  return { kind, title: '', content: '', eventDate: date ?? todayWib(), eventTime: '', shareAll: true, visibleTo: [] }
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function FamilyBoard({
  items,
  members,
  myId,
  houseLabel,
}: {
  items: FamilyItem[]
  members: FamilyMember[]
  myId: string
  houseLabel: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()
  const [tab, setTab] = useState<'catatan' | 'event'>('catatan')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FamilyItemInput>(emptyForm('catatan'))
  const [error, setError] = useState('')
  const [month, setMonth] = useState(() => todayWib().slice(0, 7))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const memberName = useMemo(() => new Map(members.map((m) => [m.id, m.name])), [members])
  const notes = items.filter((i) => i.kind === 'catatan')
  const events = items.filter((i) => i.kind === 'event').sort((a, b) => `${a.event_date}${a.event_time ?? ''}`.localeCompare(`${b.event_date}${b.event_time ?? ''}`))

  const today = todayWib()
  const eventDates = new Set(events.map((e) => e.event_date))

  const calendarDays = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const first = new Date(Date.UTC(y, m - 1, 1))
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const offset = (first.getUTCDay() + 6) % 7 // minggu dimulai Senin
    const cells: (string | null)[] = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${month}-${String(d).padStart(2, '0')}`)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [month])

  const shownEvents = selectedDate ? events.filter((e) => e.event_date === selectedDate) : events.filter((e) => (e.event_date ?? '') >= today)

  function shiftMonth(delta: number) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(Date.UTC(y, m - 1 + delta, 1))
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
    setSelectedDate(null)
  }

  function openNew(kind: 'catatan' | 'event') {
    setEditingId(null)
    setForm(emptyForm(kind, selectedDate ?? undefined))
    setError('')
    setFormOpen(true)
  }

  function openEdit(item: FamilyItem) {
    setEditingId(item.id)
    setForm({
      kind: item.kind,
      title: item.title,
      content: item.content ?? '',
      eventDate: item.event_date ?? todayWib(),
      eventTime: item.event_time ? item.event_time.slice(0, 5) : '',
      shareAll: item.share_all,
      visibleTo: item.visible_to,
    })
    setError('')
    setFormOpen(true)
  }

  function toggleMember(id: string) {
    setForm((f) => {
      const base = f.shareAll ? members.map((m) => m.id) : f.visibleTo
      const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id]
      const allChecked = members.length > 0 && members.every((m) => next.includes(m.id))
      return { ...f, shareAll: allChecked, visibleTo: allChecked ? [] : next }
    })
  }

  function submit() {
    setError('')
    startTransition(async () => {
      const result = await saveFamilyItem(editingId, form)
      if (!result.success) {
        setError(result.error)
        return
      }
      setFormOpen(false)
      setEditingId(null)
      router.refresh()
    })
  }

  async function remove(item: FamilyItem) {
    if (!(await confirmModal(`Hapus "${item.title}"?`, { danger: true }))) return
    startTransition(async () => {
      const result = await deleteFamilyItem(item.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
    })
  }

  function audienceText(item: FamilyItem) {
    if (item.share_all) return 'Semua penghuni rumah'
    const names = item.visible_to.map((id) => (id === myId ? 'Kamu' : memberName.get(id))).filter(Boolean) as string[]
    if (item.created_by !== myId) names.unshift(item.author_name)
    if (names.length === 0) return 'Hanya kamu'
    return `Hanya: ${Array.from(new Set(names)).join(', ')}`
  }

  function renderItem(item: FamilyItem) {
    const mine = item.created_by === myId
    return (
      <div key={item.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.kind === 'event' && item.event_date ? (
              <div className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: '#b3392f' }}>
                {formatDate(item.event_date)}
                {item.event_time ? ` · ${item.event_time.slice(0, 5)}` : ''}
              </div>
            ) : null}
            <div className="text-[14.5px] font-bold" style={{ color: '#1f1a10' }}>{item.title}</div>
          </div>
          {mine ? (
            <div className="flex flex-shrink-0 gap-3">
              <button type="button" onClick={() => openEdit(item)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                Edit
              </button>
              <button type="button" disabled={isPending} onClick={() => remove(item)} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
                Hapus
              </button>
            </div>
          ) : null}
        </div>
        {item.content ? (
          <p className="mt-1.5 whitespace-pre-line text-[13.5px]" style={{ color: '#3a3424' }}>{item.content}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
          <span>Oleh {mine ? 'kamu' : item.author_name}</span>
          <span className="rounded-full px-2 py-0.5" style={{ background: item.share_all ? 'rgba(47,107,79,0.1)' : 'rgba(212,175,106,0.18)', color: item.share_all ? '#2f6b4f' : '#9c7a3f' }}>
            {audienceText(item)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 rounded-2xl p-1" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        {(['catatan', 'event'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setTab(k)
              setFormOpen(false)
            }}
            className="rounded-xl py-2.5 text-[13.5px] font-bold"
            style={tab === k ? { background: '#1a1305', color: 'var(--brand-accent)' } : { color: '#5b543f' }}
          >
            {k === 'catatan' ? `Catatan (${notes.length})` : `Kalender Event (${events.length})`}
          </button>
        ))}
      </div>

      {formOpen ? (
        <div className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
          <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>
            {editingId ? 'Ubah' : 'Tambah'} {form.kind === 'event' ? 'Event Keluarga' : 'Catatan Keluarga'}
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Judul</label>
            <input value={form.title} maxLength={100} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          </div>
          {form.kind === 'event' ? (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>Tanggal</label>
                <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>Jam (opsional)</label>
                <input type="time" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} style={inputStyle} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>{form.kind === 'event' ? 'Keterangan (opsional)' : 'Isi catatan'}</label>
            <textarea
              value={form.content}
              rows={4}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Siapa yang boleh melihat?</label>
            {members.length === 0 ? (
              <p className="text-[12px]" style={{ color: '#9c7a3f' }}>
                Belum ada penghuni lain yang terverifikasi di Rumah {houseLabel ?? ''}. Untuk sementara hanya kamu yang bisa melihat.
              </p>
            ) : (
              <div className="flex flex-col gap-1 rounded-xl px-3 py-2.5" style={{ background: '#faf7f0' }}>
                <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[13px] font-bold" style={{ color: '#1f1a10' }}>
                  <input
                    type="checkbox"
                    checked={form.shareAll}
                    onChange={(e) => setForm({ ...form, shareAll: e.target.checked, visibleTo: [] })}
                    style={{ width: 17, height: 17, accentColor: '#1a1305' }}
                  />
                  Semua penghuni rumah
                </label>
                <div className="my-1 h-px" style={{ background: 'rgba(26,19,5,0.08)' }} />
                {members.map((m) => {
                  const checked = form.shareAll || form.visibleTo.includes(m.id)
                  return (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2.5 py-1 text-[13px]" style={{ color: '#1f1a10' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(m.id)}
                        style={{ width: 17, height: 17, accentColor: '#1a1305' }}
                      />
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-[11px]" style={{ color: '#9c7a3f' }}>{ROLE_LABEL[m.familyRole ?? ''] ?? ''}</span>
                    </label>
                  )
                })}
                <span className="mt-1 text-[11px]" style={{ color: '#9c7a3f' }}>
                  Kamu selalu bisa melihat catatan/event buatanmu sendiri.
                </span>
              </div>
            )}
          </div>

          {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={submit}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => openNew(tab)}
          className="w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
        >
          + {tab === 'event' ? 'Tambah Event' : 'Tambah Catatan'}
        </button>
      )}

      {tab === 'catatan' ? (
        <div className="flex flex-col gap-2.5">
          {notes.length === 0 ? (
            <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
              Belum ada catatan keluarga.
            </div>
          ) : (
            notes.map((item) => renderItem(item))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => shiftMonth(-1)} className="rounded-lg px-3 py-1 text-sm font-bold" style={{ color: '#9c7a3f' }} aria-label="Bulan sebelumnya">
                ‹
              </button>
              <span className="text-[14px] font-bold capitalize" style={{ color: '#1f1a10' }}>
                {new Date(`${month}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => shiftMonth(1)} className="rounded-lg px-3 py-1 text-sm font-bold" style={{ color: '#9c7a3f' }} aria-label="Bulan berikutnya">
                ›
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-1 text-[10.5px] font-bold uppercase" style={{ color: '#9c7a3f' }}>{d}</div>
              ))}
              {calendarDays.map((date, i) =>
                date ? (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg text-[13px] font-bold"
                    style={{
                      background: selectedDate === date ? '#1a1305' : date === today ? 'rgba(212,175,106,0.2)' : 'transparent',
                      color: selectedDate === date ? 'var(--brand-accent)' : '#1f1a10',
                    }}
                  >
                    {Number(date.slice(8))}
                    {eventDates.has(date) ? (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: selectedDate === date ? 'var(--brand-accent)' : '#b3392f' }} />
                    ) : (
                      <span className="mt-0.5 h-1.5 w-1.5" />
                    )}
                  </button>
                ) : (
                  <div key={`kosong-${i}`} />
                )
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
              {selectedDate ? formatDate(selectedDate) : 'Event Mendatang'}
            </span>
            {selectedDate ? (
              <button type="button" onClick={() => setSelectedDate(null)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                Lihat semua
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2.5">
            {shownEvents.length === 0 ? (
              <div className="rounded-2xl px-5 py-6 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
                {selectedDate ? 'Tidak ada event di tanggal ini.' : 'Belum ada event mendatang.'}
              </div>
            ) : (
              shownEvents.map((item) => renderItem(item))
            )}
          </div>
        </div>
      )}
    </div>
  )
}