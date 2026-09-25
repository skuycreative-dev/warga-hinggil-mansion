export default function Loading() {
  return (
    <div
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
        <div
          style={{
            position: 'absolute',
            fontSize: 34,
            animation: 'runKid 3.2s ease-in-out infinite',
          }}
        >
          🏃
        </div>
      </div>
      <p
        className="text-sm font-bold tracking-wide"
        style={{ color: '#e6c98a', fontFamily: 'var(--font-fraunces), serif' }}
      >
        Memuat halaman...
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
