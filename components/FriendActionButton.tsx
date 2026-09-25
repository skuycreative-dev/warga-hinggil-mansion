'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '@/app/warga/actions'

type FriendState = {
  status: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  friendshipId: string | null
}

export default function FriendActionButton({ targetUserId, state }: { targetUserId: string; state: FriendState }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    startTransition(async () => {
      await sendFriendRequest(targetUserId)
      router.refresh()
    })
  }

  function handleAccept() {
    if (!state.friendshipId) return
    startTransition(async () => {
      await acceptFriendRequest(state.friendshipId!)
      router.refresh()
    })
  }

  function handleReject() {
    if (!state.friendshipId) return
    startTransition(async () => {
      await rejectFriendRequest(state.friendshipId!)
      router.refresh()
    })
  }

  if (state.status === 'accepted') {
    return (
      <div className="flex gap-2.5">
        <Link
          href={`/chat/${targetUserId}`}
          className="flex-1 rounded-xl py-2.5 text-center text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee' }}
        >
          Chat
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={handleReject}
          className="rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
        >
          Hapus Teman
        </button>
      </div>
    )
  }

  if (state.status === 'pending_sent') {
    return (
      <button type="button" disabled className="w-full rounded-xl py-2.5 text-sm font-bold" style={{ background: '#faf7f0', color: '#9c7a3f', border: '1px solid rgba(26,19,5,0.12)' }}>
        Menunggu Konfirmasi
      </button>
    )
  }

  if (state.status === 'pending_received') {
    return (
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleAccept}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold"
          style={{ background: '#2f8a4f', color: '#ffffff' }}
        >
          Terima
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleReject}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Tolak
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleAdd}
      className="w-full rounded-xl py-2.5 text-sm font-bold transition hover:opacity-90"
      style={{ background: '#1a1305', color: '#f5f3ee' }}
    >
      + Tambah Teman
    </button>
  )
}
