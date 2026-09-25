import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ChatListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: friendships } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, full_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, full_name, avatar_url)')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friends = (friendships ?? []).map((f: any) => {
    const isRequester = f.requester_id === user.id
    const friend = isRequester ? f.addressee : f.requester
    return { id: friend.id, full_name: friend.full_name, avatar_url: friend.avatar_url }
  })

  let lastMessages: Record<string, { content: string; created_at: string; is_mine: boolean }> = {}

  if (friends.length > 0) {
    const friendIds = friends.map((f) => f.id)
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('sender_id, receiver_id, content, created_at')
      .or(
        friendIds
          .map((id) => `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
          .join(',')
      )
      .order('created_at', { ascending: false })

    for (const m of msgs ?? []) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
      if (!lastMessages[otherId]) {
        lastMessages[otherId] = { content: m.content, created_at: m.created_at, is_mine: m.sender_id === user.id }
      }
    }
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Obrolan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Pesan
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/warga" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Cari Warga</Link>
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <p className="text-sm font-medium" style={{ color: '#5b543f' }}>
              Kamu belum punya teman. Cari dan tambahkan teman dulu di halaman Warga.
            </p>
            <Link href="/warga" className="mt-3 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
              Cari Warga →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {friends.map((f) => {
              const last = lastMessages[f.id]
              return (
                <Link
                  key={f.id}
                  href={`/chat/${f.id}`}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition hover:-translate-y-0.5"
                  style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ background: '#e8e2d0' }}
                  >
                    {f.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.avatar_url} alt={f.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>{(f.full_name ?? '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{f.full_name}</div>
                    <div className="truncate text-[12px] font-medium" style={{ color: '#9c7a3f' }}>
                      {last ? `${last.is_mine ? 'Kamu: ' : ''}${last.content}` : 'Mulai obrolan'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
