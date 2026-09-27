import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ServerClient = Awaited<ReturnType<typeof createClient>>

export const FAMILY_ROLES = ['kepala_keluarga', 'ibu_rumah_tangga', 'anggota_keluarga', 'asisten_rumah_tangga', 'lainnya']
export const OCCUPANCY_STATUSES = ['pemilik', 'penyewa', 'sementara']

const FAMILY_ROLE_LABEL: Record<string, string> = {
  anggota_keluarga: 'Anggota Keluarga',
  ibu_rumah_tangga: 'Ibu Rumah Tangga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Penghuni',
}

export function normalizeNomorRumah(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export type HouseholdInput = {
  familyRole: string
  nomorRumah: string // diisi Kepala Keluarga
  houseId: string // dipilih peran lain dari daftar
  occupancyStatus: string
}

// Rumah yang sudah punya Kepala Keluarga (bisa dipanggil sebelum login)
export async function listHousesWithKepala(supabase: ServerClient) {
  const { data } = await supabase.rpc('list_houses_with_kepala')
  return ((data ?? []) as { id: string; nomor_rumah: string }[]).map((h) => ({ id: h.id, nomor_rumah: h.nomor_rumah }))
}

// Cek sebelum akun dibuat, supaya tidak ada akun "setengah jadi" kalau datanya salah.
export async function validateHousehold(supabase: ServerClient, input: HouseholdInput): Promise<string | null> {
  if (!FAMILY_ROLES.includes(input.familyRole)) return 'Peran dalam keluarga wajib dipilih.'
  if (!OCCUPANCY_STATUSES.includes(input.occupancyStatus)) return 'Status hunian wajib dipilih.'

  const houses = await listHousesWithKepala(supabase)

  if (input.familyRole === 'kepala_keluarga') {
    const nomor = normalizeNomorRumah(input.nomorRumah)
    if (!nomor) return 'Nomor rumah wajib diisi.'
    if (nomor.length > 10) return 'Nomor rumah terlalu panjang.'
    if (houses.some((h) => normalizeNomorRumah(h.nomor_rumah) === nomor)) {
      return `Rumah ${nomor} sudah punya Kepala Keluarga terdaftar. Kalau kamu penghuni rumah ini, pilih peran lain lalu pilih rumahnya dari daftar.`
    }
    return null
  }

  if (!input.houseId) return 'Pilih nomor rumah kamu dari daftar.'
  if (!houses.some((h) => h.id === input.houseId)) {
    return 'Rumah yang dipilih belum punya Kepala Keluarga terdaftar. Minta Kepala Keluarga mendaftar lebih dulu.'
  }
  return null
}

// Dipanggil setelah pengguna login. Mengisi rumah + status keluarga di profilnya sendiri.
export async function assignHousehold(
  supabase: ServerClient,
  userId: string,
  input: HouseholdInput,
  extra: Record<string, string | null>
): Promise<{ error: string | null }> {
  const invalid = await validateHousehold(supabase, input)
  if (invalid) return { error: invalid }

  let houseId: string
  let familyStatus: string | null = null
  let nomorRumah = ''

  if (input.familyRole === 'kepala_keluarga') {
    nomorRumah = normalizeNomorRumah(input.nomorRumah)
    const { data: existingHouse } = await supabase.from('houses').select('id').ilike('nomor_rumah', nomorRumah).maybeSingle()

    if (existingHouse) {
      houseId = existingHouse.id
    } else {
      const { data: newHouse, error: houseError } = await supabase
        .from('houses')
        .insert({ nomor_rumah: nomorRumah })
        .select('id')
        .single()
      if (houseError || !newHouse) return { error: `Gagal menyimpan data rumah: ${houseError?.message ?? '-'}` }
      houseId = newHouse.id
    }
  } else {
    houseId = input.houseId
    familyStatus = 'menunggu_kepala'
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...extra,
      house_id: houseId,
      family_role: input.familyRole,
      occupancy_status: input.occupancyStatus,
      // Pemilik rumah ditetapkan final oleh Pengurus saat verifikasi
      is_house_owner: input.familyRole === 'kepala_keluarga' && input.occupancyStatus === 'pemilik',
      family_status: familyStatus,
    })
    .eq('id', userId)

  if (error) {
    if ((error as { code?: string }).code === '23505') return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
    return { error: `Gagal menyimpan profil: ${error.message}` }
  }

  if (familyStatus === 'menunggu_kepala') {
    await notifyKepala(houseId, userId, input.familyRole)
  }

  return { error: null }
}

async function notifyKepala(houseId: string, memberId: string, familyRole: string) {
  try {
    const admin = createAdminClient()
    const [{ data: kepala }, { data: member }, { data: house }] = await Promise.all([
      admin.from('profiles').select('id').eq('house_id', houseId).eq('family_role', 'kepala_keluarga').neq('account_status', 'ditolak'),
      admin.from('profiles').select('full_name, nickname').eq('id', memberId).maybeSingle(),
      admin.from('houses').select('nomor_rumah').eq('id', houseId).maybeSingle(),
    ])

    const name = member?.nickname?.trim() || member?.full_name || 'Seseorang'
    const rows = (kepala ?? []).map((k) => ({
      user_id: k.id,
      type: 'keluarga',
      title: 'Permintaan bergabung ke rumah kamu',
      body: `${name} mendaftar sebagai ${FAMILY_ROLE_LABEL[familyRole] ?? 'penghuni'} di Rumah ${house?.nomor_rumah ?? '-'}. Konfirmasi di Beranda.`,
      link: '/dashboard',
    }))

    if (rows.length > 0) {
      const { error } = await admin.from('notifications').insert(rows)
      if (error) console.error('notifikasi kepala keluarga gagal:', error.message)
    }
  } catch (err) {
    console.error('notifyKepala gagal:', err)
  }
}