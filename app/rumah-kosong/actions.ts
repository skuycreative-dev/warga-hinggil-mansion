'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'security', 'superadmin'].includes(profile.role)) {
    return null
  }

  return supabase
}

export async function flagHouseEmpty(houseId: string) {
  const supabase = await requireAccess()
  if (!supabase) return

  await supabase.from('houses').update({ is_empty_flagged: true, empty_since: new Date().toISOString() }).eq('id', houseId)
  revalidatePath('/rumah-kosong')
}

export async function unflagHouseEmpty(houseId: string) {
  const supabase = await requireAccess()
  if (!supabase) return

  await supabase.from('houses').update({ is_empty_flagged: false, empty_since: null }).eq('id', houseId)
  revalidatePath('/rumah-kosong')
}
