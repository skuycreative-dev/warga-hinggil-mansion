'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Account = { id: string; full_name: string; role: string; created_at: string }
type RoleOption = { value: string; label: string }

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '9px',
  padding: '7px 10px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function AdminAccountTable({
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

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Role</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada akun.
              </td>
            </tr>
          ) : (
            accounts.map((a) => {
              const roleLabel = roleOptions.find((r) => r.value === a.role)?.label ?? a.role
              const isEditing = editingId === a.id
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                    ) : (
                      <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                        {roleOptions.map((r) => (
                          <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(212,175,106,0.16)', color: '#9c7a3f' }}
                      >
                        {roleLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: '#f2f1ec', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSave(a.id)}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: '#1a1305', color: '#e6c98a' }}
                        >
                          {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-4">
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
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
