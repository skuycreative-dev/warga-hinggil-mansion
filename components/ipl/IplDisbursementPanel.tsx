'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelDisbursement, confirmDisbursement, createDisbursement, type IplFormState } from '@/app/iuran-ipl/actions'
import type { IplDisbursement } from '@/lib/ipl'
import { cardStyle, dateLabel, formatAmountInput, inputStyle, labelStyle, periodLabel, rupiah, todayWib } from '@/lib/format'
import { useConfirm, usePromptModal } from '@/components/ModalProvider'

const initialState: IplFormState = { error: '', success: false }

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  dikirim: { label: 'Menunggu konfirmasi', bg: 'rgba(212,175,106,0.22)', color: '#7a5a1f' },
  diterima: { label: 'Diterima Paguyuban', bg: 'rgba(47,107,79,0.12)', color: '#2f6b4f' },
  ditolak: { label: 'Ditolak', bg: 'rgba(179,57,47,0.1)', color: '#b3392f' },
}

export default function IplDisbursementPanel({
  items,
  canSend,
  canConfirm,
  totalCollected,
}: {
  items: IplDisbursement[]
  canSend: boolean
  canConfirm: boolean
  totalCollected: number
}) {
  const router = useRouter()
  const [state, formAction, isSending] = useActionState(createDisbursement, initialState)
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const promptModal = usePromptModal()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (state.success) {
      setAmount('')
      router.refresh()
    }
  }, [state, router])

  const received = items.filter((i) => i.status === 'diterima').reduce((s, i) => s + i.amount, 0)
  const waiting = items.filter((i) => i.status === 'dikirim')

  function run(fn: () => Promise<{ error: string | null }>) {
    setError('')
    startTransition(async () => {
      const result = await fn()
      if (result.error) setError(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>IPL Terkumpul</div>
          <div className="mt-1 text-lg font-bold" style={{ color: 'var(--brand-accent)' }}>{rupiah(totalCollected)}</div>
          <div className="text-[11px]" style={{ color: '#9c7a3f' }}>Diterima Manajemen dari warga</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Sudah Disetor</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#2f6b4f' }}>{rupiah(received)}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>Masuk kas Paguyuban</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Menunggu Konfirmasi</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#7a5a1f' }}>{rupiah(waiting.reduce((s, i) => s + i.amount, 0))}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>{waiting.length} setoran</div>
        </div>
      </div>

      {canSend ? (
        <form action={formAction} className="flex flex-col gap-2.5 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
          <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kirim Setoran ke Kas Paguyuban</div>
          <p className="text-[11.5px]" style={{ color: '#5b543f' }}>
            Setelah Ketua / Bendahara Paguyuban mengonfirmasi, nominal ini otomatis tercatat sebagai pemasukan kas Paguyuban.
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="disb-amount">Nominal (Rp)</label>
              <input id="disb-amount" name="amount" inputMode="numeric" required value={amount} onChange={(e) => setAmount(formatAmountInput(e.target.value))} placeholder="1.000.000" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="disb-period">Untuk IPL bulan (opsional)</label>
              <input id="disb-period" name="period" type="month" defaultValue={todayWib().slice(0, 7)} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label style={labelStyle} htmlFor="disb-note">Catatan (opsional)</label>
              <input id="disb-note" name="note" maxLength={300} placeholder="mis. transfer ke rekening kas RT, 20% dari IPL" style={inputStyle} />
            </div>
          </div>
          {state.error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
          {state.success && state.message ? <p className="text-[12px] font-semibold" style={{ color: '#2f6b4f' }}>{state.message}</p> : null}
          <button type="submit" disabled={isSending} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isSending ? 0.7 : 1 }}>
            {isSending ? 'Mengirim...' : 'Kirim Setoran'}
          </button>
        </form>
      ) : null}

      {error ? <p className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <div className="rounded-2xl px-5 py-6 text-center text-sm" style={{ ...cardStyle, color: '#5b543f' }}>Belum ada setoran IPL.</div>
        ) : (
          items.map((i) => {
            const s = STATUS_STYLE[i.status]
            return (
              <div key={i.id} className="rounded-2xl px-4 py-3.5" style={cardStyle}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{rupiah(i.amount)}</div>
                    <div className="text-[11.5px]" style={{ color: '#5b543f' }}>
                      {i.period ? `IPL ${periodLabel(i.period)} · ` : ''}dikirim {dateLabel(i.created_at)}
                      {i.created_by_name ? ` oleh ${i.created_by_name}` : ''}
                    </div>
                    {i.note ? <div className="mt-0.5 text-[11.5px] italic" style={{ color: '#7a6f55' }}>“{i.note}”</div> : null}
                    {i.status !== 'dikirim' && i.confirmed_by_name ? (
                      <div className="mt-0.5 text-[11.5px]" style={{ color: '#5b543f' }}>
                        {i.status === 'diterima' ? 'Dikonfirmasi' : 'Ditolak'} {i.confirmed_by_name}
                        {i.confirmed_at ? ` · ${dateLabel(i.confirmed_at)}` : ''}
                        {i.reject_reason ? ` · ${i.reject_reason}` : ''}
                      </div>
                    ) : null}
                  </div>
                  <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                {i.status === 'dikirim' && (canConfirm || canSend) ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {canConfirm ? (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={async () => {
                            const reason = (await promptModal('Alasan menolak setoran ini?')) ?? ''
                            if (!reason.trim()) return
                            run(() => confirmDisbursement(i.id, false, reason))
                          }}
                          className="rounded-lg px-3 py-2 text-[12px] font-bold"
                          style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={async () => {
                            if (!(await confirmModal(`Konfirmasi setoran ${rupiah(i.amount)} sudah diterima? Otomatis dicatat sebagai pemasukan kas Paguyuban.`))) return
                            run(() => confirmDisbursement(i.id, true, ''))
                          }}
                          className="flex-1 rounded-lg px-3 py-2 text-[12px] font-bold"
                          style={{ background: '#1a1305', color: 'var(--brand-accent)' }}
                        >
                          Sudah Diterima
                        </button>
                      </>
                    ) : null}
                    {canSend ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={async () => {
                          if (!(await confirmModal('Batalkan setoran ini?', { danger: true }))) return
                          run(() => cancelDisbursement(i.id))
                        }}
                        className="rounded-lg px-3 py-2 text-[12px] font-bold"
                        style={{ background: '#faf7f0', color: '#5b543f' }}
                      >
                        Batalkan
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}