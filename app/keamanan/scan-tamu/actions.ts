'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ScanState = {
  error: string
  guest: {
    guest_name: string
    visit_date: string
    purpose: string | null
    status: string
    house_nomor: string | null
  } | null
}

const initial: ScanState = { error: '', guest: null }

export async function scanGuestCode(prevState: ScanState, formData: FormData): Promise<ScanState> {
  const code = (formData.get('code') as string)?.trim().toUpperCase()

  if (!code) {
    return { error: 'Masukkan kode tamu.', guest: null }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: guest, error } = await supabase
    .from('guest_visits')
    .select('id, guest_name, visit_date, purpose, status, house:houses(nomor_rumah)')
    .eq('qr_code', code)
    .maybeSingle()

  if (error || !guest) {
    return { error: 'Kode tamu tidak ditemukan.', guest: null }
  }

  const houseNomor = (guest as any).house?.nomor_rumah ?? null

  if (guest.status === 'checked_in') {
    return {
      error: 'Tamu ini sudah tercatat masuk sebelumnya.',
      guest: {
        guest_name: guest.guest_name,
        visit_date: guest.visit_date,
        purpose: guest.purpose,
        status: guest.status,
        house_nomor: houseNomor,
      },
    }
  }

  const { error: updateError } = await supabase
    .from('guest_visits')
    .update({ status: 'checked_in' })
    .eq('id', guest.id)

  if (updateError) {
    return { error: updateError.message, guest: null }
  }

  return {
    error: '',
    guest: {
      guest_name: guest.guest_name,
      visit_date: guest.visit_date,
      purpose: guest.purpose,
      status: 'checked_in',
      house_nomor: houseNomor,
    },
  }
}
