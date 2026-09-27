-- STEP 247 — SQL B: pengaman data profil + perbaikan skema yang membuat fitur gagal diam-diam
-- Jalankan di Supabase SQL Editor SETELAH Step 246 berhasil. Aman dijalankan ulang.
-- Tidak menghapus data apa pun.

-- =====================================================================
-- 1. KOLOM BARU DI PROFILES
-- =====================================================================
alter table public.profiles add column if not exists staff_position public.staff_position;
alter table public.profiles add column if not exists verified_at timestamptz;
alter table public.profiles add column if not exists verified_by uuid references public.profiles(id) on delete set null;

-- Keputusan Tuan Muda: warga yang sudah terdaftar sebelum fitur verifikasi = langsung terverifikasi
update public.profiles
set verified_at = coalesce(verified_at, created_at, now())
where account_status::text = 'aktif';

-- =====================================================================
-- 2. PENGAMAN KOLOM PROFILES (celah keamanan kritis)
-- Sebelumnya policy "profiles_update_own" mengizinkan warga mengubah SEMUA kolom miliknya,
-- termasuk role -> warga bisa menjadikan dirinya superadmin lewat browser.
-- Trigger ini membatasi request langsung dari aplikasi. Perubahan oleh admin tetap bisa,
-- lewat server action yang memakai Service Role Key (setelah dicek hak aksesnya di kode).
-- =====================================================================
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
as $$
declare
  in_completion boolean;
begin
  -- Service Role Key (server admin) dan fungsi sistem (misal trigger poin forum) tidak dibatasi
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Role akun hanya bisa diubah oleh admin.';
  end if;

  if new.account_status is distinct from old.account_status then
    raise exception 'Status akun hanya bisa diubah oleh admin.';
  end if;

  if new.staff_position is distinct from old.staff_position then
    raise exception 'Jabatan staff hanya bisa diubah oleh Superadmin atau Admin Paguyuban.';
  end if;

  if new.forum_points is distinct from old.forum_points then
    raise exception 'Poin forum tidak bisa diubah manual.';
  end if;

  if new.verified_at is distinct from old.verified_at
     or new.verified_by is distinct from old.verified_by
     or new.deactivated_at is distinct from old.deactivated_at
     or new.deactivated_by is distinct from old.deactivated_by
     or new.deactivated_reason is distinct from old.deactivated_reason then
    raise exception 'Data verifikasi akun hanya bisa diubah oleh admin.';
  end if;

  -- Masa pengisian data awal (saat daftar / lengkapi profil / masih menunggu verifikasi):
  -- warga masih boleh mengisi NIK, nomor rumah, status hunian, dan peran keluarga.
  in_completion := old.nik is null or old.account_status::text = 'menunggu_verifikasi';

  if not in_completion then
    if new.nik is distinct from old.nik then
      raise exception 'Perubahan NIK harus melalui persetujuan admin.';
    end if;

    if new.house_id is distinct from old.house_id then
      raise exception 'Perubahan nomor rumah harus melalui persetujuan admin.';
    end if;

    if new.is_house_owner is distinct from old.is_house_owner then
      raise exception 'Status pemilik rumah hanya bisa diubah oleh admin.';
    end if;

    if new.occupancy_status is distinct from old.occupancy_status then
      raise exception 'Perubahan status hunian harus disetujui Admin atau Sekretaris Paguyuban.';
    end if;

    if new.family_role is distinct from old.family_role
       and (old.family_role::text = 'kepala_keluarga' or new.family_role::text = 'kepala_keluarga') then
      raise exception 'Status Kepala Keluarga hanya bisa diubah dengan persetujuan admin.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Admin tidak lagi mengubah profil orang lain langsung dari browser; semua lewat server action
drop policy if exists profiles_update_admin on public.profiles;

-- Helper jabatan staff (dipakai policy keuangan)
create or replace function public.my_staff_position()
returns public.staff_position
language sql
stable
security definer
set search_path = public
as $$
  select staff_position from public.profiles where id = auth.uid();
$$;

-- =====================================================================
-- 3. TOMBOL DARURAT — sebelumnya SELALU GAGAL
--    (reporter_id & emergency_type wajib diisi tapi tidak dikirim aplikasi,
--     dan trigger notifikasi memakai kolom "reported_by" yang tidak ada)
-- =====================================================================
alter table public.emergency_alerts alter column reporter_id set default auth.uid();
alter table public.emergency_alerts alter column emergency_type set default 'lainnya';

create or replace function public.notify_on_emergency()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pelapor text;
  rumah text;
begin
  select full_name into pelapor from public.profiles where id = new.reporter_id;
  select nomor_rumah into rumah from public.houses where id = new.house_id;

  insert into public.notifications (user_id, type, title, body, link)
  select p.id,
         'darurat',
         'DARURAT: ' || upper(new.emergency_type::text),
         coalesce(pelapor, 'Warga') || coalesce(' (Rumah ' || rumah || ')', '') || coalesce(' - ' || new.message, ''),
         '/darurat'
  from public.profiles p
  where p.id is distinct from new.reporter_id;

  return new;
