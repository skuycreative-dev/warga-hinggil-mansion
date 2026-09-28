'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'

// Status hunian per rumah: hanya pemilik rumah (atau Ketua / Sekretaris / Superadmin). Dicek ulang oleh RPC Step 327.

const STATUSES = ['pemilik', 'penyewa', 'sementara', 'kosong']

function refresh() {
  revalidatePath('/status-hunian')
  revalidatePath('/profile')
  revalidatePath('/dashboard')
}

export async function changeOccupancy(status: string, note: string, houseId: string | null) {
  if (!STATUSES.includes(status)) return { error: 'Status hunian tidak valid.' }
  if (note.trim().length > 200) return { error: 'Catatan maksimal 200 karakter.' }
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_house_occupancy', { p_status: status, p_note: note.trim() || null, p_house: houseId })
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null, unchanged: data === 'tidak_berubah' }
}

export async function assignHouseOwner(houseId: string, userId: string | null) {
  const access = await getMyAccess()
  if (!access.isServiceStaff) return { error: 'Hanya Ketua / Sekretaris Paguyuban atau Superadmin.' }
  const supabase = await createClient()
  const { error } = await supabase.rpc('set_house_owner', { p_house: houseId, p_user: userId })
  if (error) return { error: publicError(error) }
  refresh()
  return { error: null }
}