// Service worker Warga Hinggil Mansion.
// Sengaja TIDAK menyimpan data warga di HP: halaman & data pribadi (keuangan, chat, dll.) selalu diambil
// langsung dari server. Yang disimpan hanya file tampilan umum yang sama untuk semua orang
// (kode aplikasi, ikon, logo) supaya aplikasi terbuka lebih cepat dan hemat kuota.
const CACHE = 'hinggil-v3'
const STATIC_CACHE = 'hinggil-static-v2'
const OFFLINE_URL = '/offline.html'
const MAX_STATIC = 150

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png'])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== STATIC_CACHE).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

function isPublicAsset(url) {
  if (url.origin !== self.location.origin) return false
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff2)$/.test(url.pathname)
  )
}

async function trim(cache) {
  const keys = await cache.keys()
  if (keys.length > MAX_STATIC) {
    await Promise.all(keys.slice(0, keys.length - MAX_STATIC).map((k) => cache.delete(k)))
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  const url = new URL(req.url)
  // /_next/image bisa berisi foto pribadi (mis. bukti bayar) -> tidak disimpan
  if (!isPublicAsset(url) || url.pathname.startsWith('/_next/image')) return

  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const hit = await cache.match(req)
      if (hit) return hit
      const res = await fetch(req)
      if (res.ok && res.type === 'basic') {
        cache.put(req, res.clone()).then(() => trim(cache))
      }
      return res
    })
  )
})

// ---------- Notifikasi ke HP (Web Push) ----------
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'Notifikasi baru', body: event.data ? event.data.text() : '' }
  }
  const urgent = data.category === 'darurat'
  const title = data.title || 'Notifikasi baru'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || undefined,
      renotify: urgent,
      requireInteraction: urgent,
      vibrate: urgent ? [500, 200, 500, 200, 900] : [120, 60, 120],
      data: { url: typeof data.url === 'string' ? data.url : '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  let target = '/dashboard'
  try {
    const u = new URL((event.notification.data && event.notification.data.url) || '/dashboard', self.location.origin)
    if (u.origin === self.location.origin) target = u.pathname + u.search + u.hash
  } catch (e) {
    target = '/dashboard'
  }
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then((c) => (c && 'navigate' in c ? c.navigate(target) : undefined))
        }
      }
      return self.clients.openWindow(target)
    })
  )
})