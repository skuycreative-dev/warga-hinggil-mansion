import Link from 'next/link'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
import AnnouncementForm from '@/components/AnnouncementForm'
import AnnouncementList from '@/components/AnnouncementList'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

export default async function PengumumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  const canManage = !!myProfile && ADMIN_ROLES.includes(myProfile.role)

  const { data: announcementsRaw } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, is_pinned, author:profiles(full_name, nickname)')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

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
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#e6c98a' }}>
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
          {canManage ? <AnnouncementForm /> : null}
          <AnnouncementList items={announcements} canManage={canManage} myId={user.id} totalWarga={activeWarga ?? null} />
        </div>
      </section>
    </main>
  )
}