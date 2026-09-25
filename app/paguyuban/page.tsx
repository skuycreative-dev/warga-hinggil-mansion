import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'

const ALLOWED_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/paguyuban' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default async function PaguyubanDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Paguyuban.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: transactions } = await supabase
    .from('iuran_transactions')
    .select('id, type, category, amount, description, transaction_date')
    .order('transaction_date', { ascending: false })
    .limit(200)

  const allTx = transactions ?? []
  const totalPemasukan = allTx.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalPengeluaran = allTx.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)
  const saldo = totalPemasukan - totalPengeluaran

  const now = new Date()
  const bulanIniTx = allTx.filter((t) => {
    const d = new Date(t.transaction_date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const pemasukanBulanIni = bulanIniTx.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const pengeluaranBulanIni = bulanIniTx.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)

  const { count: rumahKosong } = await supabase
    .from('houses')
    .select('id', { count: 'exact', head: true })
    .eq('is_empty_flagged', true)

  const { count: pollingAktif } = await supabase
    .from('polls')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const recentTx = allTx.slice(0, 6)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Ketua Paguyuban'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Paguyuban
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Fokus: anggaran/iuran, polling, pengumuman, kelola katalog tukang.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Saldo Kas Warga"
          value={formatRupiah(saldo)}
          iconBg="#a8d8c8"
          iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(pemasukanBulanIni)}
          iconBg="#a8c8f0"
          iconPath="M12 19V5M5 12l7-7 7 7"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(pengeluaranBulanIni)}
          iconBg="#f2b8b0"
          iconPath="M12 5v14M5 12l7 7 7-7"
        />
        <StatCard
          label="Rumah Kosong"
          value={rumahKosong ?? 0}
          caption="Terpantau security"
          iconBg="#e6c98a"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Transaksi Terbaru</span>
            <Link href="/anggaran" className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>Lihat Semua</Link>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <table className="w-full border-collapse text-left">
              <tbody>
                {recentTx.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>Belum ada transaksi.</td>
                  </tr>
                ) : (
                  recentTx.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                      <td className="px-5 py-3.5">
                        <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{t.category}</div>
                        <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                          {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13.5px] font-bold" style={{ color: t.type === 'pemasukan' ? '#2f6b4f' : '#b3392f' }}>
                        {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(Number(t.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Polling Aktif ({pollingAktif ?? 0})
          </div>
          <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
            <p className="mb-3 text-[13px] font-medium" style={{ color: '#5b543f' }}>
              {(pollingAktif ?? 0) > 0
                ? `Ada ${pollingAktif} polling yang masih berjalan. Kelola atau tutup dari halaman Polling Warga.`
                : 'Tidak ada polling aktif saat ini.'}
            </p>
            <Link
              href="/polling"
              className="block rounded-xl py-2.5 text-center text-[12.5px] font-bold"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              Kelola Polling
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
