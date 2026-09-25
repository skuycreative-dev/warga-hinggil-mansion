'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type DaruratState = {
  error: string
  success: boolean
}

export async function kirimDarurat(
  prevState: DaruratState,
  formData: FormData
): Promise<DaruratState> {
  const emergencyType = formData.get('emergency_type') as string
  const description = formData.get('description') as string

  if (!emergencyType) {
    return { error: 'Pilih jenis darurat terlebih dahulu.', success: false }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('house_id')
    .eq('id', user.id)
    .maybeSingle()

  const { error } = await supabase.from('emergency_alerts').insert({
    house_id: profile?.house_id ?? null,
    reported_by: user.id,
    emergency_type: emergencyType,
    status: 'pending',
    description: description || null,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: '', success: true }
}
