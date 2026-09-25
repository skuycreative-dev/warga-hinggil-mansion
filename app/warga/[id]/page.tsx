import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileInfoCard from '@/components/ProfileInfoCard'
import FriendActionButton from '@/components/FriendActionButton'

export default async function WargaProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (id === user.id) {
    redirect('/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url, family_role, occupancy_status, account_status, is_house_owner, house:houses(nomor_rumah)')
    .eq('id', id)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const { data: friendship } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, status')
    .or(`and(requester_id.eq.${user.id},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${user.id})`)
    .maybeSingle()

  let friendState: { status: 'none' | 'pending_sent' | 'pending_received' | 'accepted'; friendshipId: string | null } = {
    status: 'none',
    friendshipId: null,
  }

  if (friendship) {
    if (friendship.status === 'accepted') {
      friendState = { status: 'accepted', friendshipId: friendship.id }
    } else if (friendship.requester_id === user.id) {
      friendState = { status: 'pending_sent', friendshipId: friendship.id }
    } else {
      friendState = { status: 'pending_received', friendshipId: friendship.id }
    }
  }

  const houseLabel = (profile as any)?.house?.nomor_rumah ?? null

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div
        className="w-full"
        style={{
          height: 128,
          background:
            'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), #0a0b0f',
        }}
      />

      <div className="mx-auto w-full max-w-lg px-6 pb-14 md:px-10">
        <Link
          href="/warga"
          className="relative z-10 mb-3 inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: '#f5f3ee', marginTop: -120 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <ProfileInfoCard
          editable={false}
          profile={{
            userId: id,
            fullName: profile.full_name ?? 'Warga',
            phone: null,
            bio: profile.bio ?? null,
            avatarUrl: profile.avatar_url ?? null,
            familyRole: profile.family_role ?? null,
            occupancyStatus: profile.occupancy_status ?? null,
            accountStatus: profile.account_status ?? null,
            isHouseOwner: !!profile.is_house_owner,
            houseLabel,
          }}
          actionSlot={<FriendActionButton targetUserId={id} state={friendState} />}
        />
      </div>
    </main>
  )
}
