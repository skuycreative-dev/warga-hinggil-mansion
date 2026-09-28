import Link from 'next/link'
import { getMyAccess } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'
import TukangForm from '@/components/TukangForm'
import TukangCatalog from '@/components/tukang/TukangCatalog'
import type { TukangSummary } from '@/lib/tukang'

export const dynamic = 'force-dynamic'

export default async function TukangPage() {
  const access = await getMyAccess()
  const supabase = await createClient()

  const [{ data: rows }, { data: ratings }] = await Promise.all([
    supabase
      .from('tukang_catalog')
      .select('id, name, specialty, category, phone, experience_years, price_range, area, description, submitted_by, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('tukang_rating_summary').select('tukang_id, avg_rating, review_count'),
  ])

  const ratingMap = new Map((ratings ?? []).map((r: any) => [r.tukang_id as string, r]))
  const items: TukangSummary[] = (rows ?? []).map((t: any) => {
    const r: any = ratingMap.get(t.id)
    return {
      ...t,
      category: t.category ?? 'lainnya',
      avg_rating: r ? Number(r.avg_rating) : null,
      review_count: r ? Number(r.review_count) : 0,
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rekomendasi Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Katalog Tukang & Jasa
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              {items.length} penyedia jasa. Lihat ulasan warga, lalu chat WA atau telepon langsung.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-4">
            {access.canManageTukang ? (
              <Link href="/tukang/kelola" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Kelola</Link>
            ) : null}
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        <div className="mb-6">
          <TukangForm />
        </div>

        <TukangCatalog items={items} myId={access.userId} />
      </div>
    </main>
  )
}