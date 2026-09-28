'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PUSH_CATEGORIES, isAllowedPushEndpoint } from '@/lib/push-categories'

type Result = { ok: boolean; error: string | null }
type SubInput = { endpoint: string; keys: { p256dh: string; auth: string } }

async function me() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

// Simpan langganan notifikasi HP ini. Kalau HP ini sebelumnya dipakai akun lain, langganan lama dipindahkan.
export async function savePushSubscription(sub: SubInput, deviceLabel: string): Promise<Result> {
  const { user } = await me()
  if (!user) return { ok: false, error: 'Silakan login ulang.' }
  const endpoint = String(sub?.endpoint ?? '')
  const p256dh = String(sub?.keys?.p256dh ?? '')
  const auth = String(sub?.keys?.auth ?? '')
  if (!isAllowedPushEndpoint(endpoint) || endpoint.length > 1000 || !p256dh || p256dh.length > 200 || !auth || auth.length > 100) {
    return { ok: false, error: 'Browser ini belum mendukung notifikasi HP.' }
  }
  const admin = createAdminClient()
  await admin.from('push_subscriptions').delete().eq('endpoint', endpoint)
  const { error } = await admin.from('push_subscriptions').insert({
    user_id: user.id,
    endpoint,
    p256dh,
    auth,
    device_label: (deviceLabel || 'Perangkat').slice(0, 80),
  })
  revalidatePath('/pengaturan-notifikasi')
  return error ? { ok: false, error: 'Gagal menyimpan. Coba lagi.' } : { ok: true, error: null }
}

export async function removePushSubscription(endpoint: string): Promise<Result> {
  const { supabase, user } = await me()
  if (!user) return { ok: false, error: 'Silakan login ulang.' }
  await supabase.from('push_subscriptions').delete().eq('endpoint', String(endpoint ?? '').slice(0, 1000))
  revalidatePath('/pengaturan-notifikasi')
  return { ok: true, error: null }
}

export async function removeDevice(id: string): Promise<Result> {
  const { supabase, user } = await me()
  if (!user) return { ok: false, error: 'Silakan login ulang.' }
  await supabase.from('push_subscriptions').delete().eq('id', id)
  revalidatePath('/pengaturan-notifikasi')
  return { ok: true, error: null }
}

export async function savePushPreferences(muted: string[]): Promise<Result> {
  const { supabase, user } = await me()
  if (!user) return { ok: false, error: 'Silakan login ulang.' }
  const allowed = new Set(PUSH_CATEGORIES.filter((c) => !c.locked).map((c) => c.key))
  const clean = Array.from(new Set((muted ?? []).filter((m) => allowed.has(m))))
  const { error } = await supabase
    .from('push_preferences')
    .upsert({ user_id: user.id, muted: clean, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return error ? { ok: false, error: 'Gagal menyimpan pengaturan.' } : { ok: true, error: null }
}

// Kirim notifikasi uji ke HP sendiri (lewat jalur yang sama dengan notifikasi asli)
export async function sendTestPush(): Promise<Result> {
  const { user } = await me()
  if (!user) return { ok: false, error: 'Silakan login ulang.' }
  const admin = createAdminClient()
  const { data: allowed } = await admin.rpc('hit_rate_limit', { p_key: `pushtest:${user.id}`, p_max: 5, p_window_seconds: 3600 })
  if (allowed === false) return { ok: false, error: 'Uji coba maksimal 5 kali per jam.' }
  const { error } = await admin.from('notifications').insert({
    user_id: user.id,
    type: 'akun',
    title: 'Notifikasi HP aktif',
    body: 'Mantap! Notifikasi dari aplikasi warga sudah masuk ke HP ini.',
    link: '/pengaturan-notifikasi',
  })
  return error ? { ok: false, error: 'Gagal mengirim uji coba.' } : { ok: true, error: null }
}