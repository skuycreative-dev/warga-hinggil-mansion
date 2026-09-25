'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '@/app/anggaran/actions'

type Trx = {
  id: string
  type: string
  category: string
  amount: number
  description: string | null
  transaction_date: string
  author_name: string
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AnggaranList({ transactions, canManage }: { transactions: Trx[]; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Hapus transaksi ini?')) return
    startTransition(async () => {
      await deleteTransaction(id)
      router.refresh()
    })
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada transaksi tercatat.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {transactions.map((t) => {
        const isIncome = t.type === 'pemasukan'
        return (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.category}</div>
              <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {t.author_name}
              </div>
              {t.description ? (
                <div className="mt-1 text-[12px] font-medium" style={{ color: '#5b543f' }}>{t.description}</div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: isIncome ? '#2f8a4f' : '#b3392f' }}>
                {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
              </span>
              {canManage ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(t.id)}
                  style={{ color: '#b3392f' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
