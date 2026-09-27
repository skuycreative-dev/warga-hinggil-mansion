'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Account = {
  id: string
  full_name: string
  phone: string | null
  nik: string | null
  family_role: string | null
  occupancy_status: string | null
  created_at: string
  house?: { nomor_rumah: string } | null
}

const FAMILY_ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
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
  approveAction?: (id: string) => Promise<{ error: string | null }>
  rejectAction?: (id: string, reason: string) => Promise<{ error: string | null }>
  deleteAction?: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)

  function handleApprove(a: Account) {
    if (!approveAction) return
    if (!confirm(`Setujui akun ${a.full_name}? Semua fitur akan langsung terbuka untuk akun ini.`)) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await approveAction(a.id)
      if (result.error) alert(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  function handleReject(a: Account) {
    if (!rejectAction) return
    const reason = window.prompt(`Alasan menolak akun ${a.full_name} (opsional):`, '')
    if (reason === null) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await rejectAction(a.id, reason)
      if (result.error) alert(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  function handleDelete(a: Account) {
    if (!deleteAction) return
    if (!confirm(`Hapus akun ${a.full_name} secara permanen? NIK dan emailnya akan bisa dipakai untuk daftar ulang.`)) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await deleteAction(a.id)
      if (result.error) alert(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
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
  )
}