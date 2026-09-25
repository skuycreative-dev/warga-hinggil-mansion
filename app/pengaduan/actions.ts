'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ComplaintState = { error: string; success: boolean }

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'security', 'superadmin']
const CATEGORY_OPTIONS = ['kebersihan', 'keamanan', 'fasilitas', 'lainnya']
const STATUS_OPTIONS = ['baru', 'diproses', 'selesai']

export async function createComplaint(prevState: ComplaintState, formData: FormData): Promise<ComplaintState> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const category = (formData.get('category') as string) || 'lainnya'

  if (!title || !description) {
    return { error: 'Judul dan deskripsi pengaduan wajib diisi.', success: false }
  }

  if (!CATEGORY_OPTIONS.includes(category)) {
    return { error: 'Kategori tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('complaints').insert({
    title,
    description,
    category,
    created_by: user.id,
    house_id: profile?.house_id ?? null,
    status: 'baru',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/pengaduan')
  revalidatePath('/manajemen')
  return { error: '', success: true }
}

export async function updateComplaintStatus(id: string, status: string) {
  if (!STATUS_OPTIONS.includes(status)) {
    return { error: 'Status tidak valid.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    return { error: 'Tidak punya akses.' }
  }

  const { error } = await supabase
    .from('complaints')
    .update({ status, handled_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pengaduan')
  revalidatePath('/manajemen')
  return { error: null }
}
