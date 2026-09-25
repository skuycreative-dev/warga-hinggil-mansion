'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resolveErrorLog } from '@/app/it-support/actions'

type ErrorLog = {
  id: string
  level: string
  module: string
  message: string
  resolved: boolean
  created_at: string
}

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  error: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f' },
  warning: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f' },
  info: { bg: 'rgba(168,200,240,0.3)', text: '#3a5a8a' },
}

export default function ErrorLogTable({ logs }: { logs: ErrorLog[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveErrorLog(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#0a0b0f' }}>
      {logs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#6b6552' }}>
          Belum ada log error.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 p-4">
          {logs.map((log) => {
            const style = LEVEL_STYLE[log.level] ?? LEVEL_STYLE.error
            return (
              <div key={log.id} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {log.level}
                    </span>
                    <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{log.module}</span>
                  </div>
                  {log.resolved ? (
                    <span className="text-[11px] font-bold" style={{ color: '#2f6b4f' }}>Selesai</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleResolve(log.id)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: '#e6c98a', color: '#1a1305' }}
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
                <p className="font-mono text-[12.5px]" style={{ color: '#e6e8ee' }}>{log.message}</p>
                <span className="mt-1 block text-[11px] font-medium" style={{ color: '#6b6552' }}>
                  {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
