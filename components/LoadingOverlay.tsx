// Tampilan "Memuat..." yang sama dengan app/loading.tsx, dipakai juga saat pindah tab / filter
// (Next.js tidak menampilkan loading.tsx kalau yang berubah hanya ?tab=... di alamat yang sama)
export default function LoadingOverlay({ label = 'Memuat halaman...' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'rgba(10,11,15,0.92)',
      }}
    >
      <div style={{ position: 'relative', width: 160, height: 60, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', fontSize: 34, animation: 'runKid 3.2s ease-in-out infinite' }}>{'\u{1F3C3}'}</div>
      </div>
      <p className="text-sm font-bold tracking-wide" style={{ color: '#e6c98a', fontFamily: 'var(--font-fraunces), serif' }}>
        {label}
      </p>
      <style>{`
        @keyframes runKid {
          0% { left: -40px; transform: scaleX(1); }
          45% { left: calc(100% - 20px); transform: scaleX(1); }
          50% { left: calc(100% - 20px); transform: scaleX(-1); }
          95% { left: -40px; transform: scaleX(-1); }
          100% { left: -40px; transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}