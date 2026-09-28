'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getServiceFileUrl, markServiceRead, sendServiceMessage, setServiceStatus } from '@/app/layanan/actions'
import { ACCEPT_ATTR, DOC_TYPES, LAYANAN_STATUS, MAX_DOC_BYTES, fileSizeLabel, guessType, safeFileName } from '@/lib/layanan'
import { compressImage, extFor, isImage } from '@/lib/image-upload'

export type ThreadMessage = {
  id: string
  sender_id: string
  sender_name: string
  sender_is_staff: boolean
  body: string | null
  file_name: string | null
  file_type: string | null
  file_size: number | null
  preview_url: string | null
  created_at: string
}

function time(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function FileIcon({ type }: { type: string | null }) {
  const label = type === 'application/pdf' ? 'PDF' : type && type.includes('word') ? 'DOC' : 'IMG'
  const color = label === 'PDF' ? '#b3392f' : label === 'DOC' ? '#3b5b8a' : '#2f6b4f'
  return (
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[10.5px] font-bold text-white" style={{ background: color }}>
      {label}
    </span>
  )
}

export default function ServiceThread({
  requestId,
  status,
  messages,
  myId,
  isStaff,
  isRequester,
}: {
  requestId: string
  status: string
  messages: ThreadMessage[]
  myId: string
  isStaff: boolean
  isRequester: boolean
}) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
    void markServiceRead(requestId)
  }, [messages.length, requestId])

  async function openFile(id: string, download: boolean) {
    const win = download ? null : window.open('', '_blank')
    const r = await getServiceFileUrl(id, download)
    if (!r.url) {
      win?.close()
      alert(r.error ?? 'File tidak bisa dibuka.')
      return
    }
    if (win) win.location.href = r.url
    else window.location.href = r.url
  }

  function pickFile(f: File | undefined) {
    setError('')
    if (!f) return
    const type = guessType(f)
    if (!DOC_TYPES[type] && !isImage(f)) {
      setError('File harus PDF, Word (.doc/.docx), JPG, atau PNG.')
      return
    }
    if (!isImage(f) && f.size > MAX_DOC_BYTES) {
      setError('Ukuran PDF/Word maksimal 10 MB.')
      return
    }
    setFile(f)
  }

  async function send() {
    if (!text.trim() && !file) return
    setError('')
    setBusy(true)
    let attachment: { path: string; name: string; type: string; size: number } | null = null
    try {
      if (file) {
        let blob: Blob = file
        let type = guessType(file)
        let name = file.name
        if (isImage(file)) {
          // Foto dikompres otomatis maks 2 MB
          blob = await compressImage(file)
          type = blob.type
          name = name.replace(/\.[^.]+$/, '') + '.' + extFor(type)
        }
        const path = `${requestId}/${Date.now()}-${safeFileName(name)}`
        const supabase = createClient()
        const { error: upErr } = await supabase.storage.from('service-files').upload(path, blob, { contentType: type, upsert: false })
        if (upErr) throw new Error(`Gagal mengunggah file: ${upErr.message}`)
        attachment = { path, name, type, size: blob.size }
      }
      const r = await sendServiceMessage(requestId, text, attachment)
      if (r.error) throw new Error(r.error)
      setText('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim.')
    } finally {
      setBusy(false)
    }
  }

  function changeStatus(next: string) {
    const msg =
      next === 'dibatalkan'
        ? 'Batalkan permintaan ini? Percakapan tidak bisa dilanjutkan.'
        : next === 'selesai'
          ? 'Tandai selesai? Pastikan surat sudah dikirim ke warga.'
          : null
    if (msg && !confirm(msg)) return
    startTransition(async () => {
      const r = await setServiceStatus(requestId, next)
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  const closed = status === 'dibatalkan'

  return (
    <div className="flex flex-col gap-3">
      {isStaff ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <span className="text-[12px] font-bold" style={{ color: '#5b543f' }}>Status:</span>
          {(['baru', 'diproses', 'selesai'] as const).map((s) => (
            <button
              key={s}
              type="button"
              disabled={isPending || status === s || closed}
              onClick={() => changeStatus(s)}
              className="rounded-full px-3 py-1 text-[12px] font-bold"
              style={status === s ? { background: LAYANAN_STATUS[s].color, color: '#fff' } : { background: LAYANAN_STATUS[s].bg, color: LAYANAN_STATUS[s].color }}
            >
              {LAYANAN_STATUS[s].label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5 rounded-2xl px-3 py-4 sm:px-4" style={{ background: '#f3efe5', minHeight: 240 }}>
        {messages.length === 0 ? <p className="py-8 text-center text-[13px]" style={{ color: '#5b543f' }}>Belum ada pesan. Tulis kebutuhanmu di bawah.</p> : null}
        {messages.map((m) => {
          const mine = m.sender_id === myId
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5" style={mine ? { background: '#1a1305', color: '#f5f3ee' } : { background: '#ffffff', color: '#1f1a10' }}>
                {!mine ? (
                  <div className="mb-0.5 text-[11px] font-bold" style={{ color: m.sender_is_staff ? '#9c7a3f' : '#3b5b8a' }}>
                    {m.sender_name}
                    {m.sender_is_staff ? ' · Pengurus' : ''}
                  </div>
                ) : null}
                {m.body ? <p className="whitespace-pre-line text-[13.5px]">{m.body}</p> : null}
                {m.file_name ? (
                  <div className="mt-1.5 flex flex-col gap-1.5">
                    {m.preview_url ? (
                      <button type="button" onClick={() => void openFile(m.id, false)} className="overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.preview_url} alt={m.file_name} loading="lazy" className="max-h-56 w-full object-cover" />
                      </button>
                    ) : null}
                    <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2" style={{ background: mine ? 'rgba(255,255,255,0.08)' : '#faf7f0' }}>
                      <FileIcon type={m.file_type} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px] font-bold">{m.file_name}</div>
                        <div className="text-[11px]" style={{ opacity: 0.7 }}>{fileSizeLabel(m.file_size)}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[12px] font-bold">
                      <button type="button" onClick={() => void openFile(m.id, false)} style={{ color: mine ? 'var(--brand-accent)' : '#9c7a3f' }}>Buka</button>
                      <button type="button" onClick={() => void openFile(m.id, true)} style={{ color: mine ? 'var(--brand-accent)' : '#9c7a3f' }}>Unduh</button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-1 text-right text-[10.5px]" style={{ opacity: 0.6 }}>{time(m.created_at)}</div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {closed ? (
        <p className="rounded-xl px-4 py-3 text-center text-[13px]" style={{ background: '#ffffff', color: '#5b543f' }}>Permintaan ini sudah dibatalkan.</p>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl px-3 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.1)' }}>
          {file ? (
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: '#faf7f0' }}>
              <FileIcon type={guessType(file)} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{file.name}</div>
                <div className="text-[11px]" style={{ color: '#9c7a3f' }}>{isImage(file) ? 'Foto akan dikompres otomatis (maks 2 MB)' : fileSizeLabel(file.size)}</div>
              </div>
              <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
                Hapus
              </button>
            </div>
          ) : null}
          <textarea
            value={text}
            maxLength={2000}
            rows={2}
            onChange={(e) => setText(e.target.value)}
            placeholder={isStaff ? 'Balas warga, atau lampirkan surat yang sudah ditandatangani…' : 'Tulis pesan untuk Pengurus…'}
            aria-label="Pesan"
            className="w-full resize-none rounded-xl px-3 py-2 text-[13.5px]"
            style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10', outline: 'none' }}
          />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg px-3 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}>
              Lampirkan file
              <input ref={fileRef} type="file" accept={ACCEPT_ATTR} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
            </label>
            <span className="hidden flex-1 text-[11px] sm:block" style={{ color: '#9c7a3f' }}>PDF, Word, JPG, PNG</span>
            <button
              type="button"
              disabled={busy || (!text.trim() && !file)}
              onClick={() => void send()}
              className="ml-auto rounded-lg px-5 py-2 text-[13px] font-bold"
              style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: busy || (!text.trim() && !file) ? 0.6 : 1 }}
            >
              {busy ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
          {error ? <p className="text-[12px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}
          {isRequester && status !== 'selesai' ? (
            <button type="button" disabled={isPending} onClick={() => changeStatus('dibatalkan')} className="self-start text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
              Batalkan permintaan
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}