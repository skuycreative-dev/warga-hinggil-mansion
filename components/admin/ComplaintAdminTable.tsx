'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateComplaintStatus } from '@/app/pengaduan/actions'

type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
  house?: { nomor_rumah: string } | null
  creator?: { full_name: string } | null
}

const STATUS_OPTIONS = ['baru', 'diproses', 'selesai']

const CATEGORY_LABEL: Record<string, string> = {
  kebersihan: 'Kebersihan',
  keamanan: 'Keamanan',
  fasilitas: 'Fasilitas',
  lainnya: 'Lainnya',
}

const selectStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '9px',
  padding: '6px 9px',
  color: '#1f1a10',
  fontSize: '12.5px',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function ComplaintAdminTable({ complaints }: { complaints: Complaint[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateComplaintStatus(id, status)
      router.refresh()
    })
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Belum ada pengaduan masuk.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {complaints.map((c) => (
        <div key={c.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div>
              <span
                className="mr-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'rgba(212,175,106,0.14)', color: '#9c7a3f' }}
              >
                {CATEGORY_LABEL[c.category] ?? c.category}
              </span>
              <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{c.title}</span>
            </div>
            <select
              value={c.status}
              disabled={isPending}
              onChange={(e) => handleStatusChange(c.id, e.target.value)}
              style={selectStyle}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} style={{ color: '#1a1305' }}>
                  {s === 'baru' ? 'Baru' : s === 'diproses' ? 'Diproses' : 'Selesai'}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[13px]" style={{ color: '#5b543f' }}>{c.description}</p>
          <div className="mt-2 text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
            {c.creator?.full_name ?? 'Warga'} {c.house?.nomor_rumah ? `· Rumah ${c.house.nomor_rumah}` : ''} ·{' '}
            {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  )
}
