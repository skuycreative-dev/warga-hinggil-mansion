import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AvatarUploader from '@/components/AvatarUploader'
import ProfileEditForm from '@/components/ProfileEditForm'

const occupancyLabel: Record<string, string> = {
  pemilik: 'Pemilik Rumah',
  penyewa: 'Penyewa',
  sementara: 'Tinggal Sementara',
}

const familyRoleLabel: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

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
    .select('full_name, phone, bio, avatar_url, family_role, occupancy_status, account_status, is_house_owner, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  const houseLabel = (profile as any)?.house?.nomor_rumah

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
        <div className="mb-4" style={{ marginTop: -56 }}>
          <Link
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-bold"
            style={{ color: '#f5f3ee' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <div
            className="rounded-full"
            style={{ width: 100, height: 100, border: '4px solid #faf7f0', overflow: 'hidden', background: '#e8e2d0' }}
          >
            <AvatarUploader userId={user.id} currentAvatarUrl={profile?.avatar_url ?? null} />
          </div>
        </div>

        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
            {profile?.full_name ?? 'Warga'}
          </h1>
          {profile?.is_house_owner ? (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
            >
              Pemilik
            </span>
          ) : null}
        </div>
        <p className="text-sm font-semibold" style={{ color: '#9c7a3f' }}>
          {houseLabel ? `Rumah ${houseLabel}` : 'Belum ada rumah'}
        </p>

        {profile?.bio ? (
          <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: '#3a3424' }}>
            {profile.bio}
          </p>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Peran</div>
            <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
              {familyRoleLabel[profile?.family_role ?? ''] ?? '-'}
            </div>
          </div>
          <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Status Hunian</div>
            <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
              {occupancyLabel[profile?.occupancy_status ?? ''] ?? '-'}
            </div>
          </div>
          <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Akun</div>
            <div className="mt-1 text-[12.5px] font-bold capitalize" style={{ color: '#2f8a4f' }}>
              {profile?.account_status ?? '-'}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProfileEditForm
            fullName={profile?.full_name ?? ''}
            phone={profile?.phone ?? ''}
            bio={profile?.bio ?? ''}
            familyRole={profile?.family_role ?? 'anggota_keluarga'}
            occupancyStatus={profile?.occupancy_status ?? 'pemilik'}
          />
        </div>
      </div>
    </main>
  )
}
