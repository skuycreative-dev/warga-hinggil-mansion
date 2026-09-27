'use server'

import { revalidatePath } from 'next/cache'
import { getMyHousehold } from '@/lib/household-access'
import { logError } from '@/lib/log-error'

export type HouseholdTxInput = {
  type: string
  category: string
  amount: number
  description: string
  transactionDate: string
}

export type HouseholdTxState = { error: string; success: boolean }

function validate(input: HouseholdTxInput): string | null {
  if (input.type !== 'pemasukan' && input.type !== 'pengeluaran') return 'Jenis transaksi tidak valid.'
  if (!input.category.trim()) return 'Kategori wajib diisi.'
  if (input.category.trim().length > 40) return 'Kategori maksimal 40 karakter.'
  if (!Number.isFinite(input.amount) || input.amount <= 0) return 'Nominal harus lebih dari 0.'
  if (input.amount > 1_000_000_000_000) return 'Nominal terlalu besar.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.transactionDate)) return 'Tanggal tidak valid.'
  if (input.description.trim().length > 200) return 'Keterangan maksimal 200 karakter.'
  return null
}

function parseAmount(raw: string) {
  return Number(raw.replace(/[^0-9]/g, ''))
}

export async function addHouseholdTransaction(prevState: HouseholdTxState, formData: FormData): Promise<HouseholdTxState> {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) {
    return { error: 'Hanya Kepala Keluarga dan Ibu Rumah Tangga yang bisa mencatat keuangan rumah.', success: false }
  }

  const input: HouseholdTxInput = {
    type: (formData.get('type') as string) ?? '',
    category: (formData.get('category') as string) ?? '',
    amount: parseAmount((formData.get('amount') as string) ?? ''),
    description: (formData.get('description') as string) ?? '',
    transactionDate: (formData.get('transaction_date') as string) ?? '',
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid, success: false }

  const { error } = await ctx.supabase.from('household_transactions').insert({
    house_id: ctx.houseId,
    type: input.type,
    category: input.category.trim(),
    amount: input.amount,
    description: input.description.trim() || null,
    transaction_date: input.transactionDate,
    created_by: ctx.userId,
  })

  if (error) {
    await logError('keuangan-rumah: tambah', error.message, { userId: ctx.userId })
    return { error: 'Gagal menyimpan transaksi.', success: false }
  }

  revalidatePath('/keuangan-rumah')
  return { error: '', success: true }
}

export async function updateHouseholdTransaction(id: string, input: HouseholdTxInput) {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) return { error: 'Tidak punya akses.' }

  const invalid = validate(input)
  if (invalid) return { error: invalid }

  const { data, error } = await ctx.supabase
    .from('household_transactions')
    .update({
      type: input.type,
      category: input.category.trim(),
      amount: input.amount,
      description: input.description.trim() || null,
      transaction_date: input.transactionDate,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('house_id', ctx.houseId)
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Transaksi tidak ditemukan.' }

  revalidatePath('/keuangan-rumah')
  return { error: null }
}

export async function deleteHouseholdTransaction(id: string) {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) return { error: 'Tidak punya akses.' }

  const { error } = await ctx.supabase.from('household_transactions').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: error.message }

  revalidatePath('/keuangan-rumah')
  return { error: null }
}