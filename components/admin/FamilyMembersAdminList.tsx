'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm } from '@/components/ModalProvider'

const RELATION_LABEL: Record<string, string> = {
  anak: 'Anak',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  orang_tua: 'Orang Tua',
  kerabat: 'Kerabat',
  lainnya: 'Lainnya',
}

export type FamilyMemberRow = {
  id: string
  name: string
  relation: string
  house_label: string | null
  note: string | null
}

export default function FamilyMembersAdminList({
  members,
  deleteAction,
}: {
  members: FamilyMemberRow[]
  deleteAction: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()

  async function handleDelete(m: FamilyMemberRow) {
    if (!(await confirmModal(`Hapus data "${m.name}" dari Anggota Keluarga Tanpa Akun?`, { danger: true }))) return
    setBusyId(m.id)
    startTransition(async () => {
      const result = await deleteAction(m.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Hubungan</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada data.
              </td>
            </tr>
          ) : (
            members.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                <td className="px-5 py-3.5">
                  <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{m.name}</div>
                  {m.note ? <div className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>{m.note}</div> : null}
                </td>
                <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                  {RELATION_LABEL[m.relation] ?? m.relation}
                </td>
                <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                  {m.house_label ? `Rumah ${m.house_label}` : '-'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    type="button"
                    disabled={isPending && busyId === m.id}
                    onClick={() => handleDelete(m)}
                    className="text-[12px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    {isPending && busyId === m.id ? 'Menghapus...' : 'Hapus'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}