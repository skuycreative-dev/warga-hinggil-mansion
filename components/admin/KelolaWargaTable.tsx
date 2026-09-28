'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm, usePromptModal } from '@/components/ModalProvider'

type Aktif = {
  id: string
  full_name: string
  nickname: string | null
  phone: string | null
  family_role: string | null
  house: { nomor_rumah: string } | null
}

type Pindah = {
  id: string
  full_name: string
  nickname: string | null
  deactivated_at: string | null
  deactivated_reason: string | null
}

type Arsip = {
  id: string
  full_name: string
  nomor_rumah: string | null
  alasan: string | null
  dihapus_oleh_nama: string | null
  created_at: string
}

const FAMILY_ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

function fmtDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function KelolaWargaTable({
  aktif,
  pindah,
  arsip,
  deactivateAction,
  restoreAction,
  deleteAction,
}: {
  aktif: Aktif[]
  pindah: Pindah[]
  arsip: Arsip[]
  deactivateAction: (id: string, reason: string) => Promise<{ error: string | null }>
  restoreAction: (id: string) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()
  const promptModal = usePromptModal()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return aktif.slice(0, 40)
    return aktif.filter((a) => a.full_name.toLowerCase().includes(q) || (a.house?.nomor_rumah ?? '').toLowerCase().includes(q)).slice(0, 40)
  }, [aktif, query])

  async function handleDeactivate(a: Aktif) {
    const reason = await promptModal(`Alasan ${a.full_name} ditandai pindah (opsional):`)
    if (reason === null) return
    if (!(await confirmModal(`Tandai ${a.full_name} pindah dari Rumah ${a.house?.nomor_rumah ?? '-'}? Rumah ini akan langsung dilepas supaya bisa didaftarkan ke penghuni baru.`, { danger: true }))) return
    setBusyId(a.id)
    startTransition(async () => {
      const result = await deactivateAction(a.id, reason)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  async function handleRestore(p: Pindah) {
    if (!(await confirmModal(`Batalkan status pindah ${p.full_name}? Akun akan aktif lagi (rumahnya perlu dipilih ulang lewat Status Hunian).`))) return
    setBusyId(p.id)
    startTransition(async () => {
      const result = await restoreAction(p.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  async function handleDelete(p: Pindah) {
    if (!(await confirmModal(`Hapus PERMANEN akun ${p.full_name}? NIK dan emailnya akan bebas dipakai untuk pendaftaran baru. Riwayat forum/IPL/log tetap tersimpan, tapi tindakan ini tidak bisa dibatalkan.`, { danger: true }))) return
    setBusyId(p.id)
    startTransition(async () => {
      const result = await deleteAction(p.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
      setBusyId(null)
    })
  }

  return (
    <div className="flex flex-col gap-9">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Warga Aktif -- Tandai Pindah ({aktif.length})
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau nomor rumah..."
            className="rounded-lg px-3 py-1.5 text-[12.5px]"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.15)', color: '#1f1a10', width: 220 }}
          />
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama & Kontak</th>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah & Peran</th>
                <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                    {query ? 'Tidak ditemukan.' : 'Tidak ada warga aktif.'}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                    <td className="px-5 py-3.5">
                      <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</div>
                      <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>{a.phone ?? '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>
                        {a.house?.nomor_rumah ? `Rumah ${a.house.nomor_rumah}` : 'Belum ada rumah'}
                      </div>
                      <div className="text-[11.5px] font-medium" style={{ color: '#5b543f' }}>
                        {a.family_role ? (FAMILY_ROLE_LABEL[a.family_role] ?? a.family_role) : '-'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={isPending && busyId === a.id}
                        onClick={() => handleDeactivate(a)}
                        className="text-[12px] font-bold"
                        style={{ color: '#b3392f' }}
                      >
                        {isPending && busyId === a.id ? 'Memproses...' : 'Tandai Pindah'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!query && aktif.length > 40 ? (
          <p className="mt-2 text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>Menampilkan 40 dari {aktif.length}. Ketik nama/nomor rumah untuk mencari yang lain.</p>
        ) : null}
      </section>

      <section>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Sudah Ditandai Pindah -- Hapus Permanen ({pindah.length})
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama</th>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Ditandai Pindah</th>
                <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pindah.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                    Tidak ada warga yang menunggu dihapus.
                  </td>
                </tr>
              ) : (
                pindah.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                    <td className="px-5 py-3.5 text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{p.full_name}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{fmtDate(p.deactivated_at)}</div>
                      {p.deactivated_reason ? <div className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>{p.deactivated_reason}</div> : null}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          disabled={isPending && busyId === p.id}
                          onClick={() => handleRestore(p)}
                          className="text-[12px] font-bold"
                          style={{ color: '#2f6b4f' }}
                        >
                          Batalkan
                        </button>
                        <button
                          type="button"
                          disabled={isPending && busyId === p.id}
                          onClick={() => handleDelete(p)}
                          className="text-[12px] font-bold"
                          style={{ color: '#b3392f' }}
                        >
                          {isPending && busyId === p.id ? 'Menghapus...' : 'Hapus Permanen'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Arsip Warga Dihapus ({arsip.length})
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama & Rumah</th>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Alasan</th>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Dihapus Oleh</th>
              </tr>
            </thead>
            <tbody>
              {arsip.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                    Belum ada arsip.
                  </td>
                </tr>
              ) : (
                arsip.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{r.full_name}</div>
                      <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>{r.nomor_rumah ? `Rumah ${r.nomor_rumah}` : '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{r.alasan ?? '-'}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{r.dihapus_oleh_nama ?? '-'}</div>
                      <div className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>{fmtDate(r.created_at)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}