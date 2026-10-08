// Lingkaran foto profil. Kalau warga belum punya foto, tampilkan inisial nama seperti sebelumnya.
export default function Avatar({
  name,
  url,
  size = 36,
  fontSize,
}: {
  name: string
  url?: string | null
  size?: number
  fontSize?: number
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className="flex-shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, border: '1px solid rgba(26,19,5,0.08)' }}
      />
    )
  }
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold"
      style={{ width: size, height: size, fontSize: fontSize ?? size * 0.42, background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}