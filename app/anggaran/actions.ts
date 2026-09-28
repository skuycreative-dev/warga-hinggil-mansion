'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'

export type AddTransactionState = { error: string; success: boolean }

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
    return { error: publicError(error), success: false }
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

// Catatan: tagihan & status Iuran IPL sekarang dikelola Admin Manajemen di app/iuran-ipl/actions.ts.
// Setoran IPL dari Manajemen masuk kas ini setelah dikonfirmasi Ketua / Bendahara (kategori "Setoran IPL Manajemen").