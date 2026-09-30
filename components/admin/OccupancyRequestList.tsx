'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm, usePromptModal } from '@/components/ModalProvider'

const STATUS_LABEL: Record<string, string> = {
  pemilik: 'Ditempati Pemilik',
  penyewa: 'Disewakan',
  sementara: 'Tinggal Sementara',
  kosong: 'Tidak Ditempati',
}

export type OccupancyRequest = {
  id: string
  house_label: string
  requester_name: string
  new_status: string
  note: string | null
  created_at: string
}

export default function OccupancyRequestList({
  requests,
  approveAction,
  rejectAction,
}: {
  requests: OccupancyRequest[]
  approveAction: (id: string, note: string) => Promise<{ error: string | null }>
  rejectAction: (id: string, note: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const confirmModal = useConfirm()
  const promptModal = usePromptModal()
  const alertModal = useAlertModal()

  function run(id: string, fn: () => Promise<{ error: string | null }>) {
    setBusyId(id)
    startTransition(async () => {
      const result = await fn()
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  async function approve(r: OccupancyRequest) {
    if (!(await confirmModal(`Setujui perubahan status hunian Rumah ${r.house_label} jadi "${STATUS_LABEL[r.new_status] ?? r.new_status}"?`))) return
    run(r.id, () => approveAction(r.id, ''))
  }

  async function reject(r: OccupancyRequest) {
    const note = await promptModal(`Alasan menolak pengajuan Rumah ${r.house_label} (opsional):`)
    if (note === null) return
    run(r.id, () => rejectAction(r.id, note))
  }

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      {requests.length === 0 ? (
        <p className="py-3 text-center text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada pengajuan status hunian.</p>
      ) : (
        requests.map((r) => {
          const busy = isPending && busyId === r.id
          return (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Rumah {r.house_label}</div>
                <div className="text-[12px] font-medium" style={{ color: '#3a3424' }}>
                  Diajukan <b>{r.requester_name}</b> -&gt; <b>{STATUS_LABEL[r.new_status] ?? r.new_status}</b>
                  {r.note ? ` · ${r.note}` : ''}
                </div>
                <div className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
                  {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={busy} onClick={() => reject(r)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
                  Tolak
                </button>
                <button type="button" disabled={busy} onClick={() => approve(r)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                  {busy ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}