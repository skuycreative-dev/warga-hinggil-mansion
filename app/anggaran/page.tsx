import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnggaranForm from '@/components/AnggaranForm'
import AnggaranList from '@/components/AnggaranList'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function AnggaranPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canManage = !!profile && ['paguyuban', 'superadmin'].includes(profile.role)

  const { data: rows } = await supabase
    .from('iuran_transactions')
    .select('id, type, category, amount, description, transaction_date, author:profiles(full_name)')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const transactions = (rows ?? []).map((t: any) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    transaction_date: t.transaction_date,
    author_name: t.author?.full_name ?? 'Admin',
  }))

  const totalIncome = transactions.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Transparansi Keuangan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Anggaran & Iuran
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div
          className="mb-6 rounded-3xl px-6 py-7 text-center"
          style={{ background: 'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), #0a0b0f' }}
        >
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c7c9d2' }}>Saldo Saat Ini</div>
          <div className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            {formatRupiah(balance)}
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#8fd3a6' }}>Pemasukan</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalIncome)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#e6a89c' }}>Pengeluaran</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalExpense)}</div>
            </div>
          </div>
        </div>

        {canManage ? (
          <div className="mb-6">
            <AnggaranForm />
          </div>
        ) : null}

        <div className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Transaksi
        </div>
        <AnggaranList transactions={transactions} canManage={canManage} />
      </div>
    </main>
  )
}
