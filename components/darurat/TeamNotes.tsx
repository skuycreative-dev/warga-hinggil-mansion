'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addTeamEvent } from '@/app/keamanan/darurat/actions'
import { clock, type EmergencyEvent } from '@/lib/emergency'
import { inputStyle } from '@/lib/format'

type Tab = 'chat' | 'logbook' | 'update'

const TAB_INFO: Record<Tab, { label: string; hint: string; placeholder: string }> = {
  chat: { label: 'Chat Tim', hint: 'Hanya Security, Pengurus & Superadmin. Pelapor tidak melihat.', placeholder: 'mis. Saya OTW, Pak Bambang standby di pos' },
  logbook: { label: 'Logbook Laporan', hint: 'Catatan resmi petugas, masuk ke laporan cetak. Tidak bisa dihapus.', placeholder: '14:30 — pelaku kabur ke arah utara, plat AB 1234 XY' },
  update: { label: 'Update ke Pelapor', hint: 'Terkirim sebagai notifikasi ke pelapor.', placeholder: 'mis. Kami sudah di depan rumah, mohon buka pagar' },
}

export default function TeamNotes({ alertId, events, closed }: { alertId: string; events: EmergencyEvent[]; closed: boolean }) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('chat')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const list = events.filter((e) => e.kind === tab)

  function submit() {
    setError('')
    startTransition(async () => {
      const result = await addTeamEvent(alertId, tab, text)
      if (result.error) {
        setError(result.error)
        return
      }
      setText('')
      router.refresh()
    })
  }

  return (
    <section className="rounded-2xl px-4 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex gap-1.5 overflow-x-auto">
        {(Object.keys(TAB_INFO) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold"
            style={tab === t ? { background: '#1a1305', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f' }}
          >
            {TAB_INFO[t].label} ({events.filter((e) => e.kind === t).length})
          </button>
        ))}
      </div>
      <p className="mb-2 text-[11.5px]" style={{ color: '#9c7a3f' }}>{TAB_INFO[tab].hint}</p>

      <div className="mb-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
        {list.length === 0 ? <p className="text-[12.5px]" style={{ color: '#5b543f' }}>Belum ada.</p> : null}
        {list.map((e) => (
          <div key={e.id} className="rounded-xl px-3 py-2" style={{ background: tab === 'logbook' ? '#f4f0f8' : '#faf7f0' }}>
            <div className="text-[11.5px] font-bold" style={{ color: '#7a6f55' }}>
              {e.actor_name ?? 'Petugas'} · {clock(e.created_at, true)}
            </div>
            <p className="whitespace-pre-line text-[13px]" style={{ color: '#1f1a10' }}>{e.body}</p>
          </div>
        ))}
      </div>

      {!closed || tab === 'logbook' ? (
        <div className="flex flex-col gap-2">
          <textarea value={text} maxLength={1000} rows={2} onChange={(e) => setText(e.target.value)} placeholder={TAB_INFO[tab].placeholder} aria-label={TAB_INFO[tab].label} style={inputStyle} />
          {error ? <p className="text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
          <button type="button" disabled={isPending || !text.trim()} onClick={submit} className="rounded-lg py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending || !text.trim() ? 0.6 : 1 }}>
            {isPending ? 'Mengirim...' : tab === 'logbook' ? 'Simpan ke Logbook' : 'Kirim'}
          </button>
        </div>
      ) : (
        <p className="text-[12px]" style={{ color: '#9c7a3f' }}>Alert sudah selesai. Logbook masih bisa ditambah untuk melengkapi laporan.</p>
      )}
    </section>
  )
}