end;
$$;

-- =====================================================================
-- 4. PENGADUAN — reporter_id wajib diisi tapi tidak dikirim aplikasi
-- =====================================================================
alter table public.complaints alter column reporter_id set default auth.uid();

-- =====================================================================
-- 5. NAMA KOLOM YANG BEDA ANTARA DATABASE DAN APLIKASI
--    polls.question -> title (+ description), tukang_catalog.service_type -> specialty
--    (sebelumnya membuat Polling & Katalog Tukang selalu kosong / gagal simpan)
-- =====================================================================
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'polls' and column_name = 'question')
     and not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'polls' and column_name = 'title') then
    alter table public.polls rename column question to title;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tukang_catalog' and column_name = 'service_type')
     and not exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'tukang_catalog' and column_name = 'specialty') then
    alter table public.tukang_catalog rename column service_type to specialty;
  end if;
end $$;

alter table public.polls add column if not exists description text;

-- =====================================================================
-- 6. POLICY: menyamakan hak akses dengan kebutuhan awal
-- =====================================================================

-- Moderasi forum: sebelumnya "Aktifkan Kembali" diam-diam gagal (tidak ada policy update/delete)
drop policy if exists forum_posts_update_moderator on public.forum_posts;
create policy forum_posts_update_moderator on public.forum_posts
  for update using (my_role() = any (array['paguyuban', 'manajemen', 'superadmin']::user_role[]));

drop policy if exists forum_reports_delete_moderator on public.forum_reports;
create policy forum_reports_delete_moderator on public.forum_reports
  for delete using (my_role() = any (array['paguyuban', 'manajemen', 'superadmin']::user_role[]));

-- Keuangan: input hanya Ketua (Admin Paguyuban), Bendahara, dan Superadmin (Manajemen dicabut)
drop policy if exists iuran_tx_insert_admin on public.iuran_transactions;
drop policy if exists iuran_write_admin on public.iuran_transactions;
drop policy if exists iuran_update_admin on public.iuran_transactions;
drop policy if exists iuran_delete_admin on public.iuran_transactions;

create policy iuran_write_admin on public.iuran_transactions
  for insert with check (
    my_role() = any (array['paguyuban', 'superadmin']::user_role[])
    or (my_role() = 'staff_paguyuban'::user_role and my_staff_position() = 'bendahara'::staff_position)
  );
create policy iuran_update_admin on public.iuran_transactions
  for update using (
    my_role() = any (array['paguyuban', 'superadmin']::user_role[])
    or (my_role() = 'staff_paguyuban'::user_role and my_staff_position() = 'bendahara'::staff_position)
  );
create policy iuran_delete_admin on public.iuran_transactions
  for delete using (
    my_role() = any (array['paguyuban', 'superadmin']::user_role[])
    or (my_role() = 'staff_paguyuban'::user_role and my_staff_position() = 'bendahara'::staff_position)
  );

drop policy if exists iuran_status_write_admin on public.iuran_payment_status;
create policy iuran_status_write_admin on public.iuran_payment_status
  for all
  using (
    my_role() = any (array['paguyuban', 'superadmin']::user_role[])
    or (my_role() = 'staff_paguyuban'::user_role and my_staff_position() = 'bendahara'::staff_position)
  )
  with check (
    my_role() = any (array['paguyuban', 'superadmin']::user_role[])
    or (my_role() = 'staff_paguyuban'::user_role and my_staff_position() = 'bendahara'::staff_position)
  );

-- Pengumuman: hanya Manajemen, Paguyuban, Superadmin (Security dicabut sesuai kebutuhan #4)
drop policy if exists announcements_write_admin on public.announcements;
drop policy if exists announcements_update_admin on public.announcements;
create policy announcements_update_admin on public.announcements
  for update using (my_role() = any (array['manajemen', 'paguyuban', 'superadmin']::user_role[]));

-- Pengaduan: update status hanya Manajemen, Paguyuban, Superadmin
drop policy if exists complaints_update_admin on public.complaints;
create policy complaints_update_admin on public.complaints
  for update using (my_role() = any (array['manajemen', 'paguyuban', 'superadmin']::user_role[]));

-- Katalog tukang: Manajemen DAN Paguyuban (kebutuhan #11)
drop policy if exists tukang_update_admin on public.tukang_catalog;
create policy tukang_update_admin on public.tukang_catalog
  for update using (my_role() = any (array['manajemen', 'paguyuban', 'superadmin']::user_role[]));

-- Error log: sebelumnya siapa pun (bahkan tanpa login) bisa menulis
drop policy if exists error_logs_insert_system on public.error_logs;
create policy error_logs_insert_system on public.error_logs
  for insert with check (auth.uid() is not null);

notify pgrst, 'reload schema';

select 'STEP 247 selesai' as hasil;
