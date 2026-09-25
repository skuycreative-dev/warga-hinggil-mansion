export default function StatCard({
  label,
  value,
  caption,
  iconBg,
  iconPath,
  badge,
}: {
  label: string
  value: string | number
  caption?: string
  iconBg: string
  iconPath: string
  badge?: string
}) {
  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: iconBg }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1305" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath} />
          </svg>
        </div>
        {badge ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(179,57,47,0.12)', color: '#b3392f' }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>{value}</div>
      {caption ? <div className="mt-1 text-[12px] font-medium" style={{ color: '#5b543f' }}>{caption}</div> : null}
    </div>
  )
}
