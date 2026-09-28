'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitTukang, type SubmitTukangState } from '@/app/tukang/actions'
import { TUKANG_CATEGORIES, type TukangService } from '@/lib/tukang'
import { inputStyle, labelStyle } from '@/lib/format'

const initialState: SubmitTukangState = { error: '', success: false }

export type TukangFormValues = {
  id: string
  name: string
  specialty: string
  category: string
  phone: string
  experience_years: number | null
  price_range: string | null
  area: string | null
  description: string | null
  services: TukangService[]
}

// Tambah (tanpa `initial`) atau ubah (dengan `initial`) data tukang.
export default function TukangForm({
  initial,
  onDone,
  startOpen = false,
}: {
  initial?: TukangFormValues
  onDone?: () => void
  startOpen?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(startOpen || !!initial)
  const [services, setServices] = useState<TukangService[]>(initial?.services?.length ? initial.services : [{ name: '', price: '' }])
  const [state, formAction, isPending] = useActionState(submitTukang, initialState)

  useEffect(() => {
    if (!state.success) return
    if (initial) {
      onDone?.()
      router.refresh()
    } else if (state.id) {
      router.push(`/tukang/${state.id}`)
    }
  }, [state, initial, onDone, router])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Rekomendasikan Tukang
      </button>
    )
  }

  function updateService(i: number, key: keyof TukangService, value: string) {
    setServices((list) => list.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)))
  }

  const cleanServices = services.filter((s) => s.name.trim())

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <input type="hidden" name="id" value={initial?.id ?? ''} />
      <input type="hidden" name="services" value={JSON.stringify(cleanServices)} />

      <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{initial ? 'Ubah Data Tukang' : 'Rekomendasikan Tukang'}</div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-name">Nama tukang / usaha</label>
          <input id="tk-name" name="name" required maxLength={60} defaultValue={initial?.name} placeholder="Pak Slamet" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-cat">Kategori</label>
          <select id="tk-cat" name="category" defaultValue={initial?.category ?? 'bangunan'} style={inputStyle}>
            {TUKANG_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-spec">Keahlian</label>
          <input id="tk-spec" name="specialty" required maxLength={60} defaultValue={initial?.specialty} placeholder="Renovasi, keramik, cat tembok" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-phone">Nomor HP / WhatsApp</label>
          <input id="tk-phone" name="phone" required inputMode="tel" maxLength={20} defaultValue={initial?.phone} placeholder="0812xxxxxxxx" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-exp">Pengalaman (tahun, opsional)</label>
          <input id="tk-exp" name="experience_years" type="number" min={0} max={70} defaultValue={initial?.experience_years ?? ''} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle} htmlFor="tk-price">Perkiraan harga</label>
          <input id="tk-price" name="price_range" maxLength={60} defaultValue={initial?.price_range ?? ''} placeholder="Rp 150-250rb/hari" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label style={labelStyle} htmlFor="tk-area">Area kerja / asal (opsional)</label>
          <input id="tk-area" name="area" maxLength={80} defaultValue={initial?.area ?? ''} placeholder="Warga Blok B-15 / Ngaglik & sekitarnya" style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label style={labelStyle} htmlFor="tk-desc">Tentang (opsional)</label>
          <textarea id="tk-desc" name="description" rows={3} maxLength={1000} defaultValue={initial?.description ?? ''} placeholder="Pengalaman, jenis pekerjaan, borongan atau harian, dll." style={inputStyle} />
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl px-3.5 py-3" style={{ background: '#faf7f0' }}>
        <div className="flex items-center justify-between">
          <span style={labelStyle}>Layanan & harga (opsional)</span>
          {services.length < 15 ? (
            <button type="button" onClick={() => setServices([...services, { name: '', price: '' }])} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
              + Layanan
            </button>
          ) : null}
        </div>
        {services.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_120px_auto] items-center gap-2">
            <input value={s.name} maxLength={60} onChange={(e) => updateService(i, 'name', e.target.value)} placeholder="Pasang keramik / m²" aria-label="Nama layanan" style={{ ...inputStyle, background: '#fff' }} />
            <input value={s.price} maxLength={40} onChange={(e) => updateService(i, 'price', e.target.value)} placeholder="Rp 45.000" aria-label="Harga" style={{ ...inputStyle, background: '#fff' }} />
            <button type="button" onClick={() => setServices(services.filter((_, idx) => idx !== i))} aria-label="Hapus layanan" className="px-1 text-[15px] font-bold" style={{ color: '#b3392f' }}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
        Langsung tampil di katalog. Kamu bisa mengubah atau menghapusnya kapan saja; Pengurus bisa menghapus yang bermasalah.
      </p>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => (initial ? onDone?.() : setOpen(false))}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button type="submit" disabled={isPending} className="flex-1 rounded-xl py-3 text-sm font-bold" style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}>
          {isPending ? 'Menyimpan...' : initial ? 'Simpan' : 'Posting'}
        </button>
      </div>
    </form>
  )
}