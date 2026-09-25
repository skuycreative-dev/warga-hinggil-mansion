'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { votePoll, closePoll } from '@/app/polling/actions'

type Option = { id: string; option_text: string; voteCount: number }
type Poll = {
  id: string
  title: string
  description: string | null
  is_active: boolean
  options: Option[]
  totalVotes: number
  votedOptionId: string | null
}

export default function PollCard({ poll, canManage }: { poll: Poll; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const hasVoted = !!poll.votedOptionId

  function handleVote(optionId: string) {
    if (hasVoted || !poll.is_active) return
    startTransition(async () => {
      await votePoll(poll.id, optionId)
      router.refresh()
    })
  }

  function handleClose() {
    if (!confirm('Tutup polling ini? Warga tidak bisa vote lagi setelah ditutup.')) return
    startTransition(async () => {
      await closePoll(poll.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{poll.title}</div>
          {poll.description ? (
            <div className="mt-1 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{poll.description}</div>
          ) : null}
        </div>
        {!poll.is_active ? (
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(26,19,5,0.08)', color: '#5b543f' }}
          >
            Ditutup
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {poll.options.map((opt) => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
          const isMine = poll.votedOptionId === opt.id
          const showResult = hasVoted || !poll.is_active

          if (!showResult) {
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isPending}
                onClick={() => handleVote(opt.id)}
                className="rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition hover:opacity-85"
                style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}
              >
                {opt.option_text}
              </button>
            )
          }

          return (
            <div key={opt.id} className="relative overflow-hidden rounded-xl" style={{ border: isMine ? '1px solid #d4af6a' : '1px solid rgba(26,19,5,0.1)' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${pct}%`,
                  background: isMine ? 'rgba(212,175,106,0.25)' : 'rgba(26,19,5,0.06)',
                }}
              />
              <div className="relative flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-semibold" style={{ color: '#1f1a10' }}>
                  {opt.option_text} {isMine ? '✓' : ''}
                </span>
                <span className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>{pct}% ({opt.voteCount})</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{poll.totalVotes} suara</span>
        {canManage && poll.is_active ? (
          <button type="button" onClick={handleClose} disabled={isPending} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>
            Tutup Polling
          </button>
        ) : null}
      </div>
    </div>
  )
}
