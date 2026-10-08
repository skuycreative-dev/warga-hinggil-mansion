'use client'

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage, extFor, isImage } from '@/lib/image-upload'
import {
  applyLateFees,
  createIplPeriod,
  deleteIplBill,
  markIplPaid,
  setIplProof,
  updateIplBill,
  type IplFormState,
} from '@/app/iuran-ipl/actions'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'
import { IplProofButton, IplStatusBadge } from '@/components/ipl/IplBits'
import { billOutstanding, billTotal, IPL_METHOD_LABEL, isOverdue, sortHouse, type IplBill } from '@/lib/ipl'
import { cardStyle, dateLabel, formatAmountInput, inputStyle, labelStyle, parseAmount, periodLabel, rupiah, todayWib } from '@/lib/format'

const initialState: IplFormState = { error: '', success: false }
const MAX_PROOF = 5 * 1024 * 1024

type Draft = {
  amountDue: string
  lateFee: string
  amountPaid: string
  status: string
  paymentMethod: string
  paidAt: string
  dueDate: string
  note: string
}

function draftFrom(b: IplBill): Draft {
  return {
    amountDue: formatAmountInput(String(b.amount_due)),
    lateFee: formatAmountInput(String(b.late_fee || 0)),
    amountPaid: formatAmountInput(String(b.amount_paid || 0)),
    status: b.status,
    paymentMethod: b.payment_method ?? 'transfer',
    paidAt: b.paid_at ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(b.paid_at)) : todayWib(),
    dueDate: b.due_date ?? '',
    note: b.note ?? '',
  }
}

