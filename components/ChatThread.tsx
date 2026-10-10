'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, sendSticker, markMessagesRead } from '@/app/chat/actions'
import StickerPicker from '@/components/StickerPicker'
import { STICKER_TEXT, stickerPathOf, stickerUrl } from '@/lib/stickers'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
  sticker_path: string | null
}

export default function ChatThread({ myId, friendId, friendName }: { myId: string; friendId: string; friendName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [showStickers, setShowStickers] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('chat_messages')
      .select('id, sender_id, content, created_at, sticker:stickers(path)')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) setMessages((data as any[]).map((m) => ({ id: m.id, sender_id: m.sender_id, content: m.content, created_at: m.created_at, sticker_path: stickerPathOf(m) })))
  }

  useEffect(() => {
    load()
    markMessagesRead(friendId)
    // Pesan masuk dikirim real-time; cek ulang berkala hanya sebagai cadangan dan hanya saat layar aktif (hemat baterai)
    const supabase = createClient()
    const channel = supabase
      .channel(`obrolan-${myId}-${friendId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${myId}` }, (payload) => {
        if ((payload.new as { sender_id?: string })?.sender_id === friendId) {
          load()
          markMessagesRead(friendId)
        }
      })
      .subscribe()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, 20000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const content = text.trim()
    if (!content) return
    setText('')
    startTransition(async () => {
      await sendMessage(friendId, content)
      await load()
    })
  }

  function handleSticker(stickerId: string) {
    setShowStickers(false)
    startTransition(async () => {
      await sendSticker(friendId, stickerId)
      await load()
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>
            Mulai obrolan dengan {friendName}
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === myId
            const isStickerMsg = m.content === STICKER_TEXT
            if (isStickerMsg) {
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                  <div className="flex flex-col" style={{ alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    {m.sticker_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={stickerUrl(m.sticker_path)} alt="Stiker" style={{ width: 128, height: 128, objectFit: 'contain' }} loading="lazy" />
                    ) : (
                      <span className="rounded-2xl px-4 py-2.5 text-[12.5px] font-medium italic" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#9c7a3f' }}>
                        Stiker sudah dihapus
                      </span>
                    )}
                    <span className="mt-0.5 text-[10px] font-semibold" style={{ color: '#9c7a3f' }}>
                      {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            }
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-[13.5px] font-medium"
                  style={{
                    background: isMine ? '#1a1305' : '#ffffff',
                    color: isMine ? '#f5f3ee' : '#1f1a10',
                    border: isMine ? 'none' : '1px solid rgba(26,19,5,0.08)',
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius: isMine ? 16 : 4,
                  }}
                >
                  {m.content}
                  <div
                    className="mt-1 text-[10px] font-semibold"
                    style={{ color: isMine ? 'rgba(245,243,238,0.55)' : '#9c7a3f', textAlign: 'right' }}
                  >
                    {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {showStickers ? (
        <div className="px-4 pb-2" style={{ background: '#faf7f0' }}>
          <StickerPicker onPick={(s) => handleSticker(s.id)} onClose={() => setShowStickers(false)} />
        </div>
      ) : null}

      <div className="flex items-center gap-2.5 border-t px-4 py-3" style={{ borderColor: 'rgba(26,19,5,0.08)', background: '#faf7f0' }}>
        <button
          type="button"
          onClick={() => setShowStickers((v) => !v)}
          aria-label="Stiker"
          aria-pressed={showStickers}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: showStickers ? 'rgba(212,175,106,0.3)' : '#ffffff', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5b543f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
            <path d="M15 3v6h6" />
            <path d="M9 13.5h.01M14 13.5h.01" />
            <path d="M9 17c1.5 1.2 4.5 1.2 6 0" />
          </svg>
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Tulis pesan..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', outline: 'none' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--brand-theme)', opacity: isPending || !text.trim() ? 0.5 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  )
}