'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { changeOccupancy, requestOccupancy } from '@/app/status-hunian/actions'
import { OCCUPANCY_OPTIONS } from '@/lib/hunian'
import { inputStyle } from '@/lib/format'

export default function OccupancyEditor({
  current,
  houseId = null,
  compact = false,
  mode = 'direct',
}: {
  current: string
  houseId?: string | null
  compact?: boolean
  // 'direct': pemilik rumah / Pengurus, langsung tersimpan (perilaku lama).
  // 'request': penghuni lain (bukan pemilik) -- jadi pengajuan, menunggu disetujui Pengurus.
  mode?: 'direct' | 'request'
}) {
  const router = useRouter()
  const [status, setStatus] = useState(current)
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    setMsg(null)
    startTransition(async () => {
      if (mode === 'request') {
        const r = await requestOccupancy(status, note)
        if (r.error) {
          setMsg({ ok: false, text: r.error })
          return
        }
        setNote('')
        setMsg({
          ok: true,
          text: r.langsung ? 'Status hunian diperbarui.' : 'Pengajuan dikirim, menunggu disetujui Admin Paguyuban/Sekretaris.',
        })
        router.refresh()
        return
      }
      const r = await changeOccupancy(status, note, houseId)
      if (r.error) {
        setMsg({ ok: false, text: r.error })
        return
      }
      setNote('')
      setMsg({ ok: true, text: r.unchanged ? 'Status tidak berubah.' : 'Status hunian diperbarui. Pengurus & penghuni diberi tahu.' })
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`} role="radiogroup" aria-label="Status hunian">
        {OCCUPANCY_OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={status === o.key}
            onClick={() => setStatus(o.key)}
            className="rounded-xl px-3 py-2.5 text-left"
            style={status === o.key ? { background: o.color, color: '#fff' } : { background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.1)' }}
          >
            <div className="text-[13px] font-bold">{o.label}</div>
            {!compact ? <div className="text-[11px]" style={{ opacity: 0.8 }}>{o.hint}</div> : null}
          </button>
        ))}
      </div>
      <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder="Catatan (opsional), mis. disewakan mulai 1 Oktober" aria-label="Catatan" style={inputStyle} />
      <button type="button" disabled={isPending || status === current} onClick={save} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending || status === current ? 0.6 : 1 }}>
        {isPending ? 'Menyimpan...' : mode === 'request' ? 'Ajukan Perubahan' : 'Simpan Status'}
      </button>
      {msg ? <p className="text-[12.5px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>{msg.text}</p> : null}
    </div>
  )
}