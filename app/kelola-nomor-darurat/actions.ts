'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'

export type ContactFormState = { error: string; success: boolean }

export type ContactInput = {
  name: string
  phone: string
  description: string
  sortOrder: number
}

const PHONE_PATTERN = /^[0-9+\-\s()]{3,20}$/

function validate(input: ContactInput): string | null {
  if (!input.name.trim()) return 'Nama kontak wajib diisi.'
  if (input.name.trim().length > 60) return 'Nama kontak maksimal 60 karakter.'
  if (!PHONE_PATTERN.test(input.phone.trim())) return 'Nomor telepon tidak valid. Gunakan angka, boleh diawali +, contoh 081234567890.'
  if (input.description.trim().length > 80) return 'Keterangan maksimal 80 karakter.'
  if (!Number.isFinite(input.sortOrder)) return 'Urutan harus berupa angka.'
  return null
}

function refresh() {
  revalidatePath('/kelola-nomor-darurat')
  revalidatePath('/darurat')
}

export async function createContact(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const access = await getMyAccess()
  if (!access.canManageEmergencyContacts) {
    return { error: 'Kamu tidak punya akses untuk mengubah nomor darurat.', success: false }
  }

  const input: ContactInput = {
    name: (formData.get('name') as string) ?? '',
    phone: (formData.get('phone') as string) ?? '',
    description: (formData.get('description') as string) ?? '',
    sortOrder: Number(formData.get('sort_order') ?? 0),
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid, success: false }

  const supabase = await createClient()
  const { error } = await supabase.from('emergency_contacts').insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    description: input.description.trim() || null,
    sort_order: input.sortOrder,
    is_active: true,
    updated_by: access.userId,
    updated_at: new Date().toISOString(),
  })

  if (error) return { error: publicError(error), success: false }

  refresh()
  return { error: '', success: true }
}

export async function updateContact(id: string, input: ContactInput) {
  const access = await getMyAccess()
  if (!access.canManageEmergencyContacts) return { error: 'Kamu tidak punya akses untuk mengubah nomor darurat.' }

  const invalid = validate(input)
  if (invalid) return { error: invalid }

  const supabase = await createClient()
  const { error } = await supabase
    .from('emergency_contacts')
    .update({
      name: input.name.trim(),
      phone: input.phone.trim(),
      description: input.description.trim() || null,
      sort_order: input.sortOrder,
      updated_by: access.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: publicError(error) }

  refresh()
  return { error: null }
}

export async function setContactActive(id: string, isActive: boolean) {
  const access = await getMyAccess()
  if (!access.canManageEmergencyContacts) return { error: 'Kamu tidak punya akses untuk mengubah nomor darurat.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('emergency_contacts')
    .update({ is_active: isActive, updated_by: access.userId, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: publicError(error) }

  refresh()
  return { error: null }
}

export async function deleteContact(id: string) {
  const access = await getMyAccess()
  if (!access.canManageEmergencyContacts) return { error: 'Kamu tidak punya akses untuk menghapus nomor darurat.' }

  const supabase = await createClient()
  const { error } = await supabase.from('emergency_contacts').delete().eq('id', id)

  if (error) return { error: publicError(error) }

  refresh()
  return { error: null }
}