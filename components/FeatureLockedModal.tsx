'use client'

// Pop-up saat pengguna menekan fitur yang terkunci.
export default function FeatureLockedModal({
  open,
  onClose,
  title,
  message,
}: {
  open: boolean
  onClose: () => void
  title: string
  message: string
}) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="flex items-center justify-center px-5"
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(10,11,15,0.6)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl px-6 py-7 text-center"
        style={{ background: '#ffffff', boxShadow: '0 20px 50px rgba(10,11,15,0.35)' }}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#1a1305' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>{title}</div>
        <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl py-3 text-sm font-bold"
          style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
        >
          Mengerti
        </button>
      </div>
    </div>
  )
}