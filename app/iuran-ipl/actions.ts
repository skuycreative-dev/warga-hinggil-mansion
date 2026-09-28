'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'
import { parseAmount, todayWib } from '@/lib/format'

// Iuran IPL dibayar warga ke Admin Manajemen (keputusan 28 Sep 2026).
// Database memeriksa ulang semua aturan di bawah (RLS Step 316).

export type IplFormState = { error: string; success: boolean; message?: string }

const METHODS = ['transfer', 'tunai', 'qris', 'lainnya']
const STATUSES = ['belum', 'sebagian', 'lunas']

async function requireIplManager() {
  const access = await getMyAccess()
  if (!access.canManageIpl) return null
  const supabase = await createClient()
  return { supabase, userId: access.userId }
}

function refresh() {
  revalidatePath('/iuran-ipl')
  revalidatePath('/manajemen')
  revalidatePath('/paguyuban')
  revalidatePath('/anggaran')
  revalidatePath('/dashboard')
}

function dueDateFor(period: string, dueDay: number) {
  const [y, m] = period.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const day = Math.min(Math.max(dueDay, 1), last)
  return `${period}-${String(day).padStart(2, '0')}`
}

// ---------------------------------------------------------------------
// Tagihan bulanan untuk semua rumah (pakai nominal khusus rumah kalau ada)
// ---------------------------------------------------------------------
export async function createIplPeriod(prevState: IplFormState, formData: FormData): Promise<IplFormState> {
  const period = String(formData.get('period') ?? '').trim()
  const defaultAmount = parseAmount(formData.get('amount_due'))

  if (!/^\d{4}-\d{2}$/.test(period)) return { error: 'Pilih bulan tagihan.', success: false }
  if (defaultAmount <= 0) return { error: 'Nominal standar IPL harus lebih dari 0.', success: false }

  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Hanya Admin Manajemen yang bisa membuat tagihan IPL.', success: false }

  const [{ data: houses }, { data: existing }, { data: rates }, { data: settings }] = await Promise.all([
    ctx.supabase.from('houses').select('id'),
    ctx.supabase.from('iuran_payment_status').select('house_id').eq('period', period),
    ctx.supabase.from('ipl_house_rates').select('house_id, amount'),
    ctx.supabase.from('ipl_settings').select('due_day').eq('id', 1).maybeSingle(),
  ])

  const already = new Set((existing ?? []).map((r) => r.house_id as string))
  const rateMap = new Map((rates ?? []).map((r) => [r.house_id as string, Number(r.amount)]))
  const dueDate = dueDateFor(period, Number(settings?.due_day ?? 10))

  const rows = (houses ?? [])
    .filter((h) => !already.has(h.id as string))
    .map((h) => ({
      house_id: h.id as string,
      period,
      amount_due: rateMap.get(h.id as string) ?? defaultAmount,
      amount_paid: 0,
      late_fee: 0,
      status: 'belum',
      due_date: dueDate,
      updated_by: ctx.userId,
    }))

  if (rows.length === 0) return { error: '', success: true, message: 'Semua rumah sudah punya tagihan untuk bulan ini.' }

  const { error } = await ctx.supabase.from('iuran_payment_status').insert(rows)
  if (error) {
    await logError('iuran-ipl: buat tagihan', error.message, { period })
    return { error: error.message, success: false }
  }

  refresh()
  return { error: '', success: true, message: `Tagihan ${rows.length} rumah dibuat, jatuh tempo ${dueDate.split('-').reverse().join('-')}.` }
}

// ---------------------------------------------------------------------
// Ubah satu tagihan: nominal, denda, jumlah dibayar, status, cara bayar, catatan
// ---------------------------------------------------------------------
export type IplBillInput = {
  amountDue: number
  lateFee: number
  amountPaid: number
  status: string
  paymentMethod: string
  note: string
  paidAt: string
  dueDate: string
}

