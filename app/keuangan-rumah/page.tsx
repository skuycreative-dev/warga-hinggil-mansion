import Link from 'next/link'
import { getMyHousehold } from '@/lib/household-access'
import { displayName } from '@/lib/display-name'
import HouseholdFinance, { type HouseholdTx } from '@/components/HouseholdFinance'

export const dynamic = 'force-dynamic'

export default async function KeuanganRumahPage() {
  const ctx = await getMyHousehold()

  if (!ctx.isManager || !ctx.houseId) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Khusus Kepala & Ibu Rumah Tangga</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Keuangan Rumah Tangga hanya bisa dibuka Kepala Keluarga dan Ibu Rumah Tangga (yang sudah dikonfirmasi Kepala Keluarga) di rumah yang sama.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const { data } = await ctx.supabase
    .from('household_transactions')
    .select('id, type, category, amount, description, transaction_date, author:profiles!household_transactions_created_by_fkey(full_name, nickname)')
    .eq('house_id', ctx.houseId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1000)

  const transactions: HouseholdTx[] = (data ?? []).map((t: any) => {
    const author = Array.isArray(t.author) ? t.author[0] : t.author
    return {
      id: t.id,
      type: t.type,
      category: t.category,
      amount: Number(t.amount),
      description: t.description,
      transaction_date: t.transaction_date,
      author_name: author ? displayName(author) : null,
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah {ctx.houseLabel ?? ''}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Keuangan Rumah Tangga
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Hanya terlihat oleh Kepala Keluarga dan Ibu Rumah Tangga rumah ini. Pengurus pun tidak bisa melihatnya.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <HouseholdFinance transactions={transactions} houseLabel={ctx.houseLabel} />
      </div>
    </main>
  )
}