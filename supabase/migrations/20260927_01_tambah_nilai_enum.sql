-- STEP 246 — SQL A: tambah nilai baru ke tipe data (enum). WAJIB dijalankan SENDIRIAN dulu, baru Step 247.
-- Kenapa dipisah: Postgres tidak mengizinkan nilai enum baru dipakai di query yang sama saat ditambahkan.
-- Jalankan di Supabase SQL Editor -> Run. Aman dijalankan ulang (pakai "if not exists").

-- Role utama baru: Staff Paguyuban (jabatan Bendahara / Sekretaris), hanya dibuat oleh Superadmin & Admin Paguyuban
alter type public.user_role add value if not exists 'staff_paguyuban';

-- Status akun untuk alur verifikasi warga baru
alter type public.account_status add value if not exists 'menunggu_verifikasi';
alter type public.account_status add value if not exists 'ditolak';

-- Status tamu: kode dipakai aplikasi saat warga membatalkan undangan (sebelumnya tidak ada di database -> batal selalu gagal)
alter type public.guest_status add value if not exists 'dibatalkan';

-- Kategori darurat: melengkapi kebakaran, maling, perampokan, kekerasan, bencana, lainnya
alter type public.emergency_type add value if not exists 'medis';

-- Jabatan Staff Paguyuban
do $$
begin
  create type public.staff_position as enum ('bendahara', 'sekretaris');
exception
  when duplicate_object then null;
end $$;
