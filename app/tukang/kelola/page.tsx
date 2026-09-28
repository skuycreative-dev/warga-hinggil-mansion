import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import TukangKelolaTable, { type KelolaTukang } from '@/components/admin/TukangKelolaTable'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { displayName } from '@/lib/display-name'

export const dynamic = 'force-dynamic'

export default async function TukangKelolaPage() {
  const access = await getMyAccess()

  if (!access.canManageTukang) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Manajemen Perumahan dan Pengurus Paguyuban.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const [{ data: rows }, { data: reviews }] = await Promise.all([
    supabase
      .from('tukang_catalog')
      .select('id, name, specialty, category, phone, created_at, submitted_by')
      .order('created_at', { ascending: false })
      .limit(1000),
    supabase.from('tukang_reviews').select('tukang_id, rating').limit(10000),
  ])

  const submitterIds = Array.from(new Set((rows ?? []).map((r: any) => r.submitted_by as string)))
  const { data: people } = submitterIds.length
    ? await supabase.from('profiles').select('id, full_name, nickname').in('id', submitterIds)
    : { data: [] as any[] }
  const nameMap = new Map((people ?? []).map((p: any) => [p.id as string, displayName(p)]))

  const stat = new Map<string, { sum: number; count: number; low: number }>()
  ;(reviews ?? []).forEach((r: any) => {
    const s = stat.get(r.tukang_id) ?? { sum: 0, count: 0, low: 0 }
    s.sum += Number(r.rating)
    s.count += 1
    if (Number(r.rating) <= 2) s.low += 1
    stat.set(r.tukang_id, s)
  })

  const items: KelolaTukang[] = (rows ?? []).map((t: any) => {
    const s = stat.get(t.id)
    return {
      id: t.id,
      name: t.name,
      specialty: t.specialty,
      category: t.category ?? 'lainnya',
      phone: t.phone,
      created_at: t.created_at,
      submitter_name: nameMap.get(t.submitted_by) ?? 'Warga',
      avg_rating: s ? s.sum / s.count : null,
      review_count: s?.count ?? 0,
      low_reviews: s?.low ?? 0,
    }
  })

  const totalReviews = (reviews ?? []).length
  const avgAll = totalReviews ? (reviews ?? []).reduce((a: number, r: any) => a + Number(r.rating), 0) / totalReviews : 0
  const flagged = items.filter((i) => i.low_reviews > 0).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Katalog Tukang & Jasa</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Katalog Tukang
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Postingan warga langsung tampil. Pantau ulasan dan hapus postingan yang bermasalah.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Tukang" value={items.length} iconBg="#a8d8c8" iconPath="m9 12 2 2 4-4M21 12c0 4.5-3.5 8.5-9 10-5.5-1.5-9-5.5-9-10V5l9-3 9 3v7Z" />
        <StatCard label="Rating Rata-rata" value={avgAll ? `${avgAll.toFixed(1)} ★` : '-'} caption={`Dari ${totalReviews} ulasan`} iconBg="#e6c98a" iconPath="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" />
        <StatCard label="Ulasan" value={totalReviews} iconBg="#a8c8f0" iconPath="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
        <StatCard label="Perlu Dicek" value={flagged} badge={flagged ? 'CEK' : undefined} caption="Punya ulasan bintang 1-2" iconBg="#f2b8b0" iconPath="M12 8v4M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </div>

      <TukangKelolaTable items={items} />
    </AdminLayout>
  )
}