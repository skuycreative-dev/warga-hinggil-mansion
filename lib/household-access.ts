import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Status seseorang di dalam rumahnya (untuk fitur khusus keluarga).
// Database tetap memeriksa ulang aturan yang sama (is_household_member / is_household_manager).
export async function getMyHousehold() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status, house_id, family_role, family_status, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  // Sengaja TIDAK dibatasi role === 'warga': pengurus/admin yang juga tinggal di perumahan
  // sebagai Kepala/Ibu Rumah Tangga tetap berhak mengelola fitur rumah tangganya sendiri.
  const isMember =
    !!profile?.house_id &&
    profile.account_status === 'aktif' &&
    (!profile.family_status || profile.family_status === 'dikonfirmasi')

  const isManager =
    isMember &&
    (profile?.family_role === 'kepala_keluarga' ||
      (profile?.family_role === 'ibu_rumah_tangga' && profile?.family_status === 'dikonfirmasi'))

  const house = Array.isArray((profile as any)?.house) ? (profile as any).house[0] : (profile as any)?.house

  return {
    supabase,
    userId: user.id,
    houseId: (profile?.house_id ?? null) as string | null,
    houseLabel: (house?.nomor_rumah ?? null) as string | null,
    familyRole: (profile?.family_role ?? null) as string | null,
    isMember,
    isManager,
  }
}