import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { categoryForType, isAllowedPushEndpoint } from '@/lib/push-categories'

// Dipanggil database (trigger zz_dispatch_push) setiap ada notifikasi baru.
// Pengaman: kunci rahasia dibuat acak di database (tabel private_config) dan dicek di sini;
// setiap notifikasi hanya bisa dikirim SEKALI (kolom push_sent_at).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@hinggilmansion.com'
  if (!publicKey || !privateKey) return NextResponse.json({ ok: false, reason: 'vapid-belum-diatur' }, { status: 503 })

  const secret = request.headers.get('x-push-secret') ?? ''
  if (!secret || secret.length > 200) return NextResponse.json({ ok: false }, { status: 401 })

  let ids: string[] = []
  try {
    const body = (await request.json()) as { ids?: unknown }
    ids = Array.isArray(body.ids) ? body.ids.filter((v): v is string => typeof v === 'string' && UUID.test(v)).slice(0, 500) : []
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!ids.length) return NextResponse.json({ ok: true, sent: 0 })

  const admin = createAdminClient()
  const { data: cfg } = await admin.from('private_config').select('value').eq('key', 'push_secret').maybeSingle()
  if (!cfg?.value || !sameSecret(secret, cfg.value as string)) return NextResponse.json({ ok: false }, { status: 401 })

  // Klaim notifikasi (sekali kirim), hanya yang dibuat 15 menit terakhir
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { data: claimed } = await admin
    .from('notifications')
    .update({ push_sent_at: new Date().toISOString() })
    .in('id', ids)
    .is('push_sent_at', null)
    .gte('created_at', since)
    .select('id, user_id, type, title, body, link')
  if (!claimed?.length) return NextResponse.json({ ok: true, sent: 0 })

  const userIds = Array.from(new Set(claimed.map((n) => n.user_id as string)))
  const [{ data: subs }, { data: prefs }] = await Promise.all([
    admin.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth').in('user_id', userIds),
    admin.from('push_preferences').select('user_id, muted').in('user_id', userIds),
  ])
  const muted = new Map((prefs ?? []).map((p) => [p.user_id as string, new Set((p.muted as string[]) ?? [])]))

  webpush.setVapidDetails(subject, publicKey, privateKey)

  const jobs: { subId: string; run: () => Promise<unknown> }[] = []
  for (const n of claimed) {
    const category = categoryForType(n.type as string)
    if (category !== 'darurat' && muted.get(n.user_id as string)?.has(category)) continue
    const link = typeof n.link === 'string' && n.link.startsWith('/') && !n.link.startsWith('//') ? n.link : '/dashboard'
    const payload = JSON.stringify({
      title: String(n.title ?? 'Notifikasi baru').slice(0, 120),
      body: String(n.body ?? '').slice(0, 240),
      url: link,
      category,
      tag: category === 'darurat' ? `darurat-${n.id}` : `n-${n.id}`,
    })
    for (const s of (subs ?? []).filter((x) => x.user_id === n.user_id && isAllowedPushEndpoint(x.endpoint as string))) {
      jobs.push({
        subId: s.id as string,
        run: () =>
          webpush.sendNotification(
            { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
            payload,
            { TTL: category === 'darurat' ? 3600 : 86400, urgency: category === 'darurat' ? 'high' : 'normal' }
          ),
      })
    }
  }

  const dead: string[] = []
  const alive: string[] = []
  // Kirim bertahap (20 sekaligus) supaya server tidak kewalahan
  for (let i = 0; i < jobs.length; i += 20) {
    const batch = jobs.slice(i, i + 20)
    const results = await Promise.allSettled(batch.map((j) => j.run()))
    results.forEach((r, k) => {
      if (r.status === 'fulfilled') alive.push(batch[k].subId)
      else {
        const code = (r.reason as { statusCode?: number })?.statusCode
        if (code === 404 || code === 410) dead.push(batch[k].subId)
      }
    })
  }

  if (dead.length) await admin.from('push_subscriptions').delete().in('id', Array.from(new Set(dead)))
  if (alive.length) {
    await admin.from('push_subscriptions').update({ last_success_at: new Date().toISOString() }).in('id', Array.from(new Set(alive)))
  }
  return NextResponse.json({ ok: true, sent: alive.length, removed: dead.length })
}