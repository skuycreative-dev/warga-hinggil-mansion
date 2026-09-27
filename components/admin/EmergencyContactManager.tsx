'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { ContactFormState, ContactInput } from '@/app/kelola-nomor-darurat/actions'

type Contact = {
  id: string
  name: string
  phone: string
  description: string | null
  sort_order: number
  is_active: boolean
  updated_at: string | null
  editor?: { full_name: string } | null
}

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '9px',
  padding: '8px 10px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#5b543f' }

const PRESETS = [
  { name: 'Pos Security Hinggil Mansion', description: 'Jaga 24 jam' },
  { name: 'Ketua RT / Ketua Paguyuban', description: 'Pengurus warga' },
  { name: 'Sekretaris Paguyuban', description: 'Pengurus warga' },
]

export default function EmergencyContactManager({
  contacts,
  createAction,
  updateAction,
  setActiveAction,
  deleteAction,
}: {
  contacts: Contact[]
  createAction: (prevState: ContactFormState, formData: FormData) => Promise<ContactFormState>
  updateAction: (id: string, input: ContactInput) => Promise<{ error: string | null }>
  setActiveAction: (id: string, isActive: boolean) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ContactInput>({ name: '', phone: '', description: '', sortOrder: 0 })
  const [rowError, setRowError] = useState('')
  const [formError, setFormError] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  function startEdit(c: Contact) {
    setRowError('')
    setEditingId(c.id)
    setDraft({ name: c.name, phone: c.phone, description: c.description ?? '', sortOrder: c.sort_order })
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      const result = await updateAction(id, draft)
      if (result.error) {
        setRowError(result.error)
        return
      }
      setEditingId(null)
      setRowError('')
      router.refresh()
    })
  }

  function toggleActive(c: Contact) {
    startTransition(async () => {
      const result = await setActiveAction(c.id, !c.is_active)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  function remove(c: Contact) {
    if (!confirm(`Hapus nomor "${c.name}" (${c.phone})? Kalau hanya sementara, lebih baik pakai tombol Sembunyikan.`)) return
    startTransition(async () => {
      const result = await deleteAction(c.id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  function submitNew(formData: FormData) {
    setFormError('')
    startTransition(async () => {
      const result = await createAction({ error: '', success: false }, formData)
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setNewName('')
      setNewDescription('')
      const form = document.getElementById('emergency-contact-form') as HTMLFormElement | null
      form?.reset()
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Daftar Nomor ({contacts.length})
        </div>
        {rowError ? (
          <p className="mb-2 text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{rowError}</p>
        ) : null}
        <div className="flex flex-col gap-2.5">
          {contacts.length === 0 ? (
            <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', color: '#5b543f' }}>
              Belum ada nomor darurat.
            </div>
          ) : (
            contacts.map((c) => {
              const isEditing = editingId === c.id
              return (
                <div
                  key={c.id}
                  className="rounded-2xl px-5 py-4"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(26,19,5,0.08)',
                    opacity: c.is_active || isEditing ? 1 : 0.55,
                  }}
                >
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Nama</label>
                        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inputStyle} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Nomor Telepon</label>
                        <input
                          value={draft.phone}
                          inputMode="tel"
                          onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Keterangan</label>
                        <input
                          value={draft.description}
                          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Urutan (kecil = paling atas)</label>
                        <input
                          type="number"
                          value={draft.sortOrder}
                          onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })}
                          style={inputStyle}
                        />
                      </div>
                      <div className="flex gap-2 md:col-span-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null)
                            setRowError('')
                          }}
                          className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                          style={{ background: '#f2f1ec', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => saveEdit(c.id)}
                          className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                          style={{ background: '#1a1305', color: '#e6c98a' }}
                        >
                          {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{c.name}</span>
                          {!c.is_active ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                              style={{ background: '#f2f1ec', color: '#5b543f' }}
                            >
                              Disembunyikan
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[14px] font-bold" style={{ color: '#b3392f' }}>{c.phone}</div>
                        {c.description ? (
                          <div className="text-[12px] font-medium" style={{ color: '#5b543f' }}>{c.description}</div>
                        ) : null}
                        {c.updated_at ? (
                          <div className="mt-0.5 text-[10.5px] font-medium" style={{ color: '#9c7a3f' }}>
                            Diubah {new Date(c.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {c.editor?.full_name ? ` oleh ${c.editor.full_name}` : ''}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => startEdit(c)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => toggleActive(c)}
                          className="text-[12px] font-bold"
                          style={{ color: '#1f1a10' }}
                        >
                          {c.is_active ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => remove(c)}
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
            })
          )}
        </div>
      </div>

      <div>
        <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
          <div className="mb-3 text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Tambah Nomor</div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setNewName(p.name)
                  setNewDescription(p.description)
                }}
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{ background: 'rgba(212,175,106,0.16)', color: '#9c7a3f' }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <form id="emergency-contact-form" action={submitNew} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Nama</label>
              <input name="name" required value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Nomor Telepon</label>
              <input name="phone" required inputMode="tel" placeholder="081234567890" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Keterangan (opsional)</label>
              <input name="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Urutan (kecil = paling atas)</label>
              <input name="sort_order" type="number" defaultValue={1} style={inputStyle} />
            </div>

            {formError ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{formError}</p> : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl py-3 text-sm font-bold"
              style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Menyimpan...' : '+ Tambah Nomor'}
            </button>
            <p className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
              Nomor langsung muncul di halaman Tombol Darurat semua warga.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}