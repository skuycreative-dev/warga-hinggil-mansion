'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type GuestVisitState = { error: string; success: boolean; code?: string }

const PURPOSE_OPTIONS = ['keluarga', 'kurir', 'tukang', 'delivery', 'lainnya']

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createGuestVisit(prevState: GuestVisitState, formData: FormData): Promise<GuestVisitState> {
  const guestName = (formData.get('guest_name') as string)?.trim()
  const guestPhone = (formData.get('guest_phone') as string)?.trim()
  const purpose = (formData.get('purpose') as string) || 'lainnya'

  if (!guestName) {
    return { error: 'Nama tamu wajib diisi.', success: false }
  }

  if (!PURPOSE_OPTIONS.includes(purpose)) {
    return { error: 'Keperluan tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  let code = generateCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('guest_visits')
      .select('id')
      .eq('visit_code', code)
      .eq('status', 'menunggu')
      .maybeSingle()
    if (!existing) break
    code = generateCode()
  }

  const { error } = await supabase.from('guest_visits').insert({
    guest_name: guestName,
    guest_phone: guestPhone || null,
    purpose,
    visit_code: code,
    status: 'menunggu',
    invited_by: user.id,
    house_id: profile?.house_id ?? null,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/qr-tamu')
  return { error: '', success: true, code }
}

export async function cancelGuestVisit(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase.from('guest_visits').update({ status: 'dibatalkan' }).eq('id', id).eq('invited_by', user.id)
  revalidatePath('/qr-tamu')
}
