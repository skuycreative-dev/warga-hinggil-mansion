'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'

export type AddTransactionState = { error: string; success: boolean }
export type IuranPeriodState = { error: string; success: boolean; message?: string }

// Kebutuhan #5: hanya Ketua Paguyuban, Bendahara, dan Superadmin (database juga memeriksa ulang)
async function requireFinanceManager() {
  const access = await getMyAccess()
  if (!access.canManageFinance) return null
  const supabase = await createClient()
  return { supabase, userId: access.userId }
}

function refresh() {
  revalidatePath('/anggaran')
  revalidatePath('/iuran-ipl')
  revalidatePath('/paguyuban')
  revalidatePath('/dashboard')
}

export async function addTransaction(prevState: AddTransactionState, formData: FormData): Promise<AddTransactionState> {
  const type = formData.get('type') as string
  const category = (formData.get('category') as string)?.trim()
  const amountRaw = (formData.get('amount') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const transactionDate = formData.get('transaction_date') as string

  if (!type || !category || !amountRaw || !transactionDate) {
    return { error: 'Jenis, kategori, nominal, dan tanggal wajib diisi.', success: false }
  }

  const amount = Number(amountRaw.replace(/[^0-9]/g, ''))
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Nominal harus berupa angka lebih dari 0.', success: false }
  }

  const ctx = await requireFinanceManager()
  if (!ctx) return { error: 'Hanya Ketua Paguyuban dan Bendahara yang bisa menambah transaksi.', success: false }

  const { error } = await ctx.supabase.from('iuran_transactions').insert({
    type,
    category,
    amount,
    description: description || null,
    transaction_date: transactionDate,
    created_by: ctx.userId,
  })

  if (error) {
    await logError('keuangan warga: tambah transaksi', error.message, { userId: ctx.userId })
    return { error: error.message, success: false }
  }

  refresh()
  return { error: '', success: true }
}

export async function deleteTransaction(id: string) {
  const ctx = await requireFinanceManager()
  if (!ctx) return

  await ctx.supabase.from('iuran_transactions').delete().eq('id', id)
  refresh()
}

// ---------------------------------------------------------------------
// Status iuran per rumah per bulan (tabel iuran_payment_status)
// ---------------------------------------------------------------------

// Buat tagihan iuran satu bulan untuk semua rumah (rumah yang sudah punya tagihan bulan itu dilewati)
export async function createIuranPeriod(prevState: IuranPeriodState, formData: FormData): Promise<IuranPeriodState> {
  const period = ((formData.get('period') as string) ?? '').trim()
  const amount = Number(((formData.get('amount_due') as string) ?? '').replace(/[^0-9]/g, ''))

  if (!/^\d{4}-\d{2}$/.test(period)) return { error: 'Pilih bulan tagihan.', success: false }
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Nominal iuran harus lebih dari 0.', success: false }

  const ctx = await requireFinanceManager()
  if (!ctx) return { error: 'Hanya Ketua Paguyuban dan Bendahara yang bisa membuat tagihan iuran.', success: false }

  const [{ data: houses }, { data: existing }] = await Promise.all([
    ctx.supabase.from('houses').select('id'),
    ctx.supabase.from('iuran_payment_status').select('house_id').eq('period', period),
  ])

  const already = new Set((existing ?? []).map((r) => r.house_id as string))
  const rows = (houses ?? [])
    .filter((h) => !already.has(h.id as string))
    .map((h) => ({ house_id: h.id as string, period, amount_due: amount, amount_paid: 0, status: 'belum', updated_by: ctx.userId }))

  if (rows.length === 0) {
    return { error: '', success: true, message: 'Semua rumah sudah punya tagihan untuk bulan ini.' }
  }

  const { error } = await ctx.supabase.from('iuran_payment_status').insert(rows)
  if (error) {
    await logError('keuangan warga: buat tagihan', error.message, { period })
    return { error: error.message, success: false }
  }

  refresh()
  return { error: '', success: true, message: `Tagihan ${rows.length} rumah berhasil dibuat.` }
}

// Tandai lunas: sekaligus mencatat pemasukan "Iuran IPL" di kas Paguyuban supaya laporan selalu cocok
export async function markIuranPaid(statusId: string) {
  const ctx = await requireFinanceManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { data: row } = await ctx.supabase
    .from('iuran_payment_status')
    .select('id, period, amount_due, status, house:houses(nomor_rumah)')
    .eq('id', statusId)
    .maybeSingle()

  if (!row) return { error: 'Data iuran tidak ditemukan.' }
  if (row.status === 'lunas') return { error: 'Iuran ini sudah lunas.' }

  const house = Array.isArray((row as any).house) ? (row as any).house[0] : (row as any).house
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())

  const { data: tx, error: txError } = await ctx.supabase
    .from('iuran_transactions')
    .insert({
      type: 'pemasukan',
      category: 'Iuran IPL',
      amount: Number(row.amount_due),
      description: `Iuran IPL Rumah ${house?.nomor_rumah ?? '-'} periode ${row.period}`,
      transaction_date: today,
      created_by: ctx.userId,
    })
    .select('id')
    .single()

  if (txError || !tx) return { error: txError?.message ?? 'Gagal mencatat pemasukan.' }

  const { error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({
      status: 'lunas',
      amount_paid: Number(row.amount_due),
      paid_at: new Date().toISOString(),
      transaction_id: tx.id,
      updated_by: ctx.userId,
    })
    .eq('id', statusId)

  if (error) {
    await ctx.supabase.from('iuran_transactions').delete().eq('id', tx.id)
    return { error: error.message }
  }

  refresh()
  return { error: null }
}

// Batalkan lunas (salah tandai): hapus juga pemasukan yang tadi dicatat otomatis
export async function unmarkIuranPaid(statusId: string) {
  const ctx = await requireFinanceManager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { data: row } = await ctx.supabase.from('iuran_payment_status').select('id, transaction_id').eq('id', statusId).maybeSingle()
  if (!row) return { error: 'Data iuran tidak ditemukan.' }

  const { error } = await ctx.supabase
    .from('iuran_payment_status')
    .update({ status: 'belum', amount_paid: 0, paid_at: null, transaction_id: null, updated_by: ctx.userId })
    .eq('id', statusId)
  if (error) return { error: error.message }

  if (row.transaction_id) {
    await ctx.supabase.from('iuran_transactions').delete().eq('id', row.transaction_id)
  }

  refresh()
  return { error: null }
}