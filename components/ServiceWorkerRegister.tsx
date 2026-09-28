'use client'

import { useEffect } from 'react'

// Mendaftarkan service worker (syarat aplikasi bisa di-install sebagai PWA)
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => console.error('Service worker gagal didaftarkan:', err))
  }, [])
  return null
}