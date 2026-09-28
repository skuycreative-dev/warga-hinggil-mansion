import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import { rupiah } from '@/lib/format'
import { OCCUPANCY_OPTIONS } from '@/lib/hunian'

export const dynamic = 'force-dynamic'

const VERIF_LABEL: Record<string, { text: string; color: string }> = {
  aktif: { text: 'Aktif', color: '#2f6b4f' },
  menunggu_verifikasi: { text: 'Menunggu Verifikasi', color: '#9c7a3f' },
  ditolak: { text: 'Ditolak', color: '#b3392f' },
  pindah: { text: 'Pindah (menunggu dihapus)', color: '#7a5a1f' },
  dihapus: { text: 'Dihapus', color: '#6b6552' },
}

function monthKey(iso: string) {
  return iso.slice(0, 7)
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
}

export default async function StatistikPage() {
  const access = await getMyAccess()

  if (!access.canVerifyAccounts) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>
            Halaman ini khusus Superadmin, Admin Paguyuban, dan Sekretaris Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()

  const [{ data: peopleRaw }, { count: nonAccountCount }, { data: housesRaw }, { data: iplRaw }, { data: complaintsRaw }] = await Promise.all([
    supabase.from('profiles').select('id, role, account_status, family_role, created_at').eq('role', 'warga').limit(5000),
    supabase.from('family_members').select('id', { count: 'exact', head: true }),
    supabase.from('houses').select('id, occupancy_status').limit(3000),
    supabase.from('iuran_payment_status').select('status, amount_due, late_fee, amount_paid').limit(5000),
    supabase.from('complaints').select('id, status').limit(5000),
  ])

  const people = peopleRaw ?? []
  const houses = housesRaw ?? []
  const iplRows = iplRaw ?? []
  const complaints = complaintsRaw ?? []

  // --- Jumlah KK & total warga (Kebutuhan #10 + #11: termasuk anggota keluarga tanpa akun) ---
  const activeWarga = people.filter((p: any) => p.account_status === 'aktif')
  const jumlahKK = activeWarga.filter((p: any) => p.family_role === 'kepala_keluarga').length
  const totalWargaAkun = activeWarga.length
  const totalNonAkun = nonAccountCount ?? 0
  const totalPenghuni = totalWargaAkun + totalNonAkun

  // --- Rincian status hunian ---
  const occCount = new Map<string, number>()
  houses.forEach((h: any) => occCount.set(h.occupancy_status ?? 'kosong', (occCount.get(h.occupancy_status ?? 'kosong') ?? 0) + 1))

  // --- Status verifikasi akun ---
  const verifCount = new Map<string, number>()
  people.forEach((p: any) => verifCount.set(p.account_status, (verifCount.get(p.account_status) ?? 0) + 1))

  // --- Tren pendaftaran, 6 bulan terakhir ---
  const months: string[] = []
  const base = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const trendCount = new Map<string, number>(months.map((m) => [m, 0]))
  people.forEach((p: any) => {
    if (!p.created_at) return
    const key = monthKey(p.created_at)
    if (trendCount.has(key)) trendCount.set(key, (trendCount.get(key) ?? 0) + 1)
  })
  const maxTrend = Math.max(1, ...Array.from(trendCount.values()))

  // --- Ringkasan lunas/nunggak IPL ---
  const lunasCount = iplRows.filter((b: any) => b.status === 'lunas').length
  const belumCount = iplRows.filter((b: any) => b.status !== 'lunas').length
  const tunggakan = iplRows
    .filter((b: any) => b.status !== 'lunas')
    .reduce((s: number, b: any) => s + Math.max(Number(b.amount_due) + Number(b.late_fee ?? 0) - Number(b.amount_paid ?? 0), 0), 0)

  // --- Pengaduan aktif ---
  const pengaduanAktif = complaints.filter((c: any) => c.status === 'diterima' || c.status === 'diproses').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Insight</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Statistik Warga
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Data per {new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Jumlah Kepala Keluarga" value={jumlahKK} iconBg="#a8c8f0" iconPath="M12 3 2 12h3v8h6v-6h2v6h6v-8h3Z" />
        <StatCard
          label="Total Penghuni"
          value={totalPenghuni}
          caption={`${totalWargaAkun} berakun · ${totalNonAkun} tanpa akun`}
          iconBg="#a8d8c8"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        />
        <StatCard
          label="Pengaduan Aktif"
          value={pengaduanAktif}
          badge={pengaduanAktif ? 'CEK' : undefined}
          iconBg="var(--brand-accent)"
          iconPath="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        />
        <StatCard
          label="Tunggakan IPL"
          value={rupiah(tunggakan)}
          caption={`${belumCount} tagihan belum lunas · ${lunasCount} lunas`}
          iconBg="#f2b8b0"
          iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Status Hunian Rumah</h2>
          <div className="flex flex-col gap-2">
            {OCCUPANCY_OPTIONS.map((o) => {
              const count = occCount.get(o.key) ?? 0
              const pct = houses.length ? Math.round((count / houses.length) * 100) : 0
              return (
                <div key={o.key}>
                  <div className="flex justify-between text-[12px]" style={{ color: '#3d3727' }}>
                    <span>{o.label}</span>
                    <b>{count} rumah ({pct}%)</b>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: '#f1ece0' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: o.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>Total {houses.length} rumah tercatat di Peta Perumahan.</p>
        </section>

        <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Status Verifikasi Akun</h2>
          <div className="flex flex-col gap-2">
            {Array.from(verifCount.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const info = VERIF_LABEL[status] ?? { text: status, color: '#5b543f' }
                const pct = people.length ? Math.round((count / people.length) * 100) : 0
                return (
                  <div key={status}>
                    <div className="flex justify-between text-[12px]" style={{ color: '#3d3727' }}>
                      <span>{info.text}</span>
                      <b>{count}</b>
                    </div>
                    <div className="mt-0.5 h-1.5 overflow-hidden rounded-full" style={{ background: '#f1ece0' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: info.color }} />
                    </div>
                  </div>
                )
              })}
          </div>
          <div className="mt-3 flex gap-2">
            <Link href="/verifikasi-akun" className="flex-1 rounded-lg py-2 text-center text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>Verifikasi Akun</Link>
            <Link href="/kelola-warga" className="flex-1 rounded-lg py-2 text-center text-[12.5px] font-bold" style={{ background: '#efe9db', color: '#1f1a10' }}>Kelola Warga Pindah</Link>
          </div>
        </section>

        <section className="rounded-2xl px-5 py-4 lg:col-span-2" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Tren Pendaftaran Warga (6 Bulan Terakhir)</h2>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {months.map((m) => {
              const count = trendCount.get(m) ?? 0
              const h = Math.max(4, Math.round((count / maxTrend) * 100))
              return (
                <div key={m} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
                  <div className="text-[11px] font-bold" style={{ color: '#1f1a10' }}>{count}</div>
                  <div className="w-full rounded-t-md" style={{ height: `${h}%`, background: '#1a1305', minHeight: 4 }} />
                  <div className="text-[10.5px] font-semibold" style={{ color: '#9c7a3f' }}>{monthLabel(m)}</div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl px-5 py-4 lg:col-span-2" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <h2 className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Ringkasan Iuran IPL</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="rounded-xl px-4 py-3" style={{ background: '#faf7f0' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Lunas</div>
              <div className="mt-1 text-xl font-bold" style={{ color: '#2f6b4f' }}>{lunasCount}</div>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: '#faf7f0' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Belum/Sebagian</div>
              <div className="mt-1 text-xl font-bold" style={{ color: '#b3392f' }}>{belumCount}</div>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: '#faf7f0' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Tunggakan</div>
              <div className="mt-1 text-xl font-bold" style={{ color: '#1f1a10' }}>{rupiah(tunggakan)}</div>
            </div>
          </div>
          <Link href="/iuran-ipl" className="mt-3 inline-block text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>Buka Iuran IPL →</Link>
        </section>
      </div>
    </AdminLayout>
  )
}