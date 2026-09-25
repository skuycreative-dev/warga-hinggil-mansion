import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/AppHeader'

export default async function SyaratKetentuanPage() {
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('app_pages')
    .select('title, content, updated_at')
    .eq('slug', 'syarat-ketentuan')
    .maybeSingle()

  const updatedAt = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <AppHeader />
      <main className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 pt-6 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold"
            style={{ color: '#9c7a3f' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-14 pt-6 md:px-10 md:pb-20">
          <div className="mb-8 md:mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Dokumen Resmi
            </span>
            <h1
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              {page?.title ?? 'Syarat & Ketentuan'}
            </h1>
            {updatedAt ? (
              <p className="mt-2 text-sm font-medium" style={{ color: '#9c7a3f' }}>
                Terakhir diperbarui: {updatedAt}
              </p>
            ) : null}
          </div>

          <div
            className="whitespace-pre-line rounded-2xl px-6 py-7 text-[15px] font-medium leading-relaxed md:px-8 md:py-9 md:text-base"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#3a3424' }}
          >
            {page?.content ?? 'Dokumen belum tersedia.'}
          </div>
        </div>
      </main>
    </>
  )
}
