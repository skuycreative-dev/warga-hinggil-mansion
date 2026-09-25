'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createForumPost, type ForumPostState } from '@/app/forum/actions'

const initialState: ForumPostState = { error: '' }

export default function ForumPostForm() {
  const [state, formAction, isPending] = useActionState(createForumPost, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isPending && !state.error) {
      formRef.current?.reset()
    }
  }, [isPending, state.error])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-6 flex flex-col gap-2.5 rounded-2xl px-4 py-4 md:px-5 md:py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <textarea
        name="content"
        rows={3}
        required
        placeholder="Tulis sesuatu untuk warga lain..."
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: '#faf7f0',
          border: '1px solid rgba(26,19,5,0.1)',
          color: '#1f1a10',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />
      {state.error ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-full px-6 py-2.5 text-sm font-bold"
        style={{
          border: 'none',
          background: '#1a1305',
          color: '#f5f3ee',
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'default' : 'pointer',
        }}
      >
        {isPending ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  )
}
