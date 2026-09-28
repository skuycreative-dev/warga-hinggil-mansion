import Link from 'next/link'

// Tab sederhana berbasis alamat (?tab=...), jadi tetap jalan tanpa JavaScript dan bisa dibagikan.
export default function TabNav({
  basePath,
  tabs,
  active,
}: {
  basePath: string
  tabs: { key: string; label: string; badge?: number }[]
  active: string
}) {
  return (
    <nav className="mb-6 flex gap-1.5 overflow-x-auto pb-1" aria-label="Bagian halaman">
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <Link
            key={t.key}
            href={`${basePath}?tab=${t.key}`}
            scroll={false}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold transition"
            style={
              isActive
                ? { background: '#1a1305', color: '#e6c98a' }
                : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }
            }
          >
            {t.label}
            {t.badge ? (
              <span className="rounded-full px-1.5 text-[10.5px]" style={{ background: '#b3392f', color: '#ffffff' }}>
                {t.badge}
              </span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )
}