'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesRead } from '@/app/chat/actions'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatThread({ myId, friendId, friendName }: { myId: string; friendId: string; friendName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('chat_messages')
      .select('id, sender_id, content, created_at')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) setMessages(data)
  }

  useEffect(() => {
    load()
    markMessagesRead(friendId)
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
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

      <div className="flex items-center gap-2.5 border-t px-4 py-3" style={{ borderColor: 'rgba(26,19,5,0.08)', background: '#faf7f0' }}>
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
          style={{ background: '#1a1305', opacity: isPending || !text.trim() ? 0.5 : 1 }}
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
