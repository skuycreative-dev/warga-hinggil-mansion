'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reviewRoleRequest } from '@/app/dashboard/family-actions'

export type RoleRequest = { id: string; name: string; created_at: string }

// Untuk Kepala Keluarga: penghuni rumahnya yang mengajukan jadi Ibu Rumah Tangga lewat Edit Profil
export default function RoleRequestList({
  requests,
  houseLabel,
  canConfirm,
}: {
  requests: RoleRequest[]
  houseLabel: string | null
  canConfirm: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  if (requests.length === 0) return null

  function decide(r: RoleRequest, approve: boolean) {
    const question = approve
      ? `Setujui ${r.name} sebagai Ibu Rumah Tangga di Rumah ${houseLabel ?? ''}? Ibu Rumah Tangga bisa melihat & mengelola Keuangan Rumah Tangga.`
      : `Tolak pengajuan ${r.name} menjadi Ibu Rumah Tangga?`
    if (!confirm(question)) return
    setBusyId(r.id)
    startTransition(async () => {
      const result = await reviewRoleRequest(r.id, approve)
      if (result.error) alert(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="mb-6 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Pengajuan Peran Ibu Rumah Tangga ({requests.length})
      </div>
      {!canConfirm ? (
        <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>
          Kamu bisa memproses setelah akunmu sendiri diverifikasi Pengurus.
        </p>
      ) : null}
      <div className="mt-2 flex flex-col">
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{r.name}</div>
              <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                Ingin menjadi Ibu Rumah Tangga · {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            {canConfirm ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => decide(r, false)}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
                >
                  Tolak
                </button>
                <button
                  type="button"
                  disabled={isPending && busyId === r.id}
                  onClick={() => decide(r, true)}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: '#1a1305', color: '#e6c98a' }}
                >
                  {isPending && busyId === r.id ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}