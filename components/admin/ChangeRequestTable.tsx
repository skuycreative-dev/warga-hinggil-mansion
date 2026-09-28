'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm, usePromptModal } from '@/components/ModalProvider'

type ChangeRequest = {
  id: string
  field: string
  old_value: string | null
  new_value: string
  created_at: string
  requester?: { full_name: string | null; nickname: string | null; house?: { nomor_rumah: string } | null } | null
}

const FIELD_LABEL: Record<string, string> = {
  full_name: 'Nama Lengkap',
  occupancy_status: 'Status Hunian',
  family_role: 'Peran Keluarga',
}

const FAMILY_ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  anggota_keluarga: 'Anggota Keluarga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

const OCCUPANCY_LABEL: Record<string, string> = {
  pemilik: 'Pemilik',
  penyewa: 'Penyewa',
  sementara: 'Sementara',
}

function show(field: string, value: string | null) {
  if (!value) return '-'
  if (field === 'occupancy_status') return OCCUPANCY_LABEL[value] ?? value
  if (field === 'family_role') return FAMILY_ROLE_LABEL[value] ?? value
  return value
}

export default function ChangeRequestTable({
  requests,
  canReviewFullName,
  approveAction,
  rejectAction,
}: {
  requests: ChangeRequest[]
  canReviewFullName: boolean
  approveAction: (id: string) => Promise<{ error: string | null }>
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

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      {requests.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
          Tidak ada pengajuan perubahan data.
        </div>
      ) : (
        requests.map((r) => {
          const allowed = r.field !== 'full_name' || canReviewFullName
          const busy = isPending && busyId === r.id
          return (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
              <div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>
                  {r.requester?.nickname?.trim() || r.requester?.full_name || 'Warga'}
                  {r.requester?.house?.nomor_rumah ? (
                    <span className="font-medium" style={{ color: '#9c7a3f' }}> · Rumah {r.requester.house.nomor_rumah}</span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-[12.5px] font-medium" style={{ color: '#3a3424' }}>
                  <span className="font-bold" style={{ color: '#9c7a3f' }}>{FIELD_LABEL[r.field] ?? r.field}:</span>{' '}
                  {show(r.field, r.old_value)} → <b>{show(r.field, r.new_value)}</b>
                </div>
                <div className="text-[10.5px] font-medium" style={{ color: '#9c7a3f' }}>
                  Diajukan {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              {allowed ? (
                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      const note = await promptModal('Alasan menolak (opsional):')
                      if (note === null) return
                      run(r.id, () => rejectAction(r.id, note))
                    }}
                    className="text-[12px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    Tolak
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      if (!(await confirmModal(`Setujui perubahan ${FIELD_LABEL[r.field] ?? r.field} menjadi "${show(r.field, r.new_value)}"?`))) return
                      run(r.id, () => approveAction(r.id))
                    }}
                    className="text-[12px] font-bold"
                    style={{ color: '#2f6b4f' }}
                  >
                    {busy ? 'Memproses...' : 'Setujui'}
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>Menunggu Ketua / Superadmin</span>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}