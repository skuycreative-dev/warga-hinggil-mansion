'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const DISMISS_KEY = 'pwa-banner-ditutup'

// Ajakan memasang aplikasi ke layar utama HP.
// Android/Chrome: tombol "Pasang". iPhone (Safari): petunjuk Bagikan -> Tambah ke Layar Utama.
export default function InstallAppBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    let dismissed = false
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      dismissed = false
    }
    if (standalone || dismissed) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIos(ios)
    if (ios) setVisible(true)

    function onPrompt(event: Event) {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // abaikan: banner hanya muncul lagi saat halaman dibuka ulang
    }
  }

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3.5" style={{ background: '#1a1305' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={40} height={40} className="flex-shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-bold" style={{ color: '#efe4c8' }}>Pasang aplikasi di HP</div>
        <div className="text-[11.5px] font-medium" style={{ color: '#c7c9d2' }}>
          {isIos && !promptEvent ? 'Di Safari: tekan tombol Bagikan, lalu "Tambah ke Layar Utama".' : 'Buka lebih cepat langsung dari layar utama.'}
        </div>
      </div>
      {promptEvent ? (
        <button
          type="button"
          onClick={install}
          className="flex-shrink-0 rounded-lg px-3 py-2 text-[12px] font-bold"
          style={{ background: '#e6c98a', color: '#1a1305' }}
        >
          Pasang
        </button>
      ) : null}
      <button type="button" onClick={dismiss} aria-label="Tutup" className="flex-shrink-0 px-1" style={{ color: '#9c7a3f' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}