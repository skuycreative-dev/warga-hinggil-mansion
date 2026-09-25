import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'
import ProfileInfoCard from '@/components/ProfileInfoCard'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, bio, nik, avatar_url, family_role, occupancy_status, account_status, is_house_owner, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  const houseLabel = (profile as any)?.house?.nomor_rumah ?? null

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-lg px-6 pt-4 md:px-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#9c7a3f' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Beranda
        </Link>
      </div>

      <div
        className="mt-3 w-full"
        style={{
          height: 128,
          background:
            'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), #0a0b0f',
        }}
      />

      <div className="mx-auto w-full max-w-lg px-6 pb-14 md:px-10">
        <ProfileInfoCard
          editable
          profile={{
            userId: user.id,
            fullName: profile?.full_name ?? 'Warga',
            phone: profile?.phone ?? null,
            bio: profile?.bio ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            familyRole: profile?.family_role ?? null,
            occupancyStatus: profile?.occupancy_status ?? null,
            accountStatus: profile?.account_status ?? null,
            isHouseOwner: !!profile?.is_house_owner,
            houseLabel,
          }}
        >
          <div className="mt-6">
            <ProfileEditForm
              fullName={profile?.full_name ?? ''}
              phone={profile?.phone ?? ''}
              bio={profile?.bio ?? ''}
              nik={profile?.nik ?? ''}
              familyRole={profile?.family_role ?? 'anggota_keluarga'}
              occupancyStatus={profile?.occupancy_status ?? 'pemilik'}
            />
          </div>
        </ProfileInfoCard>
      </div>
    </main>
  )
}
