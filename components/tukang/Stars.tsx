// Tampilan bintang (baca saja). Warna emas untuk bintang terisi.
export default function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} dari 5 bintang`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`half-${i}-${size}`}>
                <stop offset="50%" stopColor="#d4a53a" />
                <stop offset="50%" stopColor="#e3dccb" />
              </linearGradient>
            </defs>
            <path
              d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"
              fill={fill === 1 ? '#d4a53a' : fill === 0.5 ? `url(#half-${i}-${size})` : '#e3dccb'}
            />
          </svg>
        )
      })}
    </span>
  )
}