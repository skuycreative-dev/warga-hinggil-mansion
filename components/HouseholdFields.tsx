'use client'

import { useState } from 'react'

export type HouseOption = { id: string; nomor_rumah: string }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '11px',
  padding: '12px 13px',
  color: '#f5f3ee',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
}

const optionStyle: React.CSSProperties = { color: '#1a1305', background: '#ffffff' }
const labelStyle: React.CSSProperties = { fontSize: '11.5px', color: '#b9b2a0' }
const hintStyle: React.CSSProperties = { fontSize: '11px', color: '#8f8a7a', lineHeight: 1.45 }

// Pilihan peran keluarga menentukan cara memilih rumah:
// - Kepala Keluarga: mengetik nomor rumahnya sendiri
// - Peran lain: memilih dari daftar rumah yang sudah didaftarkan Kepala Keluarga,
//   lalu Kepala Keluarga mengonfirmasi (verifikasi tahap 1) sebelum disetujui Pengurus (tahap 2)
export default function HouseholdFields({ houses }: { houses: HouseOption[] }) {
  const [familyRole, setFamilyRole] = useState('kepala_keluarga')
  const isKepala = familyRole === 'kepala_keluarga'

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Peran dalam Keluarga</label>
        <select name="family_role" value={familyRole} onChange={(e) => setFamilyRole(e.target.value)} required style={selectStyle}>
          <option value="kepala_keluarga" style={optionStyle}>Kepala Keluarga</option>
          <option value="ibu_rumah_tangga" style={optionStyle}>Ibu Rumah Tangga</option>
          <option value="anggota_keluarga" style={optionStyle}>Anggota Keluarga</option>
          <option value="asisten_rumah_tangga" style={optionStyle}>Asisten Rumah Tangga</option>
          <option value="lainnya" style={optionStyle}>Lainnya</option>
        </select>
      </div>

      {isKepala ? (
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Nomor Rumah</label>
          <input type="text" name="nomor_rumah" placeholder="Contoh: D6" required maxLength={10} style={inputStyle} />
          <span style={hintStyle}>Anggota keluarga kamu nanti memilih nomor rumah ini saat mendaftar, lalu kamu yang mengonfirmasi.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Pilih Nomor Rumah</label>
          {houses.length > 0 ? (
            <select name="house_id" defaultValue="" required style={selectStyle}>
              <option value="" disabled style={optionStyle}>
                Pilih rumah kamu
              </option>
              {houses.map((h) => (
                <option key={h.id} value={h.id} style={optionStyle}>
                  Rumah {h.nomor_rumah}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl px-3 py-2.5 text-[12px]" style={{ background: 'rgba(224,138,138,0.1)', color: '#e08a8a' }}>
              Belum ada rumah yang didaftarkan Kepala Keluarga.
            </p>
          )}
          <span style={hintStyle}>
            Rumahmu tidak ada di daftar? Kepala Keluarga perlu mendaftar lebih dulu. Setelah kamu daftar, Kepala Keluarga akan diminta
            mengonfirmasi, lalu Pengurus menyetujui akunmu.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Status Hunian</label>
        <select name="occupancy_status" defaultValue="pemilik" required style={selectStyle}>
          <option value="pemilik" style={optionStyle}>Pemilik</option>
          <option value="penyewa" style={optionStyle}>Penyewa</option>
          <option value="sementara" style={optionStyle}>Sementara</option>
        </select>
      </div>
    </>
  )
}