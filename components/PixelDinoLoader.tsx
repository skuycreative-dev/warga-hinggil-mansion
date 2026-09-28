// Animasi loading: dinosaurus piksel (desain orisinal Hinggil Mansion) berlari di tempat, tanpa tulisan.
// Murni SVG + CSS (tanpa gambar/berkas tambahan) supaya ringan di HP. Teks "Memuat" hanya untuk pembaca layar.
export default function PixelDinoLoader({ label = 'Memuat halaman' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,11,15,0.9)',
      }}
    >
      <div className="hm-dino-wrap" aria-hidden>
        <svg className="hm-dino" viewBox="0 0 24 17" width="120" height="85" shapeRendering="crispEdges">
          <g fill="#e6c98a"><rect x="18" y="0" width="4" height="1" /><rect x="17" y="1" width="6" height="1" /><rect x="17" y="2" width="2" height="1" /><rect x="20" y="2" width="3" height="1" /><rect x="17" y="3" width="5" height="1" /><rect x="16" y="4" width="3" height="1" /><rect x="15" y="5" width="3" height="1" /><rect x="14" y="6" width="3" height="1" /><rect x="8" y="7" width="5" height="1" /><rect x="14" y="7" width="3" height="1" /><rect x="6" y="8" width="11" height="1" /><rect x="5" y="9" width="12" height="1" /><rect x="3" y="10" width="14" height="1" /><rect x="0" y="11" width="16" height="1" /><rect x="2" y="12" width="12" height="1" /></g>
          <g fill="#9c7a3f"><rect x="9" y="8" width="1" height="1" /><rect x="12" y="8" width="1" height="1" /><rect x="7" y="9" width="1" height="1" /></g>
          <g className="hm-leg-a" fill="#e6c98a"><rect x="4" y="13" width="2" height="1" /><rect x="11" y="13" width="2" height="1" /><rect x="4" y="14" width="2" height="1" /><rect x="12" y="14" width="2" height="1" /><rect x="3" y="15" width="3" height="1" /><rect x="12" y="15" width="3" height="1" /></g>
          <g className="hm-leg-b" fill="#e6c98a"><rect x="5" y="13" width="2" height="1" /><rect x="10" y="13" width="2" height="1" /><rect x="4" y="14" width="2" height="1" /><rect x="11" y="14" width="2" height="1" /><rect x="4" y="15" width="3" height="1" /><rect x="10" y="15" width="3" height="1" /></g>
        </svg>
        <div className="hm-ground" />
      </div>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{label}</span>
      <style>{`
        .hm-dino-wrap { position: relative; width: 150px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        .hm-dino { animation: hmBob 0.36s steps(2, end) infinite; image-rendering: pixelated; }
        .hm-leg-a { animation: hmLegA 0.36s steps(1, end) infinite; }
        .hm-leg-b { animation: hmLegB 0.36s steps(1, end) infinite; }
        .hm-ground {
          width: 150px; height: 4px; margin-top: 2px;
          background-image: linear-gradient(90deg, #9c7a3f 0 8px, transparent 8px 16px, #6b5a36 16px 20px, transparent 20px 28px);
          background-size: 28px 4px;
          animation: hmGround 0.5s linear infinite;
        }
        @keyframes hmBob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
        @keyframes hmLegA { 0% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes hmLegB { 0% { opacity: 0; } 50% { opacity: 1; } }
        @keyframes hmGround { from { background-position: 0 0; } to { background-position: -28px 0; } }
        @media (prefers-reduced-motion: reduce) {
          .hm-dino, .hm-ground { animation-duration: 1.4s; }
          .hm-leg-a, .hm-leg-b { animation-duration: 1.4s; }
        }
      `}</style>
    </div>
  )
}