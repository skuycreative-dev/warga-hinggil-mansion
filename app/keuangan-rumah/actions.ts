'use server'

import { revalidatePath } from 'next/cache'
import { getMyHousehold } from '@/lib/household-access'
import { logError } from '@/lib/log-error'
import { parseAmount } from '@/lib/format'

// Semua aksi di sini hanya untuk Kepala Keluarga & Ibu Rumah Tangga (terkonfirmasi) di rumah yang sama.
// Database memeriksa ulang (is_household_manager + trigger Step 317).

const MAX_AMOUNT = 1_000_000_000_000
const ACCOUNT_KINDS = ['bank', 'tunai', 'ewallet', 'investasi', 'lainnya']
const GOAL_CATEGORIES = ['pendidikan', 'tabungan', 'dana_darurat', 'ibadah', 'rumah', 'kendaraan', 'kesehatan', 'liburan', 'lainnya']

export type HouseholdTxInput = {
  type: string
  category: string
  amount: number
  description: string
  transactionDate: string
  accountId?: string
  toAccountId?: string
}

export type HouseholdTxState = { error: string; success: boolean }
export type HhFormState = { error: string; success: boolean; message?: string }

async function manager() {
  const ctx = await getMyHousehold()
  if (!ctx.isManager || !ctx.houseId) return null
  return ctx as typeof ctx & { houseId: string }
}

function refresh() {
  revalidatePath('/keuangan-rumah')
}

function isDate(v: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}

function friendly(message: string) {
  if (message.includes('household_transactions_account_fk') || message.includes('household_transactions_to_account_fk')) {
    return 'Rekening ini sudah punya transaksi. Arsipkan saja supaya riwayat tetap rapi.'
  }
  if (message.includes('household_transactions_transfer_check')) return 'Rekening asal dan tujuan transfer harus berbeda.'
  return message
}

// ---------------------------------------------------------------------
// TRANSAKSI (pemasukan, pengeluaran, transfer antar rekening)
// ---------------------------------------------------------------------
function validate(input: HouseholdTxInput): string | null {
  if (!['pemasukan', 'pengeluaran', 'transfer'].includes(input.type)) return 'Jenis transaksi tidak valid.'
  if (input.type === 'transfer') {
    if (!input.accountId || !input.toAccountId) return 'Pilih rekening asal dan tujuan.'
    if (input.accountId === input.toAccountId) return 'Rekening asal dan tujuan harus berbeda.'
  }
  if (!input.category.trim()) return 'Kategori wajib diisi.'
  if (input.category.trim().length > 40) return 'Kategori maksimal 40 karakter.'
  if (!Number.isFinite(input.amount) || input.amount <= 0) return 'Nominal harus lebih dari 0.'
  if (input.amount > MAX_AMOUNT) return 'Nominal terlalu besar.'
  if (!isDate(input.transactionDate)) return 'Tanggal tidak valid.'
  if (input.description.trim().length > 200) return 'Keterangan maksimal 200 karakter.'
  return null
}

function txColumns(input: HouseholdTxInput) {
  const isTransfer = input.type === 'transfer'
  return {
    type: input.type,
    category: isTransfer ? input.category.trim() || 'Transfer' : input.category.trim(),
    amount: input.amount,
    description: input.description.trim() || null,
    transaction_date: input.transactionDate,
    account_id: input.accountId || null,
    to_account_id: isTransfer ? input.toAccountId || null : null,
  }
}

export async function addHouseholdTransaction(prevState: HouseholdTxState, formData: FormData): Promise<HouseholdTxState> {
  const ctx = await manager()
  if (!ctx) return { error: 'Hanya Kepala Keluarga dan Ibu Rumah Tangga yang bisa mencatat keuangan rumah.', success: false }

  const type = String(formData.get('type') ?? '')
  const input: HouseholdTxInput = {
    type,
    category: type === 'transfer' ? 'Transfer' : String(formData.get('category') ?? ''),
    amount: parseAmount(formData.get('amount')),
    description: String(formData.get('description') ?? ''),
    transactionDate: String(formData.get('transaction_date') ?? ''),
    accountId: String(formData.get('account_id') ?? ''),
    toAccountId: String(formData.get('to_account_id') ?? ''),
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid, success: false }

  const { error } = await ctx.supabase.from('household_transactions').insert({
    house_id: ctx.houseId,
    ...txColumns(input),
    created_by: ctx.userId,
  })

  if (error) {
    await logError('keuangan-rumah: tambah', error.message, { userId: ctx.userId })
    return { error: friendly(error.message), success: false }
  }

  refresh()
  return { error: '', success: true }
}

export async function updateHouseholdTransaction(id: string, input: HouseholdTxInput) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const invalid = validate(input)
  if (invalid) return { error: invalid }

  const { data, error } = await ctx.supabase
    .from('household_transactions')
    .update({ ...txColumns(input), updated_by: ctx.userId, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('house_id', ctx.houseId)
    .select('id')

  if (error) return { error: friendly(error.message) }
  if (!data || data.length === 0) return { error: 'Transaksi tidak ditemukan.' }

  refresh()
  return { error: null }
}

export async function deleteHouseholdTransaction(id: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { error } = await ctx.supabase.from('household_transactions').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: error.message }

  refresh()
  return { error: null }
}

