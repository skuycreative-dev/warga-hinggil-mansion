'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm, usePromptModal } from '@/components/ModalProvider'

type Account = {
  id: string
  full_name: string
  phone: string | null
  nik: string | null
  family_role: string | null
  occupancy_status: string | null
  created_at: string
  family_status?: string | null
  house?: { nomor_rumah: string } | null
}

const FAMILY_STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  menunggu_kepala: { text: 'Menunggu Kepala Keluarga', color: '#9c7a3f', bg: 'rgba(212,175,106,0.16)' },
  dikonfirmasi: { text: 'Dikonfirmasi Kepala Keluarga', color: '#2f6b4f', bg: 'rgba(47,107,79,0.12)' },
  ditolak_kepala: { text: 'Ditolak Kepala Keluarga', color: '#b3392f', bg: 'rgba(179,57,47,0.1)' },
}

const FAMILY_ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

export default function VerifikasiAccountTable({
  accounts,
  mode,
  approveAction,
  rejectAction,
  deleteAction,
}: {
  accounts: Account[]
  mode: 'pending' | 'ditolak'
  approveAction?: (id: string, force?: boolean) => Promise<{ error: string | null; needsForce?: boolean }>
  rejectAction?: (id: string, reason: string) => Promise<{ error: string | null }>
  deleteAction?: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()
  const promptModal = usePromptModal()

  async function handleApprove(a: Account) {
    if (!approveAction) return
    if (!(await confirmModal(`Setujui akun ${a.full_name}? Semua fitur akan langsung terbuka untuk akun ini.`))) return
    setBusyId(a.id)
    startTransition(async () => {
      let result = await approveAction(a.id, false)
      if (result.needsForce) {
        if (await confirmModal(`${result.error}\n\nTetap setujui akun ${a.full_name}? Pastikan kamu sudah mengecek langsung bahwa orang ini benar penghuni rumah tersebut.`)) {
          result = await approveAction(a.id, true)
        } else {
          result = { error: null }
        }
      }
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  async function handleReject(a: Account) {
    if (!rejectAction) return
    const reason = await promptModal(`Alasan menolak akun ${a.full_name} (opsional):`)
    if (reason === null) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await rejectAction(a.id, reason)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  async function handleDelete(a: Account) {
    if (!deleteAction) return
    if (!(await confirmModal(`Hapus akun ${a.full_name} secara permanen? NIK dan emailnya akan bisa dipakai untuk daftar ulang.`, { danger: true }))) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await deleteAction(a.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      {/* overflow-x-auto: di layar HP tabelnya lebih lebar dari layar -- tanpa ini tombol Aksi
          di kolom paling kanan (Setujui/Tolak/Hapus) kepotong dan tidak bisa dijangkau sama sekali. */}
      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama & Kontak</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah & Peran</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>NIK</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                {mode === 'pending' ? 'Tidak ada akun yang menunggu verifikasi.' : 'Tidak ada akun yang ditolak.'}
              </td>
            </tr>
          ) : (
            accounts.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                <td className="px-5 py-3.5">
                  <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</div>
                  <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>{a.phone ?? '-'}</div>
                  <div className="text-[10.5px] font-medium" style={{ color: '#9c7a3f' }}>
                    Daftar {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>
                    {a.house?.nomor_rumah ? `Rumah ${a.house.nomor_rumah}` : 'Belum ada rumah'}
                  </div>
                  <div className="text-[11.5px] font-medium" style={{ color: '#5b543f' }}>
                    {a.family_role ? (FAMILY_ROLE_LABEL[a.family_role] ?? a.family_role) : '-'}
                  </div>
                  {a.family_status && FAMILY_STATUS_LABEL[a.family_status] ? (
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: FAMILY_STATUS_LABEL[a.family_status].bg, color: FAMILY_STATUS_LABEL[a.family_status].color }}
                    >
                      {FAMILY_STATUS_LABEL[a.family_status].text}
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                  {a.nik ?? '-'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex justify-end gap-4">
                    {mode === 'pending' ? (
                      <>
                        <button
                          type="button"
                          disabled={isPending && busyId === a.id}
                          onClick={() => handleReject(a)}
                          className="text-[12px] font-bold"
                          style={{ color: '#b3392f' }}
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          disabled={isPending && busyId === a.id}
                          onClick={() => handleApprove(a)}
                          className="text-[12px] font-bold"
                          style={{ color: '#2f6b4f' }}
                        >
                          {isPending && busyId === a.id ? 'Memproses...' : 'Setujui'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending && busyId === a.id}
                        onClick={() => handleDelete(a)}
                        className="text-[12px] font-bold"
                        style={{ color: '#b3392f' }}
                      >
                        {isPending && busyId === a.id ? 'Menghapus...' : 'Hapus'}
                      </button>
                    )}
                  </div>
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