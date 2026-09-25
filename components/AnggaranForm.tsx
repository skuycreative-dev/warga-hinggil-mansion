'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction, type AddTransactionState } from '@/app/anggaran/actions'

const initialState: AddTransactionState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export default function AnggaranForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: AddTransactionState, formData: FormData) => {
    const result = await addTransaction(prev, formData)
    if (result.success) {
      router.refresh()
    }
    return result
  }, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Tambah Transaksi
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Jenis</label>
        <select name="type" defaultValue="pemasukan" required style={inputStyle}>
          <option value="pemasukan" style={{ color: '#1a1305' }}>Pemasukan</option>
          <option value="pengeluaran" style={{ color: '#1a1305' }}>Pengeluaran</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Kategori</label>
        <input type="text" name="category" required placeholder="Iuran Bulanan, Kebersihan, Perbaikan, dll" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nominal (Rp)</label>
        <input type="number" name="amount" required min="1" step="1" placeholder="500000" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Tanggal</label>
        <input type="date" name="transaction_date" required defaultValue={new Date().toISOString().slice(0, 10)} style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keterangan (opsional)</label>
        <textarea name="description" rows={2} placeholder="Detail transaksi..." style={inputStyle} />
      </div>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
      {state.success ? <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>Transaksi berhasil ditambahkan.</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Tutup
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
