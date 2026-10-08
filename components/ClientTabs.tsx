'use client'

import { useEffect, useState } from 'react'

// Tab yang semua isinya sudah dimuat sekali dari server, jadi pindah tab langsung (tanpa menunggu server).
// Alamat tetap diperbarui (?tab=...) supaya tombol kembali & bagikan link tetap sesuai.
export default function ClientTabs({
  basePath,
  tabs,
  initial,
  panels,
}: {
  basePath: string
  tabs: { key: string; label: string; badge?: number }[]
  initial: string
  panels: Record<string, React.ReactNode>
}) {
  const [active, setActive] = useState(initial)

  useEffect(() => {
    setActive(initial)
  }, [initial])

  useEffect(() => {
    function onPop() {
      const tab = new URLSearchParams(window.location.search).get('tab')
      setActive(tab && tabs.some((t) => t.key === tab) ? tab : tabs[0].key)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [tabs])

  function choose(key: string) {
    if (key === active) return
    setActive(key)
    window.history.pushState(null, '', `${basePath}?tab=${key}`)
  }

  return (
    <>
      <div role="tablist" aria-label="Bagian halaman" className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={isActive}
              aria-controls={`panel-${t.key}`}
              onClick={() => choose(t.key)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition"
              style={isActive ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
            >
              {t.label}
              {t.badge ? (
                <span className="rounded-full px-1.5 text-[10.5px]" style={{ background: '#b3392f', color: '#ffffff' }}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={t.key !== active}>
          {panels[t.key]}
        </div>
      ))}
    </>
  )
}