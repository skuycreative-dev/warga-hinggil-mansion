import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatThread from '@/components/ChatThread'

export default async function ChatThreadPage({ params }: { params: Promise<{ friendId: string }> }) {
  const { friendId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: friendship } = await supabase
    .from('friendships')
    .select('id, status')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`)
    .eq('status', 'accepted')
    .maybeSingle()

  const { data: friendProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', friendId)
    .maybeSingle()

  if (!friendProfile) {
    notFound()
  }

  if (!friendship) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Belum Berteman</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Kamu harus berteman dulu dengan {friendProfile.full_name} untuk bisa chat.
          </p>
          <Link href={`/warga/${friendId}`} className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Lihat Profil
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex w-full flex-col" style={{ height: '100vh', background: '#faf7f0' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: '#0a0b0f' }}>
        <Link href="/chat" style={{ color: '#efe4c8' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
          style={{ background: '#e8e2d0' }}
        >
          {friendProfile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={friendProfile.avatar_url} alt={friendProfile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>{(friendProfile.full_name ?? '?').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="text-sm font-bold" style={{ color: '#efe4c8', fontFamily: 'var(--font-fraunces), serif' }}>
          {friendProfile.full_name}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatThread myId={user.id} friendId={friendId} friendName={friendProfile.full_name ?? 'Warga'} />
      </div>
    </main>
  )
}
