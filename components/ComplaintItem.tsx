type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  baru: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Baru' },
  diproses: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Diproses' },
  selesai: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Selesai' },
}

const CATEGORY_LABEL: Record<string, string> = {
  kebersihan: 'Kebersihan',
  keamanan: 'Keamanan',
  fasilitas: 'Fasilitas',
  lainnya: 'Lainnya',
}

export default function ComplaintItem({ item }: { item: Complaint }) {
  const statusStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.baru

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(212,175,106,0.14)', color: '#9c7a3f' }}
          >
            {CATEGORY_LABEL[item.category] ?? item.category}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {statusStyle.label}
          </span>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{item.title}</div>
      <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>{item.description}</p>
    </div>
  )
}
