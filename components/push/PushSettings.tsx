'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PUSH_CATEGORIES } from '@/lib/push-categories'
import { removeDevice, removePushSubscription, savePushPreferences, savePushSubscription, sendTestPush } from '@/app/pengaturan-notifikasi/actions'

type Device = { id: string; device_label: string | null; created_at: string; last_success_at: string | null }
type Support = 'memeriksa' | 'ok' | 'ios-perlu-pasang' | 'tidak-didukung' | 'belum-siap'

const card: React.CSSProperties = { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', borderRadius: 18, padding: '18px 20px' }

function b64ToUint8(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function deviceName() {
  const ua = navigator.userAgent
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'Perangkat'
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  return `${os} · ${br}`
}

export default function PushSettings({ muted: initialMuted, devices }: { muted: string[]; devices: Device[] }) {
  const router = useRouter()
  const [support, setSupport] = useState<Support>('memeriksa')
  const [subscribed, setSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [muted, setMuted] = useState<string[]>(initialMuted)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
    if (!vapid) {
      setSupport('belum-siap')
      return
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setSupport(isIos && !standalone ? 'ios-perlu-pasang' : 'tidak-didukung')
      return
    }
    if (isIos && !standalone) {
      setSupport('ios-perlu-pasang')
      return
    }
    setPermission(Notification.permission)
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        setSubscribed(!!sub)
        setSupport('ok')
      })
      .catch(() => setSupport('tidak-didukung'))
  }, [vapid])

  function enable() {
    setMsg(null)
    startTransition(async () => {
      try {
        const perm = await Notification.requestPermission()
        setPermission(perm)
        if (perm !== 'granted') {
          setMsg({ ok: false, text: 'Izin notifikasi ditolak. Buka pengaturan browser/HP > Notifikasi > izinkan situs ini, lalu coba lagi.' })
          return
        }
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        const sub = existing ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(vapid) }))
        const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
        const r = await savePushSubscription(json, deviceName())
        if (!r.ok) {
          setMsg({ ok: false, text: r.error ?? 'Gagal.' })
          return
        }
        setSubscribed(true)
        setMsg({ ok: true, text: 'Notifikasi HP aktif di perangkat ini.' })
        router.refresh()
      } catch {
        setMsg({ ok: false, text: 'Gagal mengaktifkan. Pastikan internet stabil lalu coba lagi.' })
      }
    })
  }

  function disable() {
    setMsg(null)
    startTransition(async () => {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await removePushSubscription(sub.endpoint)
        await sub.unsubscribe()
      }
      setSubscribed(false)
      setMsg({ ok: true, text: 'Notifikasi HP dimatikan di perangkat ini.' })
      router.refresh()
    })
  }

  function toggleCategory(key: string) {
    const next = muted.includes(key) ? muted.filter((m) => m !== key) : [...muted, key]
    setMuted(next)
    startTransition(async () => {
      const r = await savePushPreferences(next)
      if (!r.ok) setMsg({ ok: false, text: r.error ?? 'Gagal menyimpan.' })
    })
  }

  function test() {
    setMsg(null)
    startTransition(async () => {
      const r = await sendTestPush()
      setMsg(r.ok ? { ok: true, text: 'Uji coba dikirim. Notifikasi akan muncul dalam beberapa detik.' } : { ok: false, text: r.error ?? 'Gagal.' })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <section style={card}>
        <div className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Notifikasi di HP ini</div>
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: '#5b543f' }}>
          Alert darurat, pengumuman, dan pesan tetap masuk walau aplikasi sedang ditutup.
        </p>

        {support === 'memeriksa' ? <p className="mt-3 text-[13px]" style={{ color: '#9c7a3f' }}>Memeriksa perangkat...</p> : null}
        {support === 'belum-siap' ? (
          <p className="mt-3 rounded-xl px-3 py-2.5 text-[12.5px]" style={{ background: '#faf7f0', color: '#7a5a1f' }}>
            Fitur ini sedang disiapkan Pengurus. Coba lagi nanti.
          </p>
        ) : null}
        {support === 'tidak-didukung' ? (
          <p className="mt-3 rounded-xl px-3 py-2.5 text-[12.5px]" style={{ background: '#faf7f0', color: '#7a5a1f' }}>
            Browser ini belum mendukung notifikasi. Pakai Chrome (Android/Laptop) atau pasang aplikasi ke layar utama iPhone.
          </p>
        ) : null}
        {support === 'ios-perlu-pasang' ? (
          <div className="mt-3 rounded-xl px-3 py-2.5 text-[12.5px] leading-relaxed" style={{ background: '#faf7f0', color: '#5b543f' }}>
            <b style={{ color: '#1f1a10' }}>iPhone/iPad:</b> notifikasi hanya bisa aktif kalau aplikasi dipasang ke layar utama (iOS 16.4 ke atas).
            <ol className="mt-1 list-decimal pl-5">
              <li>Buka situs ini di Safari.</li>
              <li>Tekan tombol Bagikan (kotak dengan panah ke atas).</li>
              <li>Pilih &quot;Tambah ke Layar Utama&quot;, lalu buka aplikasinya dari ikon di layar utama.</li>
              <li>Kembali ke halaman ini dan tekan Aktifkan.</li>
            </ol>
          </div>
        ) : null}

        {support === 'ok' ? (
          <div className="mt-3 flex flex-col gap-2">
            <div className="text-[13px] font-bold" style={{ color: subscribed ? '#2f6b4f' : '#b3392f' }}>
              {subscribed ? 'AKTIF di perangkat ini' : permission === 'denied' ? 'Diblokir di pengaturan browser' : 'BELUM aktif di perangkat ini'}
            </div>
            {subscribed ? (
              <div className="flex gap-2">
                <button type="button" disabled={isPending} onClick={test} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
                  Kirim Uji Coba
                </button>
                <button type="button" disabled={isPending} onClick={disable} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
                  Matikan
                </button>
              </div>
            ) : (
              <button type="button" disabled={isPending} onClick={enable} className="rounded-xl py-3 text-[14px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending ? 0.6 : 1 }}>
                {isPending ? 'Mengaktifkan...' : 'Aktifkan Notifikasi HP'}
              </button>
            )}
          </div>
        ) : null}
        {msg ? (
          <p role="status" className="mt-2 text-[12.5px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>
            {msg.text}
          </p>
        ) : null}
      </section>

      <section style={card}>
        <div className="mb-2 text-[15px] font-bold" style={{ color: '#1f1a10' }}>Jenis notifikasi yang dikirim ke HP</div>
        <div className="flex flex-col">
          {PUSH_CATEGORIES.map((c) => {
            const on = c.locked || !muted.includes(c.key)
            return (
              <label key={c.key} className="flex cursor-pointer items-center justify-between gap-3 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                <span>
                  <span className="block text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{c.label}</span>
                  <span className="block text-[11.5px]" style={{ color: '#5b543f' }}>{c.hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={c.locked || isPending}
                  onChange={() => toggleCategory(c.key)}
                  aria-label={c.label}
                  style={{ width: 22, height: 22, accentColor: '#1a1305' }}
                />
              </label>
            )
          })}
        </div>
        <p className="mt-2 text-[11.5px]" style={{ color: '#9c7a3f' }}>Semua notifikasi tetap tersimpan di lonceng aplikasi walau notifikasi HP dimatikan.</p>
      </section>

      {devices.length ? (
        <section style={card}>
          <div className="mb-2 text-[15px] font-bold" style={{ color: '#1f1a10' }}>Perangkat terdaftar ({devices.length})</div>
          {devices.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 py-2" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
              <span className="text-[12.5px]" style={{ color: '#1f1a10' }}>
                {d.device_label ?? 'Perangkat'}
                <span className="block text-[11px]" style={{ color: '#9c7a3f' }}>
                  Didaftarkan {new Date(d.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await removeDevice(d.id)
                    router.refresh()
                  })
                }
                className="text-[12px] font-bold"
                style={{ color: '#b3392f' }}
              >
                Hapus
              </button>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}