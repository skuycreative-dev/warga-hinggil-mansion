import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import IuranStatusPanel, { type IuranRow } from '@/components/IuranStatusPanel'

export const dynamic = 'force-dynamic'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function IuranIplPage() {
  const access = await getMyAccess()

  if (!access.canViewFinance) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Khusus Warga & Paguyuban</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Iuran IPL hanya bisa dibuka warga yang sudah terverifikasi dan pengurus Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const canManage = access.canManageFinance
  const canSeeAll = access.role !== 'warga'
  const supabase = await createClient()

  const [{ data: iuranRaw }, { data: myProfile }] = await Promise.all([
    // Database: warga hanya menerima status rumahnya sendiri, pengurus menerima semua rumah
    supabase
      .from('iuran_payment_status')
      .select('id, period, amount_due, status, paid_at, house:houses(nomor_rumah)')
      .order('period', { ascending: false })
      .limit(2000),
    supabase.from('profiles').select('house:houses(nomor_rumah)').eq('id', access.userId).maybeSingle(),
  ])

  const iuranRows: IuranRow[] = (iuranRaw ?? []).map((r: any) => {
    const house = Array.isArray(r.house) ? r.house[0] : r.house
    return {
      id: r.id,
      period: r.period,
      amount_due: Number(r.amount_due),
      status: r.status ?? 'belum',
      paid_at: r.paid_at,
      nomor_rumah: house?.nomor_rumah ?? '-',
    }
  })

  const myHouse = Array.isArray((myProfile as any)?.house) ? (myProfile as any).house[0] : (myProfile as any)?.house
  const tunggakan = iuranRows.filter((r) => r.status !== 'lunas')
  const totalTunggakan = tunggakan.reduce((s, r) => s + r.amount_due, 0)

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
              {canSeeAll ? 'Semua Rumah' : myHouse?.nomor_rumah ? `Rumah ${myHouse.nomor_rumah}` : 'Rumah Saya'}
            </span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Iuran IPL
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>Iuran Pengelolaan Lingkungan per rumah per bulan.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Belum Lunas</div>
            <div className="mt-1 text-xl font-bold" style={{ color: '#e6c98a' }}>{tunggakan.length} tagihan</div>
          </div>
          <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Tunggakan</div>
            <div className="mt-1 text-xl font-bold" style={{ color: '#1f1a10' }}>{formatRupiah(totalTunggakan)}</div>
          </div>
        </div>

        <IuranStatusPanel rows={iuranRows} canManage={canManage} canSeeAll={canSeeAll} houseLabel={myHouse?.nomor_rumah ?? null} />

        <Link
          href="/anggaran"
          className="mt-8 flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
          style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
        >
          <div>
            <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Anggaran Paguyuban</div>
            <div className="text-[12px] font-medium" style={{ color: '#5b543f' }}>Iuran yang ditandai lunas otomatis tercatat sebagai pemasukan kas.</div>
          </div>
          <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Buka →</span>
        </Link>
      </div>
    </main>
  )
}