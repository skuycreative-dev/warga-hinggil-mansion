'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ModalProvider'

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#5b543f' }

export type JabatanOption = { value: string; label: string }
export type WargaOption = { id: string; full_name: string; nickname: string | null; house: { nomor_rumah: string } | null }
export type JabatanHolder = {
  id: string
  user_id: string
  jabatan: string
  assigned_at: string
  full_name: string
  nickname: string | null
  house: { nomor_rumah: string } | null
}

function wargaLabel(w: { full_name: string; nickname: string | null; house: { nomor_rumah: string } | null }) {
  const rumah = w.house?.nomor_rumah ? ` -- Rumah ${w.house.nomor_rumah}` : ''
  const panggilan = w.nickname ? ` (${w.nickname})` : ''
  return `${w.full_name}${panggilan}${rumah}`
}

export default function JabatanManager({
  title,
  description,
  jabatanOptions,
  wargaOptions,
  holders,
  assignAction,
  revokeAction,
}: {
  title: string
  description: string
  jabatanOptions: JabatanOption[]
  wargaOptions: WargaOption[]
  holders: JabatanHolder[]
  assignAction: (targetId: string, jabatan: string) => Promise<{ error: string | null }>
  revokeAction: (targetId: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const confirmModal = useConfirm()
  const [targetId, setTargetId] = useState('')
  const [jabatan, setJabatan] = useState(jabatanOptions[0]?.value ?? '')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const sortedWarga = useMemo(() => [...wargaOptions].sort((a, b) => a.full_name.localeCompare(b.full_name)), [wargaOptions])

  function handleAssign() {
    if (!targetId) {
      setError('Pilih dulu warganya.')
      return
    }
    setError('')
    startTransition(async () => {
      const result = await assignAction(targetId, jabatan)
      if (result.error) {
        setError(result.error)
      } else {
        setTargetId('')
        router.refresh()
      }
    })
  }

  async function handleRevoke(userId: string, fullName: string) {
    if (!(await confirmModal(`Cabut jabatan "${fullName}"? Akun ini akan kembali jadi warga biasa (data & riwayat sebagai warga tetap tersimpan).`, { danger: true })))
      return
    startTransition(async () => {
      await revokeAction(userId)
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          {title}
        </div>
        <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama</th>
                <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Jabatan</th>
                <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {holders.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                    Belum ada yang menjabat.
                  </td>
                </tr>
              ) : (
                holders.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                    <td className="px-5 py-3.5">
                      <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{h.full_name}</span>
                      {h.house?.nomor_rumah ? (
                        <span className="ml-1.5 text-[12px] font-medium" style={{ color: '#9c7a3f' }}>-- Rumah {h.house.nomor_rumah}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(212,175,106,0.16)', color: '#9c7a3f' }}
                      >
                        {jabatanOptions.find((j) => j.value === h.jabatan)?.label ?? h.jabatan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRevoke(h.user_id, h.full_name)}
                        className="text-[12px] font-bold"
                        style={{ color: '#b3392f' }}
                      >
                        Cabut Jabatan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div>
        <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--brand-theme)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Angkat Jabatan Baru</span>
          </div>

          <p className="mb-3 text-[12px] leading-relaxed" style={{ color: '#5b543f' }}>{description}</p>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label style={labelStyle}>Pilih Warga Aktif</label>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={inputStyle}>
                <option value="">-- Pilih warga --</option>
                {sortedWarga.map((w) => (
                  <option key={w.id} value={w.id} style={{ color: '#1a1305' }}>
                    {wargaLabel(w)}
                  </option>
                ))}
              </select>
              {sortedWarga.length === 0 ? (
                <p className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                  Tidak ada warga aktif yang belum menjabat.
                </p>
              ) : null}
            </div>

            {jabatanOptions.length > 1 ? (
              <div className="flex flex-col gap-1.5">
                <label style={labelStyle}>Jabatan</label>
                <select value={jabatan} onChange={(e) => setJabatan(e.target.value)} style={inputStyle}>
                  {jabatanOptions.map((j) => (
                    <option key={j.value} value={j.value} style={{ color: '#1a1305' }}>
                      {j.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

            <button
              type="button"
              disabled={isPending || !targetId}
              onClick={handleAssign}
              className="mt-1 w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending || !targetId ? 0.6 : 1 }}
            >
              {isPending ? 'Menyimpan...' : '+ Angkat Jabatan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}