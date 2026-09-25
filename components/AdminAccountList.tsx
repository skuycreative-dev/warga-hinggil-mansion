'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Account = { id: string; full_name: string; role: string; created_at: string }
type RoleOption = { value: string; label: string }

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '9px 11px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  width: '100%',
  outline: 'none',
}

export default function AdminAccountList({
  accounts,
  roleOptions,
  updateAction,
  deleteAction,
}: {
  accounts: Account[]
  roleOptions: RoleOption[]
  updateAction: (id: string, fullName: string, role: string) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [isPending, startTransition] = useTransition()

  function startEdit(a: Account) {
    setEditingId(a.id)
    setName(a.full_name)
    setRole(a.role)
  }

  function handleSave(id: string) {
    startTransition(async () => {
      await updateAction(id, name, role)
      router.refresh()
      setEditingId(null)
    })
  }

  function handleDelete(id: string, fullName: string) {
    if (!confirm(`Hapus akun ${fullName}? Tindakan ini permanen.`)) return
    startTransition(async () => {
      await deleteAction(id)
      router.refresh()
    })
  }

  if (accounts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada akun.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {accounts.map((a) => {
        const roleLabel = roleOptions.find((r) => r.value === a.role)?.label ?? a.role
        return (
          <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            {editingId === a.id ? (
              <div className="flex flex-col gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                    style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSave(a.id)}
                    className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                    style={{ background: '#1a1305', color: '#f5f3ee' }}
                  >
                    {isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</div>
                  <span
                    className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => startEdit(a)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(a.id, a.full_name)}
                    className="text-[12px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
