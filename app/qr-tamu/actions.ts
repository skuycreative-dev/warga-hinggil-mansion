'use server'

import { randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type GuestInviteState = {
  error: string
  success: boolean
}

export async function createGuestInvite(
  prevState: GuestInviteState,
  formData: FormData
): Promise<GuestInviteState> {
  const guestName = (formData.get('guest_name') as string)?.trim()
  const guestPhone = (formData.get('guest_phone') as string)?.trim()
  const visitDate = formData.get('visit_date') as string
  const purpose = (formData.get('purpose') as string)?.trim()

  if (!guestName || !visitDate) {
    return { error: 'Nama tamu dan tanggal kunjungan wajib diisi.', success: false }
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

  if (!profile?.house_id) {
    return { error: 'Data rumah kamu belum lengkap. Hubungi admin.', success: false }
  }

  const qrCode = randomBytes(5).toString('hex').toUpperCase()

  const { error } = await supabase.from('guest_visits').insert({
    house_id: profile.house_id,
    invited_by: user.id,
    guest_name: guestName,
    guest_phone: guestPhone || null,
    visit_date: visitDate,
    purpose: purpose || null,
    status: 'pending',
    qr_code: qrCode,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/qr-tamu')
  return { error: '', success: true }
}
