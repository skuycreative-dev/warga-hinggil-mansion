import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getMyAccess } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
import Stars from '@/components/tukang/Stars'
import TukangOwnerBar from '@/components/tukang/TukangOwnerBar'
import TukangPortfolio from '@/components/tukang/TukangPortfolio'
import TukangReviews, { type ReviewItem } from '@/components/tukang/TukangReviews'
import { categoryIcon, categoryLabel, initials, parseServices, waNumber } from '@/lib/tukang'

export const dynamic = 'force-dynamic'

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

export default async function TukangDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const access = await getMyAccess()
  const supabase = await createClient()

  const [{ data: t }, { data: photosRaw }, { data: reviewsRaw }] = await Promise.all([
    supabase
      .from('tukang_catalog')
      .select('id, name, specialty, category, phone, experience_years, price_range, area, description, services, submitted_by, created_at')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('tukang_photos').select('id, path, caption').eq('tukang_id', id).order('created_at'),
    supabase
      .from('tukang_reviews')
      .select('id, user_id, rating, comment, photo_paths, created_at, updated_at, reviewer:profiles!tukang_reviews_user_id_fkey(full_name, nickname)')
      .eq('tukang_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!t) notFound()

  const { data: poster } = await supabase.from('profiles').select('full_name, nickname').eq('id', t.submitted_by).maybeSingle()

  // Semua foto disimpan privat; tampil lewat link sementara (1 jam)
  const allPaths = [...(photosRaw ?? []).map((p: any) => p.path as string), ...(reviewsRaw ?? []).flatMap((r: any) => (r.photo_paths as string[]) ?? [])]
  const urlMap = new Map<string, string>()
  if (allPaths.length) {
    const { data: signed } = await supabase.storage.from('tukang-photos').createSignedUrls(allPaths, 60 * 60)
    ;(signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) urlMap.set(s.path, s.signedUrl)
    })
  }

  const photos = (photosRaw ?? [])
    .map((p: any) => ({ id: p.id as string, url: urlMap.get(p.path) ?? '', caption: p.caption as string | null }))
    .filter((p) => p.url)

  const reviews: ReviewItem[] = (reviewsRaw ?? []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    reviewer_name: displayName(one<any>(r.reviewer)),
    rating: Number(r.rating),
    comment: r.comment,
    photos: ((r.photo_paths as string[]) ?? []).map((path) => ({ path, url: urlMap.get(path) ?? '' })).filter((p) => p.url),
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const services = parseServices(t.services)
  const wa = waNumber(t.phone)
  const isOwner = t.submitted_by === access.userId
  const isVerifiedWarga = access.role !== 'warga' || access.accountStatus === 'aktif'
  const canReview = !isOwner && isVerifiedWarga && access.role !== 'it_support'
  const cannotReviewReason = isOwner
    ? 'Kamu tidak bisa memberi ulasan untuk tukang yang kamu posting sendiri.'
    : !isVerifiedWarga
      ? 'Ulasan bisa ditulis setelah akunmu diverifikasi Pengurus.'
      : null

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-8 sm:px-6 md:px-10">
        <Link href="/tukang" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>‹ Katalog Tukang</Link>

        <div className="mt-4 overflow-hidden rounded-3xl" style={{ background: '#1a1305' }}>
          <div className="flex items-start gap-4 px-5 py-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-[20px] font-bold" style={{ background: '#e6c98a', color: '#1a1305' }}>
              {initials(t.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold leading-tight" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f5f3ee' }}>{t.name}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-[12.5px]" style={{ color: '#d8cfb8' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={categoryIcon(t.category)} />
                </svg>
                {categoryLabel(t.category)} · {t.specialty}
              </div>
              <div className="mt-0.5 text-[12px]" style={{ color: '#b8ad92' }}>
                {[t.experience_years ? `${t.experience_years} tahun pengalaman` : null, t.area].filter(Boolean).join(' · ')}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px]">
                {reviews.length ? (
                  <>
                    <Stars value={avg} size={14} />
                    <b style={{ color: '#f5f3ee' }}>{avg.toFixed(1)}</b>
                    <span style={{ color: '#b8ad92' }}>({reviews.length} ulasan)</span>
                  </>
                ) : (
                  <span style={{ color: '#b8ad92' }}>Belum ada ulasan</span>
                )}
              </div>
            </div>
          </div>
          {t.price_range ? (
            <div className="px-5 py-3 text-[13px] font-bold" style={{ background: 'rgba(230,201,138,0.12)', color: '#e6c98a' }}>
              Perkiraan harga: {t.price_range}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {isOwner || access.canManageTukang ? (
            <TukangOwnerBar
              isOwner={isOwner}
              isAdmin={access.canManageTukang}
              values={{
                id: t.id,
                name: t.name,
                specialty: t.specialty,
                category: t.category ?? 'lainnya',
                phone: t.phone ?? '',
                experience_years: t.experience_years,
                price_range: t.price_range,
                area: t.area,
                description: t.description,
                services,
              }}
            />
          ) : null}

          {t.description ? (
            <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
              <h2 className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Tentang</h2>
              <p className="whitespace-pre-line text-[13.5px]" style={{ color: '#3d3727' }}>{t.description}</p>
            </section>
          ) : null}

          <section className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <h2 className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Layanan & Harga</h2>
            {services.length === 0 ? (
              <p className="text-[12.5px]" style={{ color: '#5b543f' }}>
                {t.price_range ? `Perkiraan: ${t.price_range}. ` : ''}Tanyakan detail harga lewat WhatsApp.
              </p>
            ) : (
              <div className="flex flex-col">
                {services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-2 text-[13px]" style={{ borderTop: i ? '1px solid rgba(26,19,5,0.06)' : undefined }}>
                    <span style={{ color: '#3d3727' }}>{s.name}</span>
                    <b className="flex-shrink-0" style={{ color: '#1f1a10' }}>{s.price || '-'}</b>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px]" style={{ color: '#9c7a3f' }}>Harga perkiraan dari pemosting, bisa berubah. Pastikan sepakat sebelum bekerja.</p>
          </section>

          <TukangPortfolio tukangId={t.id} photos={photos} canEdit={isOwner || access.canManageTukang} userId={access.userId} />

          <TukangReviews
            tukangId={t.id}
            reviews={reviews}
            userId={access.userId}
            canReview={canReview}
            cannotReviewReason={cannotReviewReason}
            canModerate={access.canManageTukang}
          />

          <p className="text-center text-[11.5px]" style={{ color: '#9c7a3f' }}>
            Diposting oleh {displayName(poster)} · {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {wa ? (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 pt-3" style={{ background: 'linear-gradient(to top, #faf7f0 70%, rgba(250,247,240,0))' }}>
          <div className="mx-auto grid max-w-2xl grid-cols-[1fr_auto] gap-2">
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${t.name}, saya warga Hinggil Mansion. Saya dapat kontak dari Katalog Tukang, ingin tanya jasa ${t.specialty}.`)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl py-3 text-center text-[14px] font-bold"
              style={{ background: '#1f7a45', color: '#ffffff' }}
            >
              Chat WhatsApp
            </a>
            <a href={`tel:+${wa}`} className="rounded-xl px-5 py-3 text-center text-[14px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
              Telepon
            </a>
          </div>
        </div>
      ) : null}
    </main>
  )
}