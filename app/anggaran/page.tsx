import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { displayName } from '@/lib/display-name'
import AnggaranForm from '@/components/AnggaranForm'
import AnggaranList from '@/components/AnggaranList'
import FinanceChart, { type MonthlyFinance } from '@/components/FinanceChart'
import ExportPanel from '@/components/ExportPanel'

export const dynamic = 'force-dynamic'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

// 6 bulan terakhir (WIB), dari yang paling lama ke bulan ini
function lastSixMonths() {
  const now = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date()) + 'T00:00:00')
  const result: { key: string; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    })
  }
  return result
}

export default async function AnggaranPage() {
  const access = await getMyAccess()

  if (!access.canViewFinance) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Khusus Warga & Paguyuban</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Laporan keuangan warga hanya bisa dibuka warga yang sudah terverifikasi dan pengurus Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const canManage = access.canManageFinance
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('iuran_transactions')
    .select('id, type, category, amount, description, transaction_date, author:profiles(full_name, nickname)')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const transactions = (rows ?? []).map((t: any) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    transaction_date: t.transaction_date,
    author_name: displayName(Array.isArray(t.author) ? t.author[0] : t.author, 'Pengurus'),
  }))

  const totalIncome = transactions.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  const months: MonthlyFinance[] = lastSixMonths().map((m) => {
    const inMonth = transactions.filter((t) => String(t.transaction_date).slice(0, 7) === m.key)
    return {
      ...m,
      masuk: inMonth.filter((t) => t.type === 'pemasukan').reduce((s, t) => s + Number(t.amount), 0),
      keluar: inMonth.filter((t) => t.type === 'pengeluaran').reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Transparansi Keuangan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Anggaran Paguyuban
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div
          className="mb-6 rounded-3xl px-6 py-7 text-center"
          style={{ background: 'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), var(--brand-theme)' }}
        >
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c7c9d2' }}>Saldo Kas Paguyuban</div>
          <div className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            {formatRupiah(balance)}
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#c7c9d2' }}>Total Pemasukan</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalIncome)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#c7c9d2' }}>Total Pengeluaran</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalExpense)}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <FinanceChart months={months} />
        </div>

        <Link
          href="/iuran-ipl"
          className="mb-8 flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
          style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}
        >
          <div>
            <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Iuran IPL</div>
            <div className="text-[12px] font-medium" style={{ color: '#5b543f' }}>Tagihan & status bayar iuran per rumah ada di menu terpisah.</div>
          </div>
          <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Buka →</span>
        </Link>

        {canManage ? (
          <div className="mb-6">
            <AnggaranForm />
          </div>
        ) : null}

        <ExportPanel
          kinds={[{ key: 'anggaran', label: 'Kas Paguyuban' }]}
          defaultFrom={`${new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 4)}-01`}
          defaultTo={new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 7)}
        />

        <div className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Transaksi
        </div>
        <AnggaranList transactions={transactions} canManage={canManage} />
      </div>
    </main>
  )
}