'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { publicError } from '@/lib/safe-error'

type Result = { ok: boolean; error: string | null }

export type BrandingInput = {
  community_name: string
  app_name: string
  short_name: string
  tagline: string
  theme_color: string
  accent_color: string
  contact_whatsapp: string
  contact_email: string
  address: string
  city: string
}

const HEX = /^#[0-9a-fA-F]{6}$/

export async function saveBranding(input: BrandingInput): Promise<Result> {
  const access = await getMyAccess()
  if (!access.isSuperadmin) return { ok: false, error: 'Hanya Superadmin.' }

  const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
  const row = {
    community_name: clean(input.community_name, 60),
    app_name: clean(input.app_name, 60),
    short_name: clean(input.short_name, 24),
    tagline: clean(input.tagline, 120) || null,
    theme_color: HEX.test(input.theme_color) ? input.theme_color : '#0a0b0f',
    accent_color: HEX.test(input.accent_color) ? input.accent_color : '#e6c98a',
    contact_whatsapp: clean(input.contact_whatsapp, 20) || null,
    contact_email: clean(input.contact_email, 120) || null,
    address: clean(input.address, 200) || null,
    city: clean(input.city, 60) || null,
    updated_by: access.userId,
    updated_at: new Date().toISOString(),
  }
  if (row.community_name.length < 2 || row.app_name.length < 2 || row.short_name.length < 2) {
    return { ok: false, error: 'Nama perumahan, nama aplikasi, dan nama pendek wajib diisi.' }
  }
  if (row.contact_whatsapp && !/^[0-9+ -]{8,20}$/.test(row.contact_whatsapp)) return { ok: false, error: 'Nomor WhatsApp tidak valid.' }
  if (row.contact_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.contact_email)) return { ok: false, error: 'Email tidak valid.' }

  const supabase = await createClient()
  const { error } = await supabase.from('app_branding').update(row).eq('id', 1)
  if (error) return { ok: false, error: publicError(error) }
  updateTag('branding')
  revalidatePath('/', 'layout')
  return { ok: true, error: null }
}

// Logo baru sudah diunggah dari browser ke bucket "branding"; simpan alamatnya & hapus logo lama
export async function saveLogo(path: string | null): Promise<Result> {
  const access = await getMyAccess()
  if (!access.isSuperadmin) return { ok: false, error: 'Hanya Superadmin.' }
  if (path !== null && !/^logo-[0-9]+\.(webp|jpg|png)$/.test(path)) return { ok: false, error: 'Nama file logo tidak valid.' }

  const supabase = await createClient()
  const { data: old } = await supabase.from('app_branding').select('logo_path').eq('id', 1).maybeSingle()
  const { error } = await supabase
    .from('app_branding')
    .update({ logo_path: path, updated_by: access.userId, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) return { ok: false, error: publicError(error) }
  if (old?.logo_path && old.logo_path !== path) await supabase.storage.from('branding').remove([old.logo_path as string])
  updateTag('branding')
  revalidatePath('/', 'layout')
  return { ok: true, error: null }
}