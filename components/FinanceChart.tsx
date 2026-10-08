'use client'

import { useState } from 'react'

export type MonthlyFinance = { key: string; label: string; masuk: number; keluar: number }

// Palet kategori tervalidasi (lolos uji buta warna & kontras): slot 1 biru, slot 2 oranye
const SERIES = [
  { id: 'masuk' as const, name: 'Pemasukan', color: '#2a78d6' },
  { id: 'keluar' as const, name: 'Pengeluaran', color: '#eb6834' },
]

const INK = { primary: '#1f1a10', secondary: '#5b543f', muted: '#9c7a3f', grid: 'rgba(26,19,5,0.08)' }
const PLOT_HEIGHT = 180

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function shortRupiah(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (value >= 1_000) return `${(value / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`
  return value.toLocaleString('id-ID')
}

// Skala sumbu dengan angka bulat (0, 500rb, 1jt, ...)
function niceScale(max: number) {
  if (max <= 0) return { top: 100_000, ticks: [0, 50_000, 100_000] }
  const rough = max / 4
  const power = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? 10 * power
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top + 0.5; v += step) ticks.push(v)
  return { top, ticks }
}

export default function FinanceChart({ months }: { months: MonthlyFinance[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const max = Math.max(0, ...months.flatMap((m) => [m.masuk, m.keluar]))
  const { top, ticks } = niceScale(max)
  const current = active !== null ? months[active] : null

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[14px] font-bold" style={{ color: INK.primary }}>Pemasukan & Pengeluaran Kas Warga</div>
          <div className="text-[11.5px] font-medium" style={{ color: INK.secondary }}>6 bulan terakhir</div>
        </div>
        <div className="flex items-center gap-3">
          {SERIES.map((s) => (
            <span key={s.id} className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: INK.secondary }}>
              <span aria-hidden style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>

      {showTable ? (
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${INK.grid}` }}>
              <th className="py-2 font-bold" style={{ color: INK.muted }}>Bulan</th>
              <th className="py-2 text-right font-bold" style={{ color: INK.muted }}>Pemasukan</th>
              <th className="py-2 text-right font-bold" style={{ color: INK.muted }}>Pengeluaran</th>
              <th className="py-2 text-right font-bold" style={{ color: INK.muted }}>Selisih</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.key} style={{ borderBottom: `1px solid ${INK.grid}` }}>
                <td className="py-2 font-semibold" style={{ color: INK.primary }}>{m.label}</td>
                <td className="py-2 text-right" style={{ color: INK.primary }}>{rupiah(m.masuk)}</td>
                <td className="py-2 text-right" style={{ color: INK.primary }}>{rupiah(m.keluar)}</td>
                <td className="py-2 text-right font-bold" style={{ color: INK.primary }}>{rupiah(m.masuk - m.keluar)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex gap-2">
          {/* Sumbu nilai */}
          <div className="relative flex-shrink-0" style={{ width: 44, height: PLOT_HEIGHT }}>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 text-[10.5px] font-medium tabular-nums"
                style={{ bottom: (t / top) * PLOT_HEIGHT - 7, color: INK.muted }}
              >
                {shortRupiah(t)}
              </span>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            {/* Garis bantu tipis */}
            <div className="relative" style={{ height: PLOT_HEIGHT }}>
              {ticks.map((t) => (
                <div key={t} className="absolute left-0 right-0" style={{ bottom: (t / top) * PLOT_HEIGHT, height: 1, background: INK.grid }} />
              ))}

              <div className="absolute inset-0 flex">
                {months.map((m, i) => (
                  <div
                    key={m.key}
                    className="relative flex flex-1 cursor-default items-end justify-center"
                    style={{ gap: 2, background: active === i ? 'rgba(212,175,106,0.10)' : 'transparent', borderRadius: 6 }}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive(active === i ? null : i)}
                    role="button"
                    tabIndex={0}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${m.label}: pemasukan ${rupiah(m.masuk)}, pengeluaran ${rupiah(m.keluar)}`}
                  >
                    {SERIES.map((s) => {
                      const value = m[s.id]
                      const height = value > 0 ? Math.max(2, (value / top) * PLOT_HEIGHT) : 0
                      return (
                        <div
                          key={s.id}
                          style={{
                            width: '38%',
                            maxWidth: 20,
                            height,
                            background: s.color,
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>

              {current ? (
                <div
                  className="pointer-events-none absolute z-10 rounded-xl px-3 py-2 text-[12px] shadow-lg"
                  style={{
                    top: 4,
                    left: `${((active ?? 0) + 0.5) * (100 / months.length)}%`,
                    transform: `translateX(${(active ?? 0) < months.length / 2 ? '0' : '-100%'})`,
                    background: 'var(--brand-theme)',
                    color: '#efe4c8',
                    minWidth: 170,
                  }}
                >
                  <div className="mb-1 font-bold">{current.label}</div>
                  {SERIES.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                        {s.name}
                      </span>
                      <span className="font-bold tabular-nums">{rupiah(current[s.id])}</span>
                    </div>
                  ))}
                  <div className="mt-1 flex justify-between gap-3 border-t pt-1" style={{ borderColor: 'rgba(230,201,138,0.2)' }}>
                    <span>Selisih</span>
                    <span className="font-bold tabular-nums">{rupiah(current.masuk - current.keluar)}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-1.5 flex">
              {months.map((m, i) => (
                <div key={m.key} className="flex-1 text-center text-[10.5px] font-semibold" style={{ color: active === i ? INK.primary : INK.muted }}>
                  {m.label.split(' ')[0].slice(0, 3)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-3 text-[12px] font-bold"
        style={{ color: INK.muted }}
      >
        {showTable ? 'Lihat grafik' : 'Lihat sebagai tabel'}
      </button>
    </div>
  )
}