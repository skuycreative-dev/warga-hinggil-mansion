import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PollCreateForm from '@/components/PollCreateForm'
import PollCard from '@/components/PollCard'

export default async function PollingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canManage = !!profile && ['paguyuban', 'superadmin'].includes(profile.role)

  const { data: polls } = await supabase
    .from('polls')
    .select('id, title, description, is_active, closes_at, image_path, created_at')
    .order('created_at', { ascending: false })

  const pollIds = (polls ?? []).map((p) => p.id)

  // Gambar polling disimpan privat: dibuat link sementara 1 jam
  const imagePaths = (polls ?? []).map((p: any) => p.image_path as string | null).filter(Boolean) as string[]
  const { data: signedImages } = imagePaths.length
    ? await supabase.storage.from('poll-images').createSignedUrls(imagePaths, 60 * 60)
    : { data: [] as any[] }
  const imageMap = new Map(
    ((signedImages ?? []) as any[]).filter((s) => s?.path && s?.signedUrl).map((s) => [s.path as string, s.signedUrl as string])
  )

  const [{ data: options }, { data: votes }] = await Promise.all([
    pollIds.length > 0
      ? supabase.from('poll_options').select('id, poll_id, option_text').in('poll_id', pollIds)
      : Promise.resolve({ data: [] as any[] }),
    pollIds.length > 0
      ? supabase.from('poll_votes').select('id, poll_id, option_id, voter_id').in('poll_id', pollIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const enrichedPolls = (polls ?? []).map((p) => {
    const pollOptions = (options ?? []).filter((o) => o.poll_id === p.id)
    const pollVotes = (votes ?? []).filter((v) => v.poll_id === p.id)
    const myVote = pollVotes.find((v) => v.voter_id === user.id)

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      // Polling yang melewati batas waktunya dianggap ditutup (sama seperti di database)
      is_active: !!p.is_active && (!p.closes_at || new Date(p.closes_at as string).getTime() > Date.now()),
      image_url: (p as any).image_path ? imageMap.get((p as any).image_path as string) ?? null : null,
      totalVotes: pollVotes.length,
      votedOptionId: myVote?.option_id ?? null,
      options: pollOptions.map((o) => ({
        id: o.id,
        option_text: o.option_text,
        voteCount: pollVotes.filter((v) => v.option_id === o.id).length,
      })),
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Suara Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Polling Warga
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {canManage ? (
          <div className="mb-6">
            <PollCreateForm userId={user.id} />
          </div>
        ) : null}

        {enrichedPolls.length > 0 ? (
          <div className="flex flex-col gap-3">
            {enrichedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} canManage={canManage} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada polling saat ini.
          </p>
        )}
      </div>
    </main>
  )
}