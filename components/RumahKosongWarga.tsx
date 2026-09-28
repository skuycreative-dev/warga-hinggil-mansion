'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { activateAbsence, endAbsence, type AbsenceState } from '@/app/rumah-kosong/actions'

type Absence = {
  id: string
  start_date: string
  end_date: string
  note: string | null
  contact_phone: string | null
}

const initialState: AbsenceState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
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

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// Tanggal dihitung dengan zona waktu WIB supaya sama di server dan di HP pengguna
function addDays(base: Date, days: number) {
  const d = new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d)
}

export default function RumahKosongWarga({ active, houseLabel }: { active: Absence | null; houseLabel: string | null }) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(activateAbsence, initialState)
  const [isEnding, startEnding] = useTransition()

  const today = addDays(new Date(), 0)

  if (active) {
    return (
      <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.3)' }}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Mode Rumah Kosong Aktif</div>
        <p className="mt-1.5 text-[15px] font-bold" style={{ color: '#1f1a10' }}>
          Rumah {houseLabel ?? ''}: {formatDate(active.start_date)} s/d {formatDate(active.end_date)}
        </p>
        {active.note ? <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>Catatan: {active.note}</p> : null}
        {active.contact_phone ? <p className="text-[13px]" style={{ color: '#5b543f' }}>Bisa dihubungi: {active.contact_phone}</p> : null}
        <p className="mt-2 text-[12px] font-medium" style={{ color: '#9c7a3f' }}>
          Security dan Pengurus Paguyuban sudah diberi tahu dan akan ikut memantau. Warga lain tidak bisa melihat status ini.
        </p>
        <button
          type="button"
          disabled={isEnding}
          onClick={() => {
            if (!confirm('Kamu sudah kembali ke rumah? Mode Rumah Kosong akan dimatikan.')) return
            startEnding(async () => {
              const result = await endAbsence(active.id)
              if (result.error) alert(result.error)
              router.refresh()
            })
          }}
          className="mt-4 w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isEnding ? 0.7 : 1 }}
        >
          {isEnding ? 'Menyimpan...' : 'Saya Sudah Kembali'}
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <p className="text-[13px] font-medium" style={{ color: '#5b543f' }}>
        Mau pergi 2 hari atau lebih? Aktifkan mode ini supaya Security dan Pengurus Paguyuban ikut memantau Rumah {houseLabel ?? ''}.
        Hanya mereka yang bisa melihatnya.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Berangkat</label>
          <input type="date" name="start_date" min={today} defaultValue={today} required style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Kembali</label>
          <input type="date" name="end_date" min={addDays(new Date(), 2)} defaultValue={addDays(new Date(), 2)} required style={inputStyle} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Catatan untuk Security (opsional)</label>
        <textarea
          name="note"
          rows={2}
          maxLength={200}
          placeholder="Contoh: lampu teras dinyalakan, kunci cadangan dititipkan ke rumah D7"
          style={inputStyle}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor yang bisa dihubungi selama pergi (opsional)</label>
        <input type="text" name="contact_phone" inputMode="tel" placeholder="08xx" style={inputStyle} />
      </div>
      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-1 w-full rounded-xl py-3 text-sm font-bold"
        style={{ background: '#b3392f', color: '#ffffff', opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? 'Menyimpan...' : 'Aktifkan Mode Rumah Kosong'}
      </button>
    </form>
  )
}