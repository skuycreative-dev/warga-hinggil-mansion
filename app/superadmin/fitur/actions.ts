'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { FEATURES } from '@/lib/features'

export async function setFeatureEnabled(key: string, enabled: boolean) {
  const access = await getMyAccess()
  if (!access.isSuperadmin) return { error: 'Hanya Superadmin yang bisa mengubah fitur.' }
  if (!FEATURES.some((f) => f.key === key)) return { error: 'Fitur tidak dikenal.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('app_features')
    .upsert({ key, enabled, updated_by: access.userId, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  revalidatePath('/superadmin/fitur')
  revalidatePath('/dashboard')
  return { error: null }
}