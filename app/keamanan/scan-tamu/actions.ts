'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ScanState = { error: string; success: boolean }

const ALLOWED_ROLES = ['security', 'superadmin']

async function requireSecurity() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function checkInGuest(prevState: ScanState, formData: FormData): Promise<ScanState> {
  const code = (formData.get('visit_code') as string)?.trim()

  if (!code) {
    return { error: 'Masukkan kode tamu.', success: false }
  }

  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }

  const { data: visit, error: findError } = await ctx.supabase
    .from('guest_visits')
    .select('id, status')
    .eq('visit_code', code)
    .eq('status', 'menunggu')
    .maybeSingle()

  if (findError || !visit) {
    return { error: 'Kode tidak ditemukan atau sudah digunakan.', success: false }
  }

  const { error } = await ctx.supabase
    .from('guest_visits')
    .update({ status: 'masuk', checked_in_at: new Date().toISOString(), checked_in_by: ctx.userId })
    .eq('id', visit.id)

  if (error) return { error: publicError(error), success: false }

  revalidatePath('/keamanan/scan-tamu')
  return { error: '', success: true }
}

export async function checkOutGuest(id: string) {
  const ctx = await requireSecurity()
  if (!ctx) return

  await ctx.supabase
    .from('guest_visits')
    .update({ status: 'keluar', checked_out_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/keamanan/scan-tamu')
}


export type GuestLookup = {
  id: string
  guest_name: string
  guest_phone: string | null
  purpose: string
  status: string
  visit_code: string
  created_at: string
  checked_in_at: string | null
  nomor_rumah: string | null
  host_name: string | null
}

// Terima isi QR (link / token 32 karakter) atau kode 6 digit, lalu tampilkan data tamu untuk dicek Security
export async function lookupGuest(raw: string): Promise<{ error: string | null; guest: GuestLookup | null }> {
  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.', guest: null }

  const input = raw.trim()
  const token = input.match(/[?&]t=([0-9a-f]{32})/i)?.[1] ?? input.match(/^[0-9a-f]{32}$/i)?.[0] ?? null
  const code = token ? null : input.replace(/\D/g, '')
  if (!token && (!code || code.length !== 6)) return { error: 'QR tidak dikenali. Coba lagi atau ketik kode 6 digit.', guest: null }

  let q = ctx.supabase
    .from('guest_visits')
    .select('id, guest_name, guest_phone, purpose, status, visit_code, created_at, checked_in_at, invited_by, house:houses(nomor_rumah)')
    .order('created_at', { ascending: false })
    .limit(1)
  q = token ? q.eq('qr_code_token', token.toLowerCase()) : q.eq('visit_code', code as string).in('status', ['menunggu', 'masuk'])
  const { data } = await q.maybeSingle()
  if (!data) return { error: 'Kode tidak ditemukan. Minta tamu menghubungi warga yang mengundang.', guest: null }

  const { data: host } = await ctx.supabase.from('profiles').select('full_name, nickname').eq('id', (data as any).invited_by).maybeSingle()
  const house = Array.isArray((data as any).house) ? (data as any).house[0] : (data as any).house

  return {
    error: null,
    guest: {
      id: data.id as string,
      guest_name: data.guest_name as string,
      guest_phone: (data.guest_phone as string) ?? null,
      purpose: data.purpose as string,
      status: data.status as string,
      visit_code: data.visit_code as string,
      created_at: data.created_at as string,
      checked_in_at: (data.checked_in_at as string) ?? null,
      nomor_rumah: house?.nomor_rumah ?? null,
      host_name: host ? ((host.nickname as string) || (host.full_name as string)) : null,
    },
  }
}

export async function checkInGuestById(id: string) {
  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.' }

  const { data, error } = await ctx.supabase
    .from('guest_visits')
    .update({ status: 'masuk', checked_in_at: new Date().toISOString(), checked_in_by: ctx.userId })
    .eq('id', id)
    .eq('status', 'menunggu')
    .select('id')

  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Tamu ini sudah masuk atau undangannya dibatalkan.' }
  revalidatePath('/keamanan/scan-tamu')
  revalidatePath('/security')
  return { error: null }
}

export async function checkOutGuestById(id: string) {
  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.' }

  const { data, error } = await ctx.supabase
    .from('guest_visits')
    .update({ status: 'keluar', checked_out_at: new Date().toISOString(), checked_out_by: ctx.userId })
    .eq('id', id)
    .eq('status', 'masuk')
    .select('id')

  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Tamu ini belum tercatat masuk.' }
  revalidatePath('/keamanan/scan-tamu')
  revalidatePath('/security')
  return { error: null }
}