// canManage = Admin Manajemen / Superadmin. Selain itu (pengurus Paguyuban) hanya melihat.
export default function IplBillsPanel({
  bills,
  canManage,
  defaultAmount,
}: {
  bills: IplBill[]
  canManage: boolean
  defaultAmount: number
}) {
  const router = useRouter()
  const today = todayWib()
  const [state, formAction, isCreating] = useActionState(createIplPeriod, initialState)
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()
  const [openId, setOpenId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [rowError, setRowError] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'semua' | 'belum' | 'lunas' | 'telat'>('semua')
  const [query, setQuery] = useState('')
  const [newAmount, setNewAmount] = useState(defaultAmount > 0 ? formatAmountInput(String(defaultAmount)) : '')

  const periods = useMemo(() => Array.from(new Set(bills.map((b) => b.period))).sort().reverse(), [bills])
  const [period, setPeriod] = useState(periods[0] ?? '')

  useEffect(() => {
    if (state.success) router.refresh()
  }, [state, router])

  useEffect(() => {
    if (!periods.includes(period)) setPeriod(periods[0] ?? '')
  }, [periods, period])

  const periodBills = bills.filter((b) => b.period === period).sort((a, b) => sortHouse(a.nomor_rumah, b.nomor_rumah))
  const lunas = periodBills.filter((b) => b.status === 'lunas')
  const collected = periodBills.reduce((s, b) => s + Number(b.amount_paid || 0), 0)
  const outstanding = periodBills.reduce((s, b) => s + billOutstanding(b), 0)
  const overdueCount = periodBills.filter((b) => isOverdue(b, today)).length

  const shown = periodBills.filter((b) => {
    if (query && !b.nomor_rumah.toLowerCase().includes(query.trim().toLowerCase())) return false
    if (filter === 'lunas') return b.status === 'lunas'
    if (filter === 'belum') return b.status !== 'lunas'
    if (filter === 'telat') return isOverdue(b, today)
    return true
  })

  function toggle(b: IplBill) {
    setRowError('')
    if (openId === b.id) {
      setOpenId(null)
      setDraft(null)
    } else {
      setOpenId(b.id)
      setDraft(draftFrom(b))
    }
  }

  function save(b: IplBill) {
    if (!draft) return
    setRowError('')
    startTransition(async () => {
      const result = await updateIplBill(b.id, {
        amountDue: parseAmount(draft.amountDue),
        lateFee: parseAmount(draft.lateFee),
        amountPaid: parseAmount(draft.amountPaid),
        status: draft.status,
        paymentMethod: draft.paymentMethod,
        paidAt: draft.paidAt,
        dueDate: draft.dueDate,
        note: draft.note,
      })
      if (result.error) {
        setRowError(result.error)
        return
      }
      setOpenId(null)
      setDraft(null)
      router.refresh()
    })
  }

  async function quickPaid(b: IplBill) {
    if (!(await confirmModal(`Tandai Rumah ${b.nomor_rumah} lunas ${rupiah(billTotal(b))} (${periodLabel(b.period)})?`))) return
    startTransition(async () => {
      const result = await markIplPaid(b.id, 'transfer')
      if (result.error) await alertModal(result.error)
      router.refresh()
    })
  }

  async function remove(b: IplBill) {
    if (!(await confirmModal(`Hapus tagihan Rumah ${b.nomor_rumah} ${periodLabel(b.period)}?`, { danger: true }))) return
    startTransition(async () => {
      const result = await deleteIplBill(b.id)
      if (result.error) {
        setRowError(result.error)
        return
      }
      setOpenId(null)
      router.refresh()
    })
  }

  async function lateFees() {
    if (!(await confirmModal(`Terapkan denda ke semua tagihan ${periodLabel(period)} yang lewat jatuh tempo & belum lunas?`))) return
    startTransition(async () => {
      const result = await applyLateFees(period)
      if (result.error) await alertModal(result.error)
      else await alertModal(result.count > 0 ? `Denda diterapkan ke ${result.count} tagihan.` : 'Tidak ada tagihan yang perlu dikenai denda.')
      router.refresh()
    })
  }

  async function uploadProof(b: IplBill, file: File | undefined) {
    if (!file) return
    setRowError('')
    const isPdf = file.type === 'application/pdf'
    if (!isPdf && !isImage(file)) {
      setRowError('Bukti harus berupa foto atau PDF.')
      return
    }
    if (isPdf && file.size > MAX_PROOF) {
      setRowError('Ukuran PDF maksimal 5 MB.')
      return
    }

    setUploadingId(b.id)
    // Foto dikompres otomatis maks 2 MB sebelum diunggah
    let upload: Blob = file
    try {
      if (!isPdf) upload = await compressImage(file)
    } catch (e) {
      setUploadingId(null)
      setRowError(e instanceof Error ? e.message : 'Foto tidak bisa diproses.')
      return
    }
    const supabase = createClient()
    const path = `${b.house_id}/${b.period}-${Date.now()}.${extFor(upload.type || file.type)}`
    const { error } = await supabase.storage.from('ipl-proofs').upload(path, upload, { contentType: upload.type || file.type, upsert: false })
    if (error) {
      setUploadingId(null)
      setRowError(`Gagal mengunggah bukti: ${error.message}`)
      return
    }
    const result = await setIplProof(b.id, path)
    setUploadingId(null)
    if (result.error) {
      await supabase.storage.from('ipl-proofs').remove([path])
      setRowError(result.error)
      return
    }
    router.refresh()
  }

  async function removeProof(b: IplBill) {
    if (!(await confirmModal('Hapus bukti bayar ini?', { danger: true }))) return
    startTransition(async () => {
      const result = await setIplProof(b.id, null)
      if (result.error) setRowError(result.error)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {canManage ? (
        <form action={formAction} className="flex flex-col gap-2.5 rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
          <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Buat Tagihan IPL Bulanan</div>
          <p className="text-[11.5px]" style={{ color: '#5b543f' }}>
            Rumah dengan nominal khusus (tab Pengaturan) otomatis memakai nominalnya sendiri. Rumah yang sudah punya tagihan bulan itu dilewati.
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="ipl-period">Bulan</label>
              <input id="ipl-period" type="month" name="period" required defaultValue={today.slice(0, 7)} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="ipl-amount">Nominal standar (Rp)</label>
              <input
                id="ipl-amount"
                name="amount_due"
                inputMode="numeric"
                required
                placeholder="150.000"
                value={newAmount}
                onChange={(e) => setNewAmount(formatAmountInput(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
          {state.error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
          {state.success && state.message ? <p className="text-[12px] font-semibold" style={{ color: '#2f6b4f' }}>{state.message}</p> : null}
          <button type="submit" disabled={isCreating} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isCreating ? 0.7 : 1 }}>
            {isCreating ? 'Membuat...' : 'Buat Tagihan untuk Semua Rumah'}
          </button>
        </form>
      ) : null}

      {periods.length === 0 ? (
        <div className="rounded-2xl px-5 py-6 text-center text-sm" style={{ ...cardStyle, color: '#5b543f' }}>
          {canManage ? 'Belum ada tagihan IPL. Buat tagihan bulan pertama di atas.' : 'Belum ada tagihan IPL dari Manajemen.'}
        </div>
      ) : (
        <div className="rounded-2xl px-4 py-4 sm:px-5" style={cardStyle}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Pilih bulan" style={{ ...inputStyle, width: 'auto', padding: '7px 10px' }}>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {periodLabel(p)}
                </option>
              ))}
            </select>
            {canManage ? (
              <button type="button" onClick={lateFees} disabled={isPending} className="rounded-lg px-3 py-1.5 text-[11.5px] font-bold" style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
                Terapkan Denda Telat
              </button>
            ) : null}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Lunas', value: `${lunas.length}/${periodBills.length} rumah` },
              { label: 'Terkumpul', value: rupiah(collected) },
              { label: 'Sisa tagihan', value: rupiah(outstanding) },
              { label: 'Lewat jatuh tempo', value: `${overdueCount} rumah` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: '#faf7f0' }}>
                <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: '#9c7a3f' }}>{s.label}</div>
                <div className="mt-0.5 text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {(['semua', 'belum', 'telat', 'lunas'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="rounded-full px-3 py-1 text-[11.5px] font-bold"
                style={filter === f ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#faf7f0', color: '#5b543f' }}
              >
                {f === 'semua' ? 'Semua' : f === 'belum' ? 'Belum lunas' : f === 'telat' ? 'Telat' : 'Lunas'}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor rumah"
              aria-label="Cari nomor rumah"
              style={{ ...inputStyle, width: '150px', padding: '6px 10px', fontSize: '12.5px', marginLeft: 'auto' }}
            />
          </div>

          {rowError && !openId ? <p className="mb-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{rowError}</p> : null}

          <div className="flex flex-col">
            {shown.length === 0 ? (
              <p className="py-4 text-center text-[12.5px]" style={{ color: '#5b543f' }}>Tidak ada tagihan yang cocok.</p>
            ) : null}
            {shown.map((b) => {
              const overdue = isOverdue(b, today)
              const isOpen = openId === b.id && draft
              return (
                <div key={b.id} className="py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => canManage && toggle(b)} className="min-w-0 text-left" disabled={!canManage} style={{ cursor: canManage ? 'pointer' : 'default' }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Rumah {b.nomor_rumah}</span>
                        <IplStatusBadge status={b.status} overdue={overdue} />
                      </div>
                      <div className="mt-0.5 text-[11.5px]" style={{ color: '#5b543f' }}>
                        {rupiah(billTotal(b))}
                        {b.late_fee > 0 ? ` (termasuk denda ${rupiah(b.late_fee)})` : ''}
                        {b.status === 'sebagian' ? ` · dibayar ${rupiah(b.amount_paid)}` : ''}
                        {b.status !== 'lunas' && b.due_date ? ` · jatuh tempo ${dateLabel(b.due_date, false)}` : ''}
                        {b.status !== 'belum' && b.paid_at ? ` · bayar ${dateLabel(b.paid_at, false)}` : ''}
                        {b.payment_method ? ` · ${IPL_METHOD_LABEL[b.payment_method] ?? b.payment_method}` : ''}
                      </div>
                      {b.note ? <div className="mt-0.5 text-[11.5px] italic" style={{ color: '#7a6f55' }}>“{b.note}”</div> : null}
                    </button>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                      {canManage && b.status !== 'lunas' ? (
                        <button type="button" disabled={isPending} onClick={() => quickPaid(b)} className="rounded-lg px-3 py-1.5 text-[11.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
                          Tandai Lunas
                        </button>
                      ) : null}
                      <div className="flex gap-3">
                        {b.has_proof ? <IplProofButton billId={b.id} /> : null}
                        {canManage ? (
                          <button type="button" onClick={() => toggle(b)} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                            {isOpen ? 'Tutup' : 'Ubah'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {isOpen && draft ? (
                    <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-xl px-3.5 py-3.5 sm:grid-cols-2" style={{ background: '#faf7f0', border: '1px solid rgba(212,175,106,0.35)' }}>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Nominal IPL</label>
                        <input inputMode="numeric" value={draft.amountDue} onChange={(e) => setDraft({ ...draft, amountDue: formatAmountInput(e.target.value) })} style={{ ...inputStyle, background: '#fff' }} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Denda</label>
                        <input inputMode="numeric" value={draft.lateFee} placeholder="0" onChange={(e) => setDraft({ ...draft, lateFee: formatAmountInput(e.target.value) })} style={{ ...inputStyle, background: '#fff' }} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Status</label>
                        <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                          <option value="belum">Belum bayar</option>
                          <option value="sebagian">Sebagian (cicil)</option>
                          <option value="lunas">Lunas</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label style={labelStyle}>Jatuh tempo</label>
                        <input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                      </div>
                      {draft.status !== 'belum' ? (
                        <>
                          {draft.status === 'sebagian' ? (
                            <div className="flex flex-col gap-1">
                              <label style={labelStyle}>Sudah dibayar</label>
                              <input inputMode="numeric" value={draft.amountPaid} onChange={(e) => setDraft({ ...draft, amountPaid: formatAmountInput(e.target.value) })} style={{ ...inputStyle, background: '#fff' }} />
                            </div>
                          ) : null}
                          <div className="flex flex-col gap-1">
                            <label style={labelStyle}>Cara bayar</label>
                            <select value={draft.paymentMethod} onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value })} style={{ ...inputStyle, background: '#fff' }}>
                              {Object.entries(IPL_METHOD_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label style={labelStyle}>Tanggal bayar</label>
                            <input type="date" value={draft.paidAt} onChange={(e) => setDraft({ ...draft, paidAt: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                          </div>
                        </>
                      ) : null}
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label style={labelStyle}>Catatan (terlihat oleh warga rumah ini)</label>
                        <input value={draft.note} maxLength={300} placeholder="mis. bayar tunai ke pos, sisa dibayar tgl 20" onChange={(e) => setDraft({ ...draft, note: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label style={labelStyle}>Bukti bayar (foto dikompres otomatis / PDF maks 5 MB)</label>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={uploadingId === b.id}
                            onChange={(e) => {
                              void uploadProof(b, e.target.files?.[0])
                              e.target.value = ''
                            }}
                            className="max-w-full text-[12px] file:mr-2 file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-[12px] file:font-bold"
                            style={{ color: '#5b543f' }}
                          />
                          {uploadingId === b.id ? <span className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>Mengunggah...</span> : null}
                          {b.has_proof ? (
                            <>
                              <IplProofButton billId={b.id} />
                              <button type="button" onClick={() => removeProof(b)} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>
                                Hapus bukti
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      {rowError ? <p className="text-[12px] font-bold sm:col-span-2" style={{ color: '#b3392f' }}>{rowError}</p> : null}
                      <div className="flex gap-2 sm:col-span-2">
                        {b.status === 'belum' ? (
                          <button type="button" disabled={isPending} onClick={() => remove(b)} className="rounded-lg px-3 py-2 text-[12.5px] font-bold" style={{ background: '#fff', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
                            Hapus Tagihan
                          </button>
                        ) : null}
                        <button type="button" disabled={isPending} onClick={() => save(b)} className="flex-1 rounded-lg py-2 text-[12.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending ? 0.7 : 1 }}>
                          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}