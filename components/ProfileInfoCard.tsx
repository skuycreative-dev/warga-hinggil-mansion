import type { ReactNode } from 'react'
import AvatarUploader from '@/components/AvatarUploader'

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

export type ProfileDisplayData = {
  userId: string
  fullName: string
  phone: string | null
  bio: string | null
  avatarUrl: string | null
  familyRole: string | null
  occupancyStatus: string | null
  accountStatus: string | null
  isHouseOwner: boolean
  houseLabel: string | null
}

export default function ProfileInfoCard({
  profile,
  editable,
  actionSlot,
  children,
}: {
  profile: ProfileDisplayData
  editable: boolean
  actionSlot?: ReactNode
  children?: ReactNode
}) {
  // Nomor HP adalah data pribadi: hanya ditampilkan saat pemilik akun melihat profilnya sendiri.
  const showPhone = editable

  return (
    <>
      <div className="mb-4" style={{ marginTop: -56 }}>
        <div style={{ width: 100 }}>
          {editable ? (
            <AvatarUploader userId={profile.userId} currentAvatarUrl={profile.avatarUrl} />
          ) : (
            <div
              className="overflow-hidden rounded-full"
              style={{ width: 100, height: 100, border: '4px solid #faf7f0', background: '#e8e2d0' }}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: '#9c7a3f' }}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          {profile.fullName}
        </h1>
        {profile.isHouseOwner ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
          >
            Pemilik
          </span>
        ) : null}
      </div>
      <p className="text-sm font-semibold" style={{ color: '#9c7a3f' }}>
        {profile.houseLabel ? `Rumah ${profile.houseLabel}` : 'Belum ada rumah'}
      </p>

      {profile.bio ? (
        <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: '#3a3424' }}>
          {profile.bio}
        </p>
      ) : null}

      {actionSlot ? <div className="mt-4">{actionSlot}</div> : null}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Peran</div>
          <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
            {familyRoleLabel[profile.familyRole ?? ''] ?? '-'}
          </div>
        </div>
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Status Hunian</div>
          <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
            {occupancyLabel[profile.occupancyStatus ?? ''] ?? '-'}
          </div>
        </div>
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Akun</div>
          <div className="mt-1 text-[12.5px] font-bold capitalize" style={{ color: '#2f8a4f' }}>
            {profile.accountStatus ?? '-'}
          </div>
        </div>
        {showPhone ? (
          <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Nomor HP</div>
            <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
              {profile.phone || '-'}
            </div>
          </div>
        ) : null}
      </div>

      {children}
    </>
  )
}
