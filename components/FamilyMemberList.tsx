'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useAlertModal, useConfirm } from '@/components/ModalProvider'

export type NonAccountMember = {
  id: string
  name: string
  relation: string
  birth_date: string | null
  note: string | null
}

const RELATION_LABEL: Record<string, string> = {
  anak: 'Anak',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  orang_tua: 'Orang Tua',
  kerabat: 'Kerabat',
  lainnya: 'Lainnya',
}

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

function age(birthDate: string | null) {
  if (!birthDate) return null
  const diff = Date.now() - new Date(`${birthDate}T00:00:00`).getTime()
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  return years
}

type FormState = { name: string; relation: string; birthDate: string; note: string }
const EMPTY_FORM: FormState = { name: '', relation: 'anak', birthDate: '', note: '' }

export default function FamilyMemberList({
  members,
  isManager,
  saveAction,
  deleteAction,
}: {
  members: NonAccountMember[]
  isManager: boolean
  saveAction: (id: string | null, input: { name: string; relation: string; birthDate: string; note: string }) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<{ error: string | null }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState('')
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(m: NonAccountMember) {
    setEditingId(m.id)
    setForm({ name: m.name, relation: m.relation, birthDate: m.birth_date ?? '', note: m.note ?? '' })
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    setError('')
    startTransition(async () => {
      const result = await saveAction(editingId, form)
      if (result.error) {
        setError(result.error)
        return
      }
      setShowForm(false)
      router.refresh()
    })
  }

  async function handleDelete(m: NonAccountMember) {
    if (!(await confirmModal(`Hapus data ${m.name} dari daftar keluarga rumah ini?`, { danger: true }))) return
    startTransition(async () => {
      const result = await deleteAction(m.id)
      if (result.error) await alertModal(result.error)
      router.refresh()
    })
  }

  return (
    <section className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Anggota Keluarga Tanpa Akun</h2>
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: '#5b543f' }}>
            Anak kecil, ART, atau penghuni lain yang tidak mendaftar akun sendiri. Ikut dihitung di statistik jumlah penghuni
            dan jadi kontak saat keadaan darurat rumah ini.
          </p>
        </div>
      </div>

      {members.length === 0 && !showForm ? (
        <p className="text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>Belum ada data.</p>
      ) : null}

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5" style={{ background: '#faf7f0' }}>
            <div className="min-w-0">
              <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{m.name}</div>
              <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                {RELATION_LABEL[m.relation] ?? m.relation}
                {age(m.birth_date) !== null ? ` · ${age(m.birth_date)} tahun` : ''}
                {m.note ? ` · ${m.note}` : ''}
              </div>
            </div>
            {isManager ? (
              <div className="flex flex-shrink-0 gap-3">
                <button type="button" onClick={() => openEdit(m)} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>Ubah</button>
                <button type="button" disabled={isPending} onClick={() => handleDelete(m)} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>Hapus</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {isManager ? (
        showForm ? (
          <div className="mt-4 flex flex-col gap-2.5 rounded-xl px-4 py-4" style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.08)' }}>
            <input type="text" placeholder="Nama" value={form.name} maxLength={100} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <select value={form.relation} onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))} style={inputStyle}>
              {Object.entries(RELATION_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2.5">
              <input type="date" value={form.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))} style={inputStyle} />
              <input type="text" placeholder="Catatan (opsional)" value={form.note} maxLength={200} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} style={inputStyle} />
            </div>
            {error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#efe9db', color: '#5b543f' }}>Batal</button>
              <button type="button" disabled={isPending} onClick={handleSave} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending ? 0.7 : 1 }}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={openAdd} className="mt-3 w-full rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#efe9db', color: '#1f1a10' }}>
            + Tambah Anggota Keluarga
          </button>
        )
      ) : null}
    </section>
  )
}