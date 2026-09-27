'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, cancelChangeRequest, type UpdateProfileState } from '@/app/profile/actions'

const initialState: UpdateProfileState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#f2f1ec',
  color: '#5b543f',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  paddingRight: '34px',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }
const hintStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: '#9c7a3f' }

const FAMILY_ROLE_LABEL: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

const OCCUPANCY_LABEL: Record<string, string> = {
  pemilik: 'Pemilik',
  penyewa: 'Penyewa',
  sementara: 'Sementara',
}

export type PendingRequest = { id: string; field: string; new_value: string }

function SelectChevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9c7a3f"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function ProfileEditForm({
  fullName,
  nickname,
  phone,
  bio,
  nik,
  familyRole,
  occupancyStatus,
  inCompletion,
  pendingRequests,
}: {
  fullName: string
  nickname: string
  phone: string
  bio: string
  nik: string
  familyRole: string
  occupancyStatus: string
  inCompletion: boolean
  pendingRequests: PendingRequest[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [isCancelling, startCancel] = useTransition()

  const pendingName = pendingRequests.find((r) => r.field === 'full_name')
  const pendingOccupancy = pendingRequests.find((r) => r.field === 'occupancy_status')
  // Kepala Keluarga & Ibu Rumah Tangga membuka akses khusus rumah, jadi dikunci setelah terverifikasi
  const isProtectedRole = familyRole === 'kepala_keluarga' || familyRole === 'ibu_rumah_tangga'

  function handleCancel(id: string) {
    startCancel(async () => {
      const result = await cancelChangeRequest(id)
      if (result.error) alert(result.error)
      router.refresh()
    })
  }

  const pendingBox =
    pendingRequests.length > 0 ? (
      <div className="mb-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(212,175,106,0.14)', border: '1px solid rgba(212,175,106,0.4)' }}>
        <div className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>Menunggu persetujuan Pengurus</div>
        {pendingRequests.map((r) => (
          <div key={r.id} className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-[12.5px] font-medium" style={{ color: '#3a3424' }}>
              {r.field === 'full_name' ? 'Nama Lengkap' : 'Status Hunian'} →{' '}
              <b>{r.field === 'occupancy_status' ? OCCUPANCY_LABEL[r.new_value] ?? r.new_value : r.new_value}</b>
            </span>
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => handleCancel(r.id)}
              className="text-[11.5px] font-bold"
              style={{ color: '#b3392f' }}
            >
              Batalkan
            </button>
          </div>
        ))}
      </div>
    ) : null

  if (!editing) {
    return (
      <div>
        {pendingBox}
        {state.success && state.message ? (
          <p className="mb-2 text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>{state.message}</p>
        ) : null}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee' }}
        >
          Edit Profil
        </button>
      </div>
    )
  }

  return (
    <div>
      {pendingBox}
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl px-5 py-5"
        style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
      >
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Nama Panggilan</label>
          <input type="text" name="nickname" defaultValue={nickname} maxLength={30} placeholder="Contoh: Pak Budi" style={inputStyle} />
          <span style={hintStyle}>Nama ini yang dilihat warga lain. Bisa diubah kapan saja.</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Nama Lengkap (sesuai KTP)</label>
          {pendingName ? (
            <>
              <input type="text" value={pendingName.new_value} readOnly style={readOnlyStyle} />
              <input type="hidden" name="full_name" value={fullName} />
            </>
          ) : (
            <input type="text" name="full_name" defaultValue={fullName} required maxLength={100} style={inputStyle} />
          )}
          <span style={hintStyle}>
            {inCompletion
              ? 'Pastikan sesuai KTP.'
              : pendingName
                ? 'Sedang diajukan ke Pengurus.'
                : 'Mengubah Nama Lengkap perlu persetujuan Admin Paguyuban atau Superadmin.'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Nomor HP</label>
          <input type="text" name="phone" defaultValue={phone} required inputMode="tel" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>NIK (sesuai KTP)</label>
          {inCompletion ? (
            <input
              type="text"
              name="nik"
              defaultValue={nik}
              required
              maxLength={16}
              minLength={16}
              pattern="\d{16}"
              title="NIK harus 16 digit angka"
              placeholder="16 digit sesuai KTP"
              style={inputStyle}
            />
          ) : (
            <>
              <input type="text" value={nik ? `${nik.slice(0, 4)}********${nik.slice(-4)}` : '-'} readOnly style={readOnlyStyle} />
              <span style={hintStyle}>NIK hanya bisa diubah oleh Pengurus.</span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Bio (opsional)</label>
          <textarea name="bio" defaultValue={bio} rows={2} maxLength={300} placeholder="Ceritakan sedikit tentang kamu..." style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Peran dalam Keluarga</label>
          {!inCompletion && isProtectedRole ? (
            <>
              <input type="text" value={FAMILY_ROLE_LABEL[familyRole] ?? familyRole} readOnly style={readOnlyStyle} />
              <input type="hidden" name="family_role" value={familyRole} />
              <span style={hintStyle}>Peran ini hanya bisa diubah Pengurus.</span>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <select name="family_role" defaultValue={familyRole} required style={selectStyle}>
                {Object.entries(FAMILY_ROLE_LABEL)
                  .filter(([value]) => inCompletion || (value !== 'kepala_keluarga' && value !== 'ibu_rumah_tangga'))
                  .map(([value, label]) => (
                    <option key={value} value={value} style={{ color: '#1a1305', background: '#ffffff' }}>
                      {label}
                    </option>
                  ))}
              </select>
              <SelectChevron />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Status Hunian</label>
          <div style={{ position: 'relative' }}>
            <select
              name="occupancy_status"
              defaultValue={pendingOccupancy ? pendingOccupancy.new_value : occupancyStatus}
              required
              disabled={!!pendingOccupancy}
              style={pendingOccupancy ? { ...selectStyle, ...readOnlyStyle } : selectStyle}
            >
              {Object.entries(OCCUPANCY_LABEL).map(([value, label]) => (
                <option key={value} value={value} style={{ color: '#1a1305', background: '#ffffff' }}>
                  {label}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
          <span style={hintStyle}>
            {inCompletion
              ? 'Pilih sesuai kondisi sekarang.'
              : pendingOccupancy
                ? 'Sedang diajukan ke Pengurus.'
                : 'Perubahan status hunian perlu persetujuan Admin atau Sekretaris Paguyuban.'}
          </span>
        </div>

        {state.error ? (
          <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>{state.message ?? 'Profil berhasil diperbarui.'}</p>
        ) : null}

        <div className="mt-1 flex gap-2.5">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
            style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
          >
            Tutup
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
            style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
          >
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  )
}