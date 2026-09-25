'use client'

import { useActionState, useState } from 'react'
import { updateProfile, type UpdateProfileState } from '@/app/profile/actions'

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

const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none', WebkitAppearance: 'none' }
const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export default function ProfileEditForm({
  fullName,
  phone,
  bio,
  familyRole,
  occupancyStatus,
}: {
  fullName: string
  phone: string
  bio: string
  familyRole: string
  occupancyStatus: string
}) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full rounded-xl py-3 text-sm font-bold"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        Edit Profil
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Lengkap</label>
        <input type="text" name="full_name" defaultValue={fullName} required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP</label>
        <input type="text" name="phone" defaultValue={phone} required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Bio (opsional)</label>
        <textarea name="bio" defaultValue={bio} rows={2} placeholder="Ceritakan sedikit tentang kamu..." style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Peran dalam Keluarga</label>
        <select name="family_role" defaultValue={familyRole} required style={selectStyle}>
          <option value="kepala_keluarga">Kepala Keluarga</option>
          <option value="anggota_keluarga">Anggota Keluarga</option>
          <option value="asisten_rumah_tangga">Asisten Rumah Tangga</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Status Hunian</label>
        <select name="occupancy_status" defaultValue={occupancyStatus} required style={selectStyle}>
          <option value="pemilik">Pemilik</option>
          <option value="penyewa">Penyewa</option>
          <option value="sementara">Sementara</option>
        </select>
      </div>

      {state.error ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>Profil berhasil diperbarui.</p>
      ) : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}
