'use client'

import { useState } from 'react'
import { getIplProofUrl } from '@/app/iuran-ipl/actions'
import { IPL_STATUS_LABEL } from '@/lib/ipl'

export function IplStatusBadge({ status, overdue = false }: { status: string; overdue?: boolean }) {
  const style =
    status === 'lunas'
      ? { background: 'rgba(47,107,79,0.12)', color: '#2f6b4f' }
      : status === 'sebagian'
        ? { background: 'rgba(212,175,106,0.22)', color: '#7a5a1f' }
        : { background: 'rgba(179,57,47,0.1)', color: '#b3392f' }

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={style}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {status === 'lunas' ? <path d="M20 6 9 17l-5-5" /> : status === 'sebagian' ? <path d="M5 12h14" /> : <path d="M12 8v5M12 16h.01" />}
      </svg>
      {IPL_STATUS_LABEL[status] ?? status}
      {overdue && status !== 'lunas' ? ' · telat' : ''}
    </span>
  )
}

// Buka bukti bayar lewat link sementara (1 jam). Jendela dibuka lebih dulu supaya tidak diblokir browser HP.
export function IplProofButton({ billId, label = 'Lihat bukti' }: { billId: string; label?: string }) {
  const [busy, setBusy] = useState(false)

  async function open() {
    setBusy(true)
    const win = window.open('', '_blank')
    const result = await getIplProofUrl(billId)
    setBusy(false)
    if (!result.url) {
      win?.close()
      alert(result.error ?? 'Bukti bayar tidak bisa dibuka.')
      return
    }
    if (win) win.location.href = result.url
    else window.location.href = result.url
  }

  return (
    <button type="button" onClick={open} disabled={busy} className="text-[11.5px] font-bold underline-offset-2 hover:underline" style={{ color: '#9c7a3f' }}>
      {busy ? 'Membuka...' : label}
    </button>
  )
}