// ---------------------------------------------------------------------
// REKENING
// ---------------------------------------------------------------------
export async function saveAccount(prevState: HhFormState, formData: FormData): Promise<HhFormState> {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const kind = String(formData.get('kind') ?? 'bank')
  const openingRaw = String(formData.get('opening_balance') ?? '')
  const negative = openingRaw.trim().startsWith('-')
  const opening = parseAmount(openingRaw) * (negative ? -1 : 1)

  if (!name || name.length > 40) return { error: 'Nama rekening 1-40 karakter.', success: false }
  if (!ACCOUNT_KINDS.includes(kind)) return { error: 'Jenis rekening tidak valid.', success: false }
  if (Math.abs(opening) > MAX_AMOUNT) return { error: 'Saldo awal terlalu besar.', success: false }

  const values = { name, kind, opening_balance: opening, updated_at: new Date().toISOString() }
  const { error } = id
    ? await ctx.supabase.from('household_accounts').update(values).eq('id', id).eq('house_id', ctx.houseId)
    : await ctx.supabase.from('household_accounts').insert({ ...values, house_id: ctx.houseId, created_by: ctx.userId })

  if (error) {
    await logError('keuangan-rumah: rekening', error.message, { userId: ctx.userId })
    return { error: friendly(error.message), success: false }
  }

  refresh()
  return { error: '', success: true, message: id ? 'Rekening diperbarui.' : 'Rekening ditambahkan.' }
}

