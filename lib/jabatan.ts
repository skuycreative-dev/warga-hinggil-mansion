// Pusat logika "angkat/cabut jabatan" (Paket T, 30 Sep 2026).
//
// Perubahan arsitektur: Admin Paguyuban, Sekretaris, Bendahara, dan Security TIDAK LAGI dibuat
// sebagai akun baru terpisah. Semuanya harus lebih dulu jadi warga terdaftar & aktif, baru
// diangkat jadi jabatan tertentu oleh yang berwenang (Superadmin untuk Admin Paguyuban; Admin
// Paguyuban untuk Sekretaris/Bendahara/Security). Riwayat pengangkatan/pencabutan tersimpan
// permanen di tabel public.jabatan_warga, dan kolom profiles.role/staff_position hanya
// mencerminkan jabatan yang SEDANG aktif -- begitu dicabut, akun otomatis kembali jadi warga
// biasa TANPA kehilangan data/riwayat apa pun sebagai warga (forum, IPL, keluarga, dst tetap
// menempel di baris profil yang sama).
//
// Manajemen Perumahan dan IT Support TIDAK memakai mekanisme ini -- keduanya tetap akun
// terpisah yang dibuat langsung oleh Superadmin (lihat app/superadmin/actions.ts dan
// app/paguyuban/kelola-staff/actions.ts), karena biasanya bukan warga penghuni.

import { publicError } from '@/lib/safe-error'
import { logAdminAction } from '@/lib/audit'
import { createAdminClient } from '@/lib/supabase/admin'

export type Jabatan = 'admin_paguyuban' | 'sekretaris' | 'bendahara' | 'security'

export const JABATAN_LABEL: Record<Jabatan, string> = {
  admin_paguyuban: 'Admin Paguyuban',
  sekretaris: 'Sekretaris Paguyuban',
  bendahara: 'Bendahara Paguyuban',
  security: 'Security',
}

const JABATAN_TO_PROFILE: Record<Jabatan, { role: string; staff_position: string | null }> = {
  admin_paguyuban: { role: 'paguyuban', staff_position: null },
  sekretaris: { role: 'staff_paguyuban', staff_position: 'sekretaris' },
  bendahara: { role: 'staff_paguyuban', staff_position: 'bendahara' },
  security: { role: 'security', staff_position: null },
}

export type WargaOption = {
  id: string
  full_name: string
  nickname: string | null
  house: { nomor_rumah: string } | null
}

export type JabatanHolder = {
  id: string
  user_id: string
  jabatan: Jabatan
  assigned_at: string
  full_name: string
  nickname: string | null
  house: { nomor_rumah: string } | null
}

// Daftar warga yang berstatus aktif & belum punya jabatan apa pun -- ini yang bisa dipilih dari panel.
export async function listActiveWargaForPicker(): Promise<WargaOption[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, nickname, house:houses(nomor_rumah)')
    .eq('role', 'warga')
    .eq('account_status', 'aktif')
    .order('full_name', { ascending: true })
    .limit(1000)

  return (data ?? []).map((r: any) => ({ ...r, house: Array.isArray(r.house) ? r.house[0] : r.house }))
}

// Siapa saja yang SEDANG memegang jabatan tertentu (satu atau beberapa jenis sekaligus).
export async function listJabatanHolders(jabatan: Jabatan | Jabatan[]): Promise<JabatanHolder[]> {
  const admin = createAdminClient()
  const list = Array.isArray(jabatan) ? jabatan : [jabatan]

  const { data: rows } = await admin
    .from('jabatan_warga')
    .select('id, user_id, jabatan, assigned_at')
    .in('jabatan', list)
    .is('revoked_at', null)
    .order('assigned_at', { ascending: false })

  if (!rows || rows.length === 0) return []

  const ids = rows.map((r) => r.user_id)
  const { data: profiles } = await admin.from('profiles').select('id, full_name, nickname, house:houses(nomor_rumah)').in('id', ids)
  const byId = new Map((profiles ?? []).map((p: any) => [p.id, { ...p, house: Array.isArray(p.house) ? p.house[0] : p.house }]))

  return rows.map((r) => {
    const p = byId.get(r.user_id)
    return {
      id: r.id,
      user_id: r.user_id,
      jabatan: r.jabatan as Jabatan,
      assigned_at: r.assigned_at,
      full_name: p?.full_name ?? '(akun terhapus)',
      nickname: p?.nickname ?? null,
      house: p?.house ?? null,
    }
  })
}

