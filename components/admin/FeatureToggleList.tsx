'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setFeatureEnabled } from '@/app/superadmin/fitur/actions'

type Row = { key: string; label: string; description: string; enabled: boolean; updatedAt: string | null }

export default function FeatureToggleList({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [local, setLocal] = useState<Record<string, boolean>>({})

  function toggle(row: Row) {
    const next = !(local[row.key] ?? row.enabled)
    if (row.key === 'darurat' && !next) {
      if (!confirm('Menonaktifkan Tombol Darurat berarti warga tidak bisa mengirim alert darurat. Yakin?')) return
    }
    setLocal((l) => ({ ...l, [row.key]: next }))
    setBusyKey(row.key)
    startTransition(async () => {
      const result = await setFeatureEnabled(row.key, next)
      if (result.error) {
        alert(result.error)
        setLocal((l) => ({ ...l, [row.key]: !next }))
      }
      router.refresh()
      setBusyKey(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      {rows.map((row) => {
        const on = local[row.key] ?? row.enabled
        return (
          <div key={row.key} className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{row.label}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={on ? { background: 'rgba(47,107,79,0.12)', color: '#2f6b4f' } : { background: '#f2f1ec', color: '#5b543f' }}
                >
                  {on ? 'Aktif' : 'Terkunci'}
                </span>
              </div>
              <div className="text-[12px] font-medium" style={{ color: '#5b543f' }}>{row.description}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={`${on ? 'Nonaktifkan' : 'Aktifkan'} ${row.label}`}
              disabled={isPending && busyKey === row.key}
              onClick={() => toggle(row)}
              className="relative h-7 w-12 flex-shrink-0 rounded-full transition"
              style={{ background: on ? '#1a1305' : '#d9d4c4', opacity: isPending && busyKey === row.key ? 0.6 : 1 }}
            >
              <span
                className="absolute top-1 h-5 w-5 rounded-full transition-all"
                style={{ left: on ? 26 : 4, background: on ? '#e6c98a' : '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}