'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setMyStatus, clearMyStatus } from '@/app/profile/actions'

const MAX = 150
// Emoji ditulis sebagai kode Unicode supaya aman saat skrip di-paste ke PowerShell Windows
const QUICK_EMOJI = ['\u{1F60A}', '\u{1F602}', '\u{1F64F}', '\u{2764}\u{FE0F}', '\u{1F389}', '\u{2615}', '\u{1F3E0}', '\u{1F697}', '\u{1F634}', '\u{1F912}', '\u{1F3C3}', '\u{1F4DA}']

function hoursLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'sudah hilang'
  const hours = Math.floor(ms / 3600000)
  if (hours >= 1) return `hilang dalam ${hours} jam`
  return `hilang dalam ${Math.max(1, Math.floor(ms / 60000))} menit`
}

export default function StatusEditor({
  current,
}: {
  current: { content: string; expires_at: string } | null
}) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const active = current && new Date(current.expires_at).getTime() > Date.now() ? current : null
  const length = [...text].length

  function save() {
    setError('')
    startTransition(async () => {
      const result = await setMyStatus(text)
      if (result.error) {
        setError(result.error)
        return
      }
      setText('')
      setOpen(false)
      router.refresh()
    })
  }

  function clear() {
    startTransition(async () => {
      const result = await clearMyStatus()
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  return (
    <div className="mt-5 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Status Pribadi</span>
        <span className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>Hanya terlihat teman · 24 jam</span>
      </div>

      {active && !open ? (
        <div className="mt-2">
          <p className="text-[14px] font-semibold" style={{ color: '#1f1a10' }}>{active.content}</p>
          <p className="mt-0.5 text-[11px] font-medium" style={{ color: '#9c7a3f' }}>{hoursLeft(active.expires_at)}</p>
          <div className="mt-2.5 flex gap-4">
            <button
              type="button"
              onClick={() => {
                setText(active.content)
                setOpen(true)
              }}
              className="text-[12px] font-bold"
              style={{ color: '#9c7a3f' }}
            >
              Ganti
            </button>
            <button type="button" disabled={isPending} onClick={clear} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
              Hapus
            </button>
          </div>
        </div>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded-xl py-2.5 text-[13px] font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px dashed rgba(156,122,63,0.5)' }}
        >
          + Tulis status
        </button>
      ) : (
        <div className="mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Lagi apa hari ini?"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#faf7f0',
              border: '1px solid rgba(26,19,5,0.12)',
              borderRadius: '11px',
              padding: '10px 12px',
              color: '#1f1a10',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
            }}
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {QUICK_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setText((t) => ([...t].length < MAX ? t + emoji : t))}
                className="h-8 w-8 rounded-lg text-lg"
                style={{ background: '#faf7f0' }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold" style={{ color: length > MAX ? '#b3392f' : '#9c7a3f' }}>
              {length}/{MAX}
            </span>
            {error ? <span className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>{error}</span> : null}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setError('')
              }}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-bold"
              style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending || length === 0 || length > MAX}
              onClick={save}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-bold"
              style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending || length === 0 || length > MAX ? 0.6 : 1 }}
            >
              {isPending ? 'Menyimpan...' : 'Pasang Status'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}