'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceRequest, type LayananState } from '@/app/layanan/actions'
import { LAYANAN_CATEGORIES } from '@/lib/layanan'
import { inputStyle, labelStyle } from '@/lib/format'

const initialState: LayananState = { error: '', success: false }

export default function NewRequestForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('domisili')
  const [state, formAction, isPending] = useActionState(createServiceRequest, initialState)

  useEffect(() => {
    if (state.success && state.id) router.push(`/layanan/${state.id}`)
  }, [state, router])

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full rounded-xl py-3 text-sm font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
        + Ajukan Surat / Chat Pengurus
      </button>
    )
  }

  const hint = LAYANAN_CATEGORIES.find((c) => c.key === category)?.hint

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
      <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>Permintaan Baru ke Pengurus Paguyuban</div>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle} htmlFor="ly-cat">Keperluan</label>
        <select id="ly-cat" name="category" value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {LAYANAN_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        {hint ? <span className="text-[11.5px]" style={{ color: '#9c7a3f' }}>{hint}</span> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle} htmlFor="ly-subj">Judul singkat</label>
        <input id="ly-subj" name="subject" required minLength={3} maxLength={120} placeholder="mis. Surat domisili untuk buka rekening BCA" style={inputStyle} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle} htmlFor="ly-msg">Pesan (opsional)</label>
        <textarea id="ly-msg" name="message" rows={3} maxLength={2000} placeholder="Jelaskan kebutuhanmu. File KTP/KK bisa dikirim setelah ini di halaman percakapan." style={inputStyle} />
      </div>
      <p className="text-[11.5px]" style={{ color: '#5b543f' }}>
        Dikirim ke Ketua & Sekretaris Paguyuban. Mereka bisa membalas dan mengirim surat yang sudah ditandatangani (PDF/foto) langsung di percakapan ini.
      </p>
      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
      <div className="flex gap-2.5">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl py-3 text-sm font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}>
          Batal
        </button>
        <button type="submit" disabled={isPending} className="flex-1 rounded-xl py-3 text-sm font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending ? 0.7 : 1 }}>
          {isPending ? 'Mengirim...' : 'Kirim ke Pengurus'}
        </button>
      </div>
    </form>
  )
}