export async function updateIplBill(id: string, input: IplBillInput) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Hanya Admin Manajemen yang bisa mengubah tagihan IPL.' }

  if (!STATUSES.includes(input.status)) return { error: 'Status tidak valid.' }
  if (!(input.amountDue > 0)) return { error: 'Nominal tagihan harus lebih dari 0.' }
  if (input.lateFee < 0 || input.amountPaid < 0) return { error: 'Nominal tidak boleh minus.' }
  if (input.paymentMethod && !METHODS.includes(input.paymentMethod)) return { error: 'Cara bayar tidak valid.' }
  if (input.note.trim().length > 300) return { error: 'Catatan maksimal 300 karakter.' }
  if (input.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) return { error: 'Tanggal jatuh tempo tidak valid.' }
  if (input.paidAt && !/^\d{4}-\d{2}-\d{2}$/.test(input.paidAt)) return { error: 'Tanggal bayar tidak valid.' }

  const total = input.amountDue + input.lateFee
  let status = input.status
  let amountPaid = input.amountPaid

  // Status mengikuti jumlah yang dibayar supaya data selalu konsisten
  if (status === 'lunas' && amountPaid < total) amountPaid = total
  if (status === 'belum') amountPaid = 0
  if (status === 'sebagian') {
    if (amountPaid <= 0) return { error: 'Isi jumlah yang sudah dibayar untuk status Sebagian.' }
    if (amountPaid >= total) status = 'lunas'
  }

  const paid = status !== 'belum'
  const { data, error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({
      amount_due: input.amountDue,
      late_fee: input.lateFee,
      amount_paid: amountPaid,
      status,
      payment_method: paid ? input.paymentMethod || null : null,
      note: input.note.trim() || null,
      due_date: input.dueDate || null,
      paid_at: paid ? new Date(`${input.paidAt || todayWib()}T12:00:00+07:00`).toISOString() : null,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id')

  if (error) {
    await logError('iuran-ipl: ubah tagihan', error.message, { id })
    return { error: error.message }
  }
  if (!data || data.length === 0) return { error: 'Tagihan tidak ditemukan.' }

  refresh()
  return { error: null }
}

// Tandai lunas cepat (satu klik) dengan tanggal hari ini
export async function markIplPaid(id: string, paymentMethod: string) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Hanya Admin Manajemen yang bisa mengubah tagihan IPL.' }

  const { data: row } = await ctx.supabase.from('iuran_payment_status').select('amount_due, late_fee, status').eq('id', id).maybeSingle()
  if (!row) return { error: 'Tagihan tidak ditemukan.' }
  if (row.status === 'lunas') return { error: 'Tagihan ini sudah lunas.' }

  const { error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({
      status: 'lunas',
      amount_paid: Number(row.amount_due) + Number(row.late_fee ?? 0),
      payment_method: METHODS.includes(paymentMethod) ? paymentMethod : 'transfer',
      paid_at: new Date().toISOString(),
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

export async function deleteIplBill(id: string) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { data: row } = await ctx.supabase.from('iuran_payment_status').select('proof_path, status').eq('id', id).maybeSingle()
  if (!row) return { error: 'Tagihan tidak ditemukan.' }
  if (row.status !== 'belum') return { error: 'Tagihan yang sudah ada pembayarannya tidak bisa dihapus. Ubah statusnya ke Belum dulu.' }

  const { error } = await ctx.supabase.from('iuran_payment_status').delete().eq('id', id)
  if (error) return { error: error.message }
  if (row.proof_path) await ctx.supabase.storage.from('ipl-proofs').remove([row.proof_path])

  refresh()
  return { error: null }
}

// Terapkan denda ke tagihan yang lewat jatuh tempo & belum lunas (yang belum kena denda)
export async function applyLateFees(period: string) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.', count: 0 }
  if (!/^\d{4}-\d{2}$/.test(period)) return { error: 'Periode tidak valid.', count: 0 }

  const { data: settings } = await ctx.supabase.from('ipl_settings').select('late_fee').eq('id', 1).maybeSingle()
  const fee = Number(settings?.late_fee ?? 0)
  if (fee <= 0) return { error: 'Atur nominal denda dulu di tab Pengaturan.', count: 0 }

  const { data, error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({ late_fee: fee, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq('period', period)
    .neq('status', 'lunas')
    .eq('late_fee', 0)
    .lt('due_date', todayWib())
    .select('id')

  if (error) return { error: error.message, count: 0 }
  refresh()
  return { error: null, count: data?.length ?? 0 }
}

// ---------------------------------------------------------------------
// Bukti bayar: file diunggah langsung dari HP ke penyimpanan privat, lalu path-nya disimpan di sini
// ---------------------------------------------------------------------
export async function setIplProof(id: string, path: string | null) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { data: row } = await ctx.supabase.from('iuran_payment_status').select('house_id, proof_path').eq('id', id).maybeSingle()
  if (!row) return { error: 'Tagihan tidak ditemukan.' }
  if (path && !path.startsWith(`${row.house_id}/`)) return { error: 'Lokasi file bukti tidak valid.' }

  const { error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({ proof_path: path, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  if (row.proof_path && row.proof_path !== path) {
    await ctx.supabase.storage.from('ipl-proofs').remove([row.proof_path])
  }

  refresh()
  return { error: null }
}

// Link sementara (1 jam) untuk membuka bukti bayar; database menentukan siapa yang boleh
export async function getIplProofUrl(id: string) {
  const supabase = await createClient()
  const { data: row } = await supabase.from('iuran_payment_status').select('proof_path').eq('id', id).maybeSingle()
  if (!row?.proof_path) return { url: null, error: 'Bukti bayar tidak ditemukan.' }

  const { data, error } = await supabase.storage.from('ipl-proofs').createSignedUrl(row.proof_path, 60 * 60)
  if (error || !data) return { url: null, error: 'Bukti bayar tidak bisa dibuka.' }
  return { url: data.signedUrl, error: null }
}

// ---------------------------------------------------------------------
// Pengaturan: nominal standar, tanggal jatuh tempo, denda, nominal khusus per rumah
// ---------------------------------------------------------------------
export async function saveIplSettings(prevState: IplFormState, formData: FormData): Promise<IplFormState> {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const defaultAmount = parseAmount(formData.get('default_amount'))
  const lateFee = parseAmount(formData.get('late_fee'))
  const dueDay = Number(formData.get('due_day'))

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) return { error: 'Tanggal jatuh tempo antara 1 sampai 28.', success: false }

  const { error } = await ctx.supabase
    .from('ipl_settings')
    .update({ default_amount: defaultAmount, late_fee: lateFee, due_day: dueDay, updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) return { error: error.message, success: false }
  refresh()
  return { error: '', success: true, message: 'Pengaturan IPL disimpan.' }
}

export async function setHouseRate(houseId: string, amount: number | null, note: string) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  if (amount === null) {
    const { error } = await ctx.supabase.from('ipl_house_rates').delete().eq('house_id', houseId)
    if (error) return { error: error.message }
  } else {
    if (!(amount > 0)) return { error: 'Nominal harus lebih dari 0.' }
    const { error } = await ctx.supabase.from('ipl_house_rates').upsert({
      house_id: houseId,
      amount,
      note: note.trim().slice(0, 120) || null,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    if (error) return { error: error.message }
  }

  refresh()
  return { error: null }
}

// ---------------------------------------------------------------------
// Setoran IPL ke kas Paguyuban
// ---------------------------------------------------------------------
export async function createDisbursement(prevState: IplFormState, formData: FormData): Promise<IplFormState> {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Hanya Admin Manajemen yang bisa mengirim setoran.', success: false }

  const amount = parseAmount(formData.get('amount'))
  const period = String(formData.get('period') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()

  if (amount <= 0) return { error: 'Nominal setoran harus lebih dari 0.', success: false }
  if (period && !/^\d{4}-\d{2}$/.test(period)) return { error: 'Periode tidak valid.', success: false }
  if (note.length > 300) return { error: 'Catatan maksimal 300 karakter.', success: false }

  const { error } = await ctx.supabase.from('ipl_disbursements').insert({
    amount,
    period: period || null,
    note: note || null,
    created_by: ctx.userId,
  })

  if (error) {
    await logError('iuran-ipl: kirim setoran', error.message, { amount })
    return { error: error.message, success: false }
  }

  refresh()
  return { error: '', success: true, message: 'Setoran dikirim. Menunggu konfirmasi Ketua / Bendahara Paguyuban.' }
}

export async function cancelDisbursement(id: string) {
  const ctx = await requireIplManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { data, error } = await ctx.supabase.from('ipl_disbursements').delete().eq('id', id).eq('status', 'dikirim').select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Setoran yang sudah diproses Paguyuban tidak bisa dibatalkan.' }

  refresh()
  return { error: null }
}

export async function confirmDisbursement(id: string, accept: boolean, reason: string) {
  const access = await getMyAccess()
  if (!access.canConfirmIplDisbursement) return { error: 'Hanya Ketua Paguyuban dan Bendahara yang bisa mengonfirmasi setoran.' }

  const supabase = await createClient()
  const { error } = await supabase.rpc('confirm_ipl_disbursement', { p_id: id, p_accept: accept, p_reason: reason || null })
  if (error) return { error: error.message }

  refresh()
  return { error: null }
}