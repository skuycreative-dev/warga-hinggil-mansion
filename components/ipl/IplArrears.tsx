import { billOutstanding, isOverdue, sortHouse, type IplBill } from '@/lib/ipl'
import { cardStyle, periodLabel, rupiah, todayWib } from '@/lib/format'

// Rekap tunggakan IPL per rumah (semua bulan yang belum lunas)
export default function IplArrears({ bills }: { bills: IplBill[] }) {
  const today = todayWib()
  const map = new Map<string, { nomor: string; months: string[]; total: number; overdue: number }>()

  for (const b of bills) {
    const sisa = billOutstanding(b)
    if (sisa <= 0) continue
    const row = map.get(b.house_id) ?? { nomor: b.nomor_rumah, months: [], total: 0, overdue: 0 }
    row.months.push(b.period)
    row.total += sisa
    if (isOverdue(b, today)) row.overdue += 1
    map.set(b.house_id, row)
  }

  const rows = Array.from(map.values()).sort((a, b) => b.total - a.total || sortHouse(a.nomor, b.nomor))
  const grand = rows.reduce((s, r) => s + r.total, 0)

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center" style={cardStyle}>
        <div className="text-[14px] font-bold" style={{ color: '#2f6b4f' }}>Tidak ada tunggakan</div>
        <p className="mt-1 text-[12.5px]" style={{ color: '#5b543f' }}>Semua tagihan IPL sudah lunas.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={cardStyle}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
        <span className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{rows.length} rumah menunggak</span>
        <span className="text-[13px] font-bold" style={{ color: '#b3392f' }}>{rupiah(grand)}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[12.5px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
              <th className="px-4 py-2.5 font-bold" style={{ color: '#9c7a3f' }}>Rumah</th>
              <th className="px-4 py-2.5 font-bold" style={{ color: '#9c7a3f' }}>Bulan belum lunas</th>
              <th className="px-4 py-2.5 text-right font-bold" style={{ color: '#9c7a3f' }}>Tunggakan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.nomor} style={{ borderBottom: '1px solid rgba(26,19,5,0.05)' }}>
                <td className="px-4 py-2.5 font-bold" style={{ color: '#1f1a10' }}>{r.nomor}</td>
                <td className="px-4 py-2.5" style={{ color: '#5b543f' }}>
                  {r.months.length} bulan
                  {r.overdue > 0 ? <span style={{ color: '#b3392f' }}> · {r.overdue} telat</span> : null}
                  <div className="text-[11px]" style={{ color: '#9c7a3f' }}>
                    {r.months.sort().map(periodLabel).join(', ')}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-bold" style={{ color: '#b3392f' }}>{rupiah(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}