'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { confirmFamilyMember } from '@/app/dashboard/family-actions'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'

type FamilyRequest = {
  id: string
  name: string
  family_role: string | null
  created_at: string
}

const FAMILY_ROLE_LABEL: Record<string, string> = {
  anggota_keluarga: 'Anggota Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

export default function FamilyRequestList({
  requests,
  houseLabel,
  canConfirm,
}: {
  requests: FamilyRequest[]
  houseLabel: string | null
  canConfirm: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()

  if (requests.length === 0) return null

  async function decide(r: FamilyRequest, approve: boolean) {
    const question = approve
      ? `Konfirmasi ${r.name} sebagai penghuni Rumah ${houseLabel ?? ''}?`
      : `Tolak ${r.name}? Tolak hanya kalau orang ini BUKAN penghuni rumahmu.`
    if (!(await confirmModal(question))) return
    setBusyId(r.id)
    startTransition(async () => {
      const result = await confirmFamilyMember(r.id, approve)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div id="permintaan-keluarga" className="mb-6 scroll-mt-24 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Permintaan Bergabung ke Rumah {houseLabel ?? ''} ({requests.length})
      </div>
      {!canConfirm ? (
        <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>
          Kamu bisa mengonfirmasi setelah akunmu sendiri diverifikasi Pengurus.
        </p>
      ) : null}
      <div className="mt-2 flex flex-col">
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{r.name}</div>
              <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                {FAMILY_ROLE_LABEL[r.family_role ?? ''] ?? 'Penghuni'} · daftar{' '}
                {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
                  style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
                >
                  {isPending && busyId === r.id ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}