export async function setAccountArchived(id: string, archived: boolean) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase
    .from('household_accounts')
    .update({ is_archived: archived, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('house_id', ctx.houseId)
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

export async function deleteAccount(id: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase.from('household_accounts').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: friendly(error.message) }
  refresh()
  return { error: null }
}

// ---------------------------------------------------------------------
// POS TUJUAN (pendidikan, tabungan, dana darurat, ...)
// ---------------------------------------------------------------------
export async function saveGoal(prevState: HhFormState, formData: FormData): Promise<HhFormState> {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const category = String(formData.get('category') ?? 'tabungan')
  const target = parseAmount(formData.get('target_amount'))
  const monthly = parseAmount(formData.get('monthly_plan'))
  const targetDate = String(formData.get('target_date') ?? '')
  const accountId = String(formData.get('account_id') ?? '')
  const note = String(formData.get('note') ?? '').trim()

  if (!name || name.length > 40) return { error: 'Nama pos 1-40 karakter.', success: false }
  if (!GOAL_CATEGORIES.includes(category)) return { error: 'Kategori tidak valid.', success: false }
  if (target <= 0 || target > MAX_AMOUNT) return { error: 'Target dana harus lebih dari 0.', success: false }
  if (targetDate && !isDate(targetDate)) return { error: 'Tanggal target tidak valid.', success: false }
  if (note.length > 200) return { error: 'Catatan maksimal 200 karakter.', success: false }

  const values = {
    name,
    category,
    target_amount: target,
    monthly_plan: monthly > 0 ? monthly : null,
    target_date: targetDate || null,
    account_id: accountId || null,
    note: note || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = id
    ? await ctx.supabase.from('household_goals').update(values).eq('id', id).eq('house_id', ctx.houseId)
    : await ctx.supabase.from('household_goals').insert({ ...values, house_id: ctx.houseId, created_by: ctx.userId })

  if (error) {
    await logError('keuangan-rumah: pos tujuan', error.message, { userId: ctx.userId })
    return { error: error.message, success: false }
  }

  refresh()
  return { error: '', success: true, message: id ? 'Pos tujuan diperbarui.' : 'Pos tujuan ditambahkan.' }
}

export async function setGoalDone(id: string, done: boolean) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase
    .from('household_goals')
    .update({ is_done: done, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('house_id', ctx.houseId)
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

export async function deleteGoal(id: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase.from('household_goals').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

// Setor (+) atau tarik (-) dana dari pos tujuan
export async function addGoalEntry(goalId: string, amount: number, withdraw: boolean, note: string, date: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!(amount > 0) || amount > MAX_AMOUNT) return { error: 'Nominal harus lebih dari 0.' }
  if (!isDate(date)) return { error: 'Tanggal tidak valid.' }
  if (note.trim().length > 120) return { error: 'Catatan maksimal 120 karakter.' }

  const { error } = await ctx.supabase.from('household_goal_entries').insert({
    goal_id: goalId,
    house_id: ctx.houseId,
    amount: withdraw ? -amount : amount,
    entry_date: date,
    note: note.trim() || null,
    created_by: ctx.userId,
  })
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

export async function deleteGoalEntry(id: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  const { error } = await ctx.supabase.from('household_goal_entries').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

// ---------------------------------------------------------------------
// HUTANG & PIUTANG
// ---------------------------------------------------------------------
export async function saveDebt(prevState: HhFormState, formData: FormData): Promise<HhFormState> {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const id = String(formData.get('id') ?? '')
  const direction = String(formData.get('direction') ?? 'hutang')
  const name = String(formData.get('name') ?? '').trim()
  const counterparty = String(formData.get('counterparty') ?? '').trim()
  const principal = parseAmount(formData.get('principal'))
  const installment = parseAmount(formData.get('installment_amount'))
  const tenor = Number(formData.get('tenor_months') || 0)
  const dueDay = Number(formData.get('due_day') || 0)
  const startDate = String(formData.get('start_date') ?? '')
  const remindDays = Number(formData.get('remind_days') ?? 3)
  const accountId = String(formData.get('account_id') ?? '')
  const note = String(formData.get('note') ?? '').trim()

  if (!['hutang', 'piutang'].includes(direction)) return { error: 'Jenis tidak valid.', success: false }
  if (!name || name.length > 60) return { error: 'Nama 1-60 karakter (mis. KPR BTN, Pinjaman ke Pak Budi).', success: false }
  if (counterparty.length > 60) return { error: 'Nama pihak maksimal 60 karakter.', success: false }
  if (principal <= 0 || principal > MAX_AMOUNT) return { error: 'Total pokok harus lebih dari 0.', success: false }
  if (tenor && (!Number.isInteger(tenor) || tenor < 1 || tenor > 600)) return { error: 'Tenor 1-600 bulan.', success: false }
  if (dueDay && (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31)) return { error: 'Tanggal jatuh tempo 1-31.', success: false }
  if (!isDate(startDate)) return { error: 'Tanggal mulai tidak valid.', success: false }
  if (!Number.isInteger(remindDays) || remindDays < 0 || remindDays > 14) return { error: 'Pengingat 0-14 hari sebelumnya.', success: false }
  if (note.length > 200) return { error: 'Catatan maksimal 200 karakter.', success: false }

  const values = {
    direction,
    name,
    counterparty: counterparty || null,
    principal,
    installment_amount: installment > 0 ? installment : null,
    tenor_months: tenor || null,
    due_day: dueDay || null,
    start_date: startDate,
    remind_days: remindDays,
    account_id: accountId || null,
    note: note || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = id
    ? await ctx.supabase.from('household_debts').update(values).eq('id', id).eq('house_id', ctx.houseId)
    : await ctx.supabase.from('household_debts').insert({ ...values, house_id: ctx.houseId, created_by: ctx.userId })

  if (error) {
    await logError('keuangan-rumah: hutang', error.message, { userId: ctx.userId })
    return { error: error.message, success: false }
  }

  // Perubahan pokok bisa mengubah status lunas/aktif
  if (id) {
    const { data: progress } = await ctx.supabase.from('household_debt_progress').select('paid').eq('debt_id', id).maybeSingle()
    const paid = Number(progress?.paid ?? 0)
    await ctx.supabase.from('household_debts').update({ status: paid >= principal ? 'lunas' : 'aktif' }).eq('id', id).eq('house_id', ctx.houseId)
  }

  refresh()
  return { error: '', success: true, message: id ? 'Data diperbarui.' : direction === 'hutang' ? 'Hutang dicatat.' : 'Piutang dicatat.' }
}

export async function deleteDebt(id: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  // Riwayat pembayaran tetap ada di transaksi (hanya tautannya yang dilepas)
  const { error } = await ctx.supabase.from('household_debts').delete().eq('id', id).eq('house_id', ctx.houseId)
  if (error) return { error: error.message }
  refresh()
  return { error: null }
}

// Bayar cicilan hutang (= pengeluaran) atau terima pembayaran piutang (= pemasukan). Otomatis tercatat di transaksi.
export async function payDebt(debtId: string, amount: number, date: string, accountId: string, note: string) {
  const ctx = await manager()
  if (!ctx) return { error: 'Tidak punya akses.' }
  if (!(amount > 0) || amount > MAX_AMOUNT) return { error: 'Nominal harus lebih dari 0.' }
  if (!isDate(date)) return { error: 'Tanggal tidak valid.' }
  if (note.trim().length > 200) return { error: 'Catatan maksimal 200 karakter.' }

  const { data: debt } = await ctx.supabase
    .from('household_debts')
    .select('id, direction, name')
    .eq('id', debtId)
    .eq('house_id', ctx.houseId)
    .maybeSingle()
  if (!debt) return { error: 'Data hutang/piutang tidak ditemukan.' }

  const isHutang = debt.direction === 'hutang'
  const { error } = await ctx.supabase.from('household_transactions').insert({
    house_id: ctx.houseId,
    type: isHutang ? 'pengeluaran' : 'pemasukan',
    category: isHutang ? 'Cicilan / Hutang' : 'Piutang Diterima',
    amount,
    description: (note.trim() ? `${debt.name} - ${note.trim()}` : debt.name).slice(0, 200),
    transaction_date: date,
    account_id: accountId || null,
    debt_id: debt.id,
    created_by: ctx.userId,
  })

  if (error) {
    await logError('keuangan-rumah: bayar hutang', error.message, { userId: ctx.userId })
    return { error: friendly(error.message) }
  }

  refresh()
  return { error: null }
}