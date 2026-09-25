'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AddTransactionState = { error: string; success: boolean }

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return null
  }

  return supabase
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

  const amount = Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: 'Nominal harus berupa angka lebih dari 0.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return { error: 'Kamu tidak punya akses untuk menambah transaksi.', success: false }
  }

  const { error } = await supabase.from('iuran_transactions').insert({
    type,
    category,
    amount,
    description: description || null,
    transaction_date: transactionDate,
    created_by: user.id,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/anggaran')
  return { error: '', success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await requireAdmin()
  if (!supabase) return

  await supabase.from('iuran_transactions').delete().eq('id', id)
  revalidatePath('/anggaran')
}
