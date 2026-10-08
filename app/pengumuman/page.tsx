import Link from 'next/link'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
import AnnouncementForm from '@/components/AnnouncementForm'
import AnnouncementList from '@/components/AnnouncementList'
import { ANNOUNCEMENT_CATEGORIES, findCategory } from '@/lib/categories'

export const dynamic = 'force-dynamic'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

export default async function PengumumanPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const sp = await searchParams
  const category = ANNOUNCEMENT_CATEGORIES.some((c) => c.key === sp.k) ? (sp.k as string) : null
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  const canManage = !!myProfile && ADMIN_ROLES.includes(myProfile.role)

  let annQuery = supabase
    .from('announcements')
    .select('id, title, content, category, image_path, created_at, is_pinned, author:profiles(full_name, nickname)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)
  if (category) annQuery = annQuery.eq('category', category)
  const { data: announcementsRaw } = await annQuery

  // Gambar pengumuman disimpan privat: dibuat link sementara 1 jam
  const imagePaths = (announcementsRaw ?? []).map((a: any) => a.image_path as string | null).filter(Boolean) as string[]
  const { data: signedImages } = imagePaths.length
    ? await supabase.storage.from('announcement-images').createSignedUrls(imagePaths, 60 * 60)
    : { data: [] as any[] }
  const imageMap = new Map(((signedImages ?? []) as any[]).filter((s) => s?.path && s?.signedUrl).map((s) => [s.path as string, s.signedUrl as string]))

  const ids = (announcementsRaw ?? []).map((a: any) => a.id as string)

  // Reaksi, komentar, dan (khusus pengurus) jumlah pembaca — Step 327
  const [{ data: reactions }, { data: comments }, { data: reads }, { count: activeWarga }] = await Promise.all([
    ids.length ? supabase.from('announcement_reactions').select('announcement_id, user_id, reaction').in('announcement_id', ids).limit(20000) : Promise.resolve({ data: [] as any[] }),
    ids.length
      ? supabase.from('announcement_comments').select('id, announcement_id, user_id, body, created_at').in('announcement_id', ids).order('created_at').limit(5000)
      : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from('announcement_reads').select('announcement_id, user_id').in('announcement_id', ids).limit(50000) : Promise.resolve({ data: [] as any[] }),
    canManage
      ? supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'warga').eq('account_status', 'aktif')
      : Promise.resolve({ count: null as number | null }),
  ])

  const commenterIds = Array.from(new Set((comments ?? []).map((c: any) => c.user_id as string)))
  const { data: commenters } = commenterIds.length ? await supabase.from('profiles').select('id, full_name, nickname').in('id', commenterIds) : { data: [] as any[] }
  const nameMap = new Map((commenters ?? []).map((p: any) => [p.id as string, displayName(p)]))
  const readSet = new Set((reads ?? []).filter((r: any) => r.user_id === user.id).map((r: any) => r.announcement_id as string))

  const announcements = (announcementsRaw ?? []).map((a: any) => {
    const myReaction = (reactions ?? []).find((r: any) => r.announcement_id === a.id && r.user_id === user.id)?.reaction ?? null
    const reactionCounts: Record<string, number> = {}
    ;(reactions ?? []).filter((r: any) => r.announcement_id === a.id).forEach((r: any) => (reactionCounts[r.reaction] = (reactionCounts[r.reaction] ?? 0) + 1))
    return {
      id: a.id,
      title: a.title,
      content: a.content,
      created_at: a.created_at,
      is_pinned: !!a.is_pinned,
      category: (a.category as string) ?? 'umum',
      image_url: a.image_path ? imageMap.get(a.image_path) ?? null : null,
      author_name: displayName(Array.isArray(a.author) ? a.author[0] : a.author, 'Pengurus'),
      is_new: !readSet.has(a.id),
      my_reaction: myReaction as string | null,
      reaction_counts: reactionCounts,
      read_count: canManage ? (reads ?? []).filter((r: any) => r.announcement_id === a.id).length : null,
      comments: (comments ?? [])
        .filter((c: any) => c.announcement_id === a.id)
        .map((c: any) => ({ id: c.id as string, user_id: c.user_id as string, name: nameMap.get(c.user_id) ?? 'Warga', body: c.body as string, created_at: c.created_at as string })),
    }
  })

  // Tandai sudah dibaca setelah halaman terkirim (tidak memperlambat tampilan)
  const unreadIds = ids.filter((id) => !readSet.has(id))
  if (unreadIds.length) {
    after(async () => {
      await supabase
        .from('announcement_reads')
        .upsert(unreadIds.map((id) => ({ announcement_id: id, user_id: user.id })), { onConflict: 'announcement_id,user_id', ignoreDuplicates: true })
    })
  }

  return (
    <main className="flex w-full flex-col" style={{ background: '#faf7f0' }}>
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), var(--brand-theme)',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: 'var(--brand-accent)' }}>
            ← Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-8 pt-1 md:px-10 md:pb-10">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Informasi Warga
          </span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            Pengumuman
          </h1>
        </div>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 md:px-10 md:py-10">
          {canManage ? <AnnouncementForm userId={user.id} /> : null}

          <nav aria-label="Kategori pengumuman" className="-mx-6 mb-5 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0">
            <Link
              href="/pengumuman"
              className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
              style={!category ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
            >
              Semua
            </Link>
            {ANNOUNCEMENT_CATEGORIES.map((c) => (
              <Link
                key={c.key}
                href={`/pengumuman?k=${c.key}`}
                className="flex-shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
                style={category === c.key ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {canManage && announcements.length ? (
            <details className="mb-5 rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
              <summary className="cursor-pointer text-[13px] font-bold" style={{ color: '#1f1a10' }}>
                Kelola: ringkasan {announcements.length} pengumuman (tabel)
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12.5px]" style={{ color: '#1f1a10' }}>
                  <thead>
                    <tr style={{ color: '#9c7a3f' }}>
                      <th className="py-1.5 pr-3 font-bold">Judul</th>
                      <th className="py-1.5 pr-3 font-bold">Kategori</th>
                      <th className="py-1.5 pr-3 font-bold">Tanggal</th>
                      <th className="py-1.5 pr-3 text-right font-bold">Dibaca</th>
                      <th className="py-1.5 text-right font-bold">Komentar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((a) => (
                      <tr key={a.id} style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                        <td className="max-w-[220px] truncate py-1.5 pr-3">
                          <a href={`#p-${a.id}`} className="font-semibold">{a.is_pinned ? '[Sematan] ' : ''}{a.title}</a>
                        </td>
                        <td className="py-1.5 pr-3">{findCategory(ANNOUNCEMENT_CATEGORIES, a.category).label}</td>
                        <td className="whitespace-nowrap py-1.5 pr-3">{new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                        <td className="py-1.5 pr-3 text-right tabular-nums">
                          {a.read_count ?? 0}
                          {activeWarga ? ` / ${activeWarga}` : ''}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{a.comments.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ) : null}

          <AnnouncementList items={announcements} canManage={canManage} myId={user.id} totalWarga={activeWarga ?? null} />
        </div>
      </section>
    </main>
  )
}