// Mengangkat seorang warga aktif jadi jabatan tertentu. Pemanggil (server action) wajib sudah
// memvalidasi hak akses (mis. hanya Superadmin yang boleh panggil untuk 'admin_paguyuban').
export async function assignJabatan(opts: { targetId: string; jabatan: Jabatan; assignedBy: string }): Promise<{ error: string | null }> {
  const admin = createAdminClient()
  const { targetId, jabatan, assignedBy } = opts

  const { data: target } = await admin.from('profiles').select('role, account_status, full_name').eq('id', targetId).maybeSingle()
  if (!target) return { error: 'Warga tidak ditemukan.' }
  if (target.role !== 'warga') {
    return { error: 'Akun ini sudah punya jabatan atau bukan warga biasa. Cabut jabatan lamanya dulu sebelum mengangkat jabatan baru.' }
  }
  if (target.account_status !== 'aktif') {
    return { error: 'Warga harus berstatus aktif/terverifikasi dulu sebelum bisa diangkat jadi pengurus.' }
  }

  // Jaga-jaga: tutup jabatan aktif lama kalau (seharusnya tidak mungkin) masih ada yang tertinggal.
  await admin.from('jabatan_warga').update({ revoked_at: new Date().toISOString(), revoked_by: assignedBy }).eq('user_id', targetId).is('revoked_at', null)

  const { error: insertErr } = await admin.from('jabatan_warga').insert({ user_id: targetId, jabatan, assigned_by: assignedBy })
  if (insertErr) return { error: publicError(insertErr) }

  const mapped = JABATAN_TO_PROFILE[jabatan]
  const { error: updateErr } = await admin
    .from('profiles')
    .update({ role: mapped.role, staff_position: mapped.staff_position })
    .eq('id', targetId)
  if (updateErr) return { error: publicError(updateErr) }

  await logAdminAction(assignedBy, 'tambah', 'jabatan', targetId, `Mengangkat "${target.full_name}" jadi ${JABATAN_LABEL[jabatan]}`, { jabatan })
  return { error: null }
}

// Mencabut jabatan seorang pengurus -- akun otomatis kembali jadi warga biasa, riwayat & data
// sebagai warga (forum, IPL, keluarga, dst) tidak dihapus sama sekali.
export async function revokeJabatan(opts: { targetId: string; revokedBy: string }): Promise<{ error: string | null }> {
  const admin = createAdminClient()
  const { targetId, revokedBy } = opts

  const { data: target } = await admin.from('profiles').select('role, staff_position, full_name').eq('id', targetId).maybeSingle()
  if (!target) return { error: 'Akun tidak ditemukan.' }

  const { error: closeErr } = await admin
    .from('jabatan_warga')
    .update({ revoked_at: new Date().toISOString(), revoked_by: revokedBy })
    .eq('user_id', targetId)
    .is('revoked_at', null)
  if (closeErr) return { error: publicError(closeErr) }

  const { error: updateErr } = await admin.from('profiles').update({ role: 'warga', staff_position: null }).eq('id', targetId)
  if (updateErr) return { error: publicError(updateErr) }

  await logAdminAction(revokedBy, 'ubah', 'jabatan', targetId, `Mencabut jabatan "${target.full_name}", kembali jadi warga biasa`, {
    role_sebelumnya: target.role,
    staff_position_sebelumnya: target.staff_position,
  })
  return { error: null }
}