# PROJECT ANALYSIS — Warga Hinggil Mansion
Dibuat otomatis: 2026-09-27 20:29:34

## 1. Git Log (30 commit terakhir)
```
62e57b8 Fix: hapus file Pengumuman lama yang bentrok (penyebab build gagal) + tambah try/catch di pembuatan akun admin (Superadmin & Kelola Staff) supaya tidak crash 'server error' kalau koneksi Supabase gagal
786c894 Fitur: Pengumuman (blast oleh manajemen/paguyuban/superadmin, dibaca semua warga) ΓÇö melengkapi link yang sebelumnya belum ada halamannya
9ce5683 UI: restyle Kelola Katalog Tukang & Moderasi Forum ke tampilan CMS sidebar gelap (konsisten dengan dashboard admin lainnya)
808472c UI: Dashboard Paguyuban (kas warga, polling aktif) & Dashboard IT Support (error logs) ΓÇö melengkapi semua dashboard CMS per role
c1369b4 UI: Dashboard Security (CMS sidebar gelap) + tile & link navigasi terhubung ke semua fitur security
4a8306a Fitur: QR Tamu (undang tamu + kode + verifikasi Security) dan Tombol Darurat (alert real ke Security/Pengurus) ΓÇö sebelumnya tile ada tapi halaman belum pernah dibangun
4cb986d Fitur: Pengaduan (warga submit + admin kelola status) & Dashboard Manajemen Perumahan (CMS sidebar gelap)
4538e9d UI: rombak Kelola Admin (Superadmin) & Kelola Staff (Paguyuban) jadi CMS sidebar gelap sesuai wireframe
d7c0fd8 Fitur: CRUD Pengumuman (pin+edit+hapus), Kelola Admin (Superadmin), Kelola Staff (Paguyuban), fix redirect house_id, navbar admin links
0dc4841 redesign: navbar ramping dengan 4 ikon utama (Darurat merah, Pengumuman, QR Tamu, Profil) + lonceng notifikasi, menu lengkap dipindah ke sidebar hamburger
991f52e fix: tambahkan middleware.ts untuk refresh sesi login otomatis, memperbaiki user yang tiba-tiba ter-logout
725fab4 feat: navbar dengan logo & menu cepat di semua halaman, perbaikan tombol kembali di profil dan profil warga
5d404c0 fix: commit semua file yang sebelumnya tertinggal (QR Tamu, Verifikasi Tamu, Warga, Chat, Profil, Dashboard, Loading)
a0fc030 fix: tambahkan komponen FriendActionButton dan ChatThread yang sebelumnya belum ter-commit
df084ff fix: perbaiki file rute dinamis warga/chat yang gagal ditulis PowerShell, sembunyikan nomor HP dari profil warga lain
40566fb feat: tambah fitur Anggaran & Iuran, Polling Warga, Katalog Tukang, dan Status Rumah Kosong
2f4101b fix: kolom occupancy_status/nik di profiles, tambah field NIK, perbaiki tombol upload foto profil, tombol keluar rounded+hover, loading transisi halaman, panah dropdown
86b581f feat: redesain Profil (modern & bisa diedit), Forum Warga jadi feed sosial dengan like/komentar/laporkan + moderasi otomatis, Pengumuman modern, dan sistem notifikasi lonceng
c445d1d fix: hapus tombol login/daftar dengan Google (integrasi belum diperlukan), ganti ikon Tombol Darurat di dashboard jadi merah agar lebih mudah ditemukan saat kondisi darurat
e11298f feat: nama lengkap di dashboard, panel darurat tema merah dengan kontak darurat, status hunian saat daftar, login/daftar dengan Google + halaman lengkapi profil
0f254b4 feat: ganti halaman dashboard testing dengan dashboard warga sungguhan (sapaan, menu cepat, pengumuman terbaru, tombol keluar)
c448fae feat: tambah field NIK unik saat pendaftaran untuk mencegah data warga ganda
e4644ca feat: tambah halaman Forum Warga (kirim dan lihat postingan antar warga)
7e6f518 fix: dropdown peran keluarga sekarang terbaca, modal sukses + auto-redirect setelah daftar; feat: lupa password dan reset password via email
b83fcd8 fix: dropdown peran keluarga sekarang terbaca, modal sukses + auto-redirect setelah daftar; feat: lupa password dan reset password via email
874ff62 fix: tambah tombol kembali ke beranda di FAQ & Syarat Ketentuan, lengkapi fasilitas landing page (Bale Warga, Playground), hapus keterangan akses utama; feat: tambah halaman Tombol Darurat
2f9ff61 feat: tambah halaman FAQ dan Syarat & Ketentuan (konten dari database, bisa diupdate), header navigasi, lengkapi landing page dengan section fasilitas & lokasi, dan halaman Pengumuman warga
f25c03b feat: redesign landing page - responsive desktop, teks bold besar untuk keterbacaan, section fitur latar terang dengan collapse detail
d5c9c5f feat: terapkan tema gelap-emas (dark-gold) pada layout global, footer, landing page, login, dan register
289834a Tahap 2 lanjutan: branding logo, upload foto profil, storage avatar

```

## 2. Git Status
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean

```

## 3. File yang benar-benar sudah ter-push ke Git (git ls-files, semua)
```
.gitignore
AGENTS.md
CLAUDE.md
README.md
app/anggaran/actions.ts
app/anggaran/page.tsx
app/auth/callback/route.ts
app/chat/[friendId]/page.tsx
app/chat/actions.ts
app/chat/page.tsx
app/darurat/actions.ts
app/darurat/page.tsx
app/dashboard/actions.ts
app/dashboard/page.tsx
app/faq/page.tsx
app/favicon.ico
app/forum/actions.ts
app/forum/page.tsx
app/globals.css
app/it-support/actions.ts
app/it-support/page.tsx
app/keamanan/scan-tamu/actions.ts
app/keamanan/scan-tamu/page.tsx
app/layout.tsx
app/lengkapi-profil/actions.ts
app/lengkapi-profil/page.tsx
app/loading.tsx
app/login/actions.ts
app/login/page.tsx
app/lupa-password/page.tsx
app/manajemen/page.tsx
app/page.tsx
app/paguyuban/kelola-staff/actions.ts
app/paguyuban/kelola-staff/page.tsx
app/paguyuban/moderasi-forum/actions.ts
app/paguyuban/moderasi-forum/page.tsx
app/paguyuban/page.tsx
app/pengaduan/actions.ts
app/pengaduan/page.tsx
app/pengumuman/actions.ts
app/pengumuman/page.tsx
app/polling/actions.ts
app/polling/page.tsx
app/profile/actions.ts
app/profile/page.tsx
app/qr-tamu/actions.ts
app/qr-tamu/page.tsx
app/register/actions.ts
app/register/page.tsx
app/reset-password/page.tsx
app/rumah-kosong/actions.ts
app/rumah-kosong/page.tsx
app/security/page.tsx
app/superadmin/actions.ts
app/superadmin/page.tsx
app/syarat-ketentuan/page.tsx
app/test-koneksi/page.tsx
app/tukang/actions.ts
app/tukang/kelola/page.tsx
app/tukang/page.tsx
app/warga/[id]/page.tsx
app/warga/actions.ts
app/warga/page.tsx
components.json
components/AdminAccountForm.tsx
components/AdminAccountList.tsx
components/AnggaranForm.tsx
components/AnggaranList.tsx
components/AnnouncementForm.tsx
components/AnnouncementList.tsx
components/AppFooter.tsx
components/AppHeader.tsx
components/AppNavbar.tsx
components/AvatarUploader.tsx
components/ChatThread.tsx
components/ComplaintForm.tsx
components/ComplaintItem.tsx
components/EmergencyPanel.tsx
components/FaqAccordion.tsx
components/ForumFeed.tsx
components/ForumPostForm.tsx
components/FriendActionButton.tsx
components/GuestInviteForm.tsx
components/GuestVisitItem.tsx
components/ModerasiForumList.tsx
components/NotificationBell.tsx
components/PollCard.tsx
components/PollCreateForm.tsx
components/ProfileEditForm.tsx
components/ProfileInfoCard.tsx
components/RumahKosongList.tsx
components/ScanTamuForm.tsx
components/TukangForm.tsx
components/TukangKelolaList.tsx
components/admin/AdminAccountPanel.tsx
components/admin/AdminAccountTable.tsx
components/admin/AdminLayout.tsx
components/admin/ComplaintAdminTable.tsx
components/admin/ErrorLogTable.tsx
components/admin/GuestLogTable.tsx
components/admin/ModerasiForumTable.tsx
components/admin/StatCard.tsx
components/admin/TukangKelolaTable.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/input.tsx
components/ui/label.tsx
components/ui/select.tsx
eslint.config.mjs
lib/lib/supabase/client.ts
lib/supabase/admin.ts
lib/supabase/client.ts
lib/supabase/middleware.ts
lib/supabase/server.ts
lib/utils.ts
middleware.ts
next.config.ts
package-lock.json
package.json
postcss.config.mjs
public/file.svg
public/globe.svg
public/logo-hinggil-mansion.jpg
public/logo-skuy-creative.png
public/next.svg
public/vercel.svg
public/window.svg
scripts/verify-and-push.ps1
tsconfig.json

```

## 4. Struktur Folder Lengkap
```
- .env.local 
- .git [DIR]
- .gitignore 
- .next [DIR]
- AGENTS.md 
- app [DIR]
  - app\anggaran [DIR]
    - app\anggaran\actions.ts 
    - app\anggaran\page.tsx 
  - app\auth [DIR]
    - app\auth\callback [DIR]
      - app\auth\callback\route.ts 
  - app\chat [DIR]
    - app\chat\[friendId] [DIR]
      - app\chat\[friendId]\page.tsx 
    - app\chat\actions.ts 
    - app\chat\page.tsx 
  - app\darurat [DIR]
    - app\darurat\actions.ts 
    - app\darurat\page.tsx 
  - app\dashboard [DIR]
    - app\dashboard\actions.ts 
    - app\dashboard\page.tsx 
  - app\faq [DIR]
    - app\faq\page.tsx 
  - app\favicon.ico 
  - app\forum [DIR]
    - app\forum\actions.ts 
    - app\forum\page.tsx 
  - app\globals.css 
  - app\it-support [DIR]
    - app\it-support\actions.ts 
    - app\it-support\page.tsx 
  - app\keamanan [DIR]
    - app\keamanan\scan-tamu [DIR]
      - app\keamanan\scan-tamu\actions.ts 
      - app\keamanan\scan-tamu\page.tsx 
  - app\layout.tsx 
  - app\lengkapi-profil [DIR]
    - app\lengkapi-profil\actions.ts 
    - app\lengkapi-profil\page.tsx 
  - app\loading.tsx 
  - app\login [DIR]
    - app\login\actions.ts 
    - app\login\page.tsx 
  - app\lupa-password [DIR]
    - app\lupa-password\page.tsx 
  - app\manajemen [DIR]
    - app\manajemen\page.tsx 
  - app\page.tsx 
  - app\paguyuban [DIR]
    - app\paguyuban\kelola-staff [DIR]
      - app\paguyuban\kelola-staff\actions.ts 
      - app\paguyuban\kelola-staff\page.tsx 
    - app\paguyuban\moderasi-forum [DIR]
      - app\paguyuban\moderasi-forum\actions.ts 
      - app\paguyuban\moderasi-forum\page.tsx 
    - app\paguyuban\page.tsx 
  - app\pengaduan [DIR]
    - app\pengaduan\actions.ts 
    - app\pengaduan\page.tsx 
  - app\pengumuman [DIR]
    - app\pengumuman\actions.ts 
    - app\pengumuman\page.tsx 
  - app\polling [DIR]
    - app\polling\actions.ts 
    - app\polling\page.tsx 
  - app\profile [DIR]
    - app\profile\actions.ts 
    - app\profile\page.tsx 
  - app\qr-tamu [DIR]
    - app\qr-tamu\actions.ts 
    - app\qr-tamu\page.tsx 
  - app\register [DIR]
    - app\register\actions.ts 
    - app\register\page.tsx 
  - app\reset-password [DIR]
    - app\reset-password\page.tsx 
  - app\rumah-kosong [DIR]
    - app\rumah-kosong\actions.ts 
    - app\rumah-kosong\page.tsx 
  - app\security [DIR]
    - app\security\page.tsx 
  - app\superadmin [DIR]
    - app\superadmin\actions.ts 
    - app\superadmin\page.tsx 
  - app\syarat-ketentuan [DIR]
    - app\syarat-ketentuan\page.tsx 
  - app\test-koneksi [DIR]
    - app\test-koneksi\page.tsx 
  - app\tukang [DIR]
    - app\tukang\actions.ts 
    - app\tukang\kelola [DIR]
      - app\tukang\kelola\page.tsx 
    - app\tukang\page.tsx 
  - app\warga [DIR]
    - app\warga\[id] [DIR]
      - app\warga\[id]\page.tsx 
    - app\warga\actions.ts 
    - app\warga\page.tsx 
- CLAUDE.md 
- components [DIR]
- components.json 
  - components\admin [DIR]
    - components\admin\AdminAccountPanel.tsx 
    - components\admin\AdminAccountTable.tsx 
    - components\admin\AdminLayout.tsx 
    - components\admin\ComplaintAdminTable.tsx 
    - components\admin\ErrorLogTable.tsx 
    - components\admin\GuestLogTable.tsx 
    - components\admin\ModerasiForumTable.tsx 
    - components\admin\StatCard.tsx 
    - components\admin\TukangKelolaTable.tsx 
  - components\AdminAccountForm.tsx 
  - components\AdminAccountList.tsx 
  - components\AnggaranForm.tsx 
  - components\AnggaranList.tsx 
  - components\AnnouncementForm.tsx 
  - components\AnnouncementList.tsx 
  - components\AppFooter.tsx 
  - components\AppHeader.tsx 
  - components\AppNavbar.tsx 
  - components\AvatarUploader.tsx 
  - components\ChatThread.tsx 
  - components\ComplaintForm.tsx 
  - components\ComplaintItem.tsx 
  - components\EmergencyPanel.tsx 
  - components\FaqAccordion.tsx 
  - components\ForumFeed.tsx 
  - components\ForumPostForm.tsx 
  - components\FriendActionButton.tsx 
  - components\GuestInviteForm.tsx 
  - components\GuestVisitItem.tsx 
  - components\ModerasiForumList.tsx 
  - components\NotificationBell.tsx 
  - components\PollCard.tsx 
  - components\PollCreateForm.tsx 
  - components\ProfileEditForm.tsx 
  - components\ProfileInfoCard.tsx 
  - components\RumahKosongList.tsx 
  - components\ScanTamuForm.tsx 
  - components\TukangForm.tsx 
  - components\TukangKelolaList.tsx 
  - components\ui [DIR]
    - components\ui\button.tsx 
    - components\ui\card.tsx 
    - components\ui\input.tsx 
    - components\ui\label.tsx 
    - components\ui\select.tsx 
- eslint.config.mjs 
- lib [DIR]
  - lib\lib [DIR]
    - lib\lib\supabase [DIR]
      - lib\lib\supabase\client.ts 
  - lib\supabase [DIR]
    - lib\supabase\admin.ts 
    - lib\supabase\client.ts 
    - lib\supabase\middleware.ts 
    - lib\supabase\server.ts 
  - lib\utils.ts 
- middleware.ts 
- next.config.ts 
- next-env.d.ts 
- node_modules [DIR]
- package.json 
- package-lock.json 
- postcss.config.mjs 
- public [DIR]
  - public\file.svg 
  - public\globe.svg 
  - public\logo-hinggil-mansion.jpg 
  - public\logo-skuy-creative.png 
  - public\next.svg 
  - public\vercel.svg 
  - public\window.svg 
- README.md 
- scripts [DIR]
  - scripts\verify-and-push.ps1 
- src [DIR]
  - src\app [DIR]
- tsconfig.json 
- tsconfig.tsbuildinfo 
```

## 5. Daftar Route (semua page.tsx di dalam app/)
```
app\page.tsx
app\anggaran\page.tsx
app\chat\page.tsx
app\chat\[friendId]\page.tsx
app\darurat\page.tsx
app\dashboard\page.tsx
app\faq\page.tsx
app\forum\page.tsx
app\it-support\page.tsx
app\keamanan\scan-tamu\page.tsx
app\lengkapi-profil\page.tsx
app\login\page.tsx
app\lupa-password\page.tsx
app\manajemen\page.tsx
app\paguyuban\page.tsx
app\paguyuban\kelola-staff\page.tsx
app\paguyuban\moderasi-forum\page.tsx
app\pengaduan\page.tsx
app\pengumuman\page.tsx
app\polling\page.tsx
app\profile\page.tsx
app\qr-tamu\page.tsx
app\register\page.tsx
app\reset-password\page.tsx
app\rumah-kosong\page.tsx
app\security\page.tsx
app\superadmin\page.tsx
app\syarat-ketentuan\page.tsx
app\test-koneksi\page.tsx
app\tukang\page.tsx
app\tukang\kelola\page.tsx
app\warga\page.tsx
app\warga\[id]\page.tsx
```

## 6. Nama Environment Variables (TANPA value/secret, demi keamanan)
### .env - TIDAK DITEMUKAN
### .env.local
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
### .env.production - TIDAK DITEMUKAN
### .env.development - TIDAK DITEMUKAN

## 7. File Konfigurasi Penting
### package.json
```
{
  "name": "warga-hinggil-mansion",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@base-ui/react": "^1.8.0",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.117.1",
    "class-variance-authority": "^0.7.1",
    "cn": "^0.4.0",
    "lucide-react": "^1.48.0",
    "next": "16.3.6",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "shadcn": "^4.21.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

### tsconfig.json
```
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

### next.config.ts
```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

### middleware.ts
```
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

```

## 8. Isi Semua File Kode (app/, components/, lib/)
### app\anggaran\actions.ts
```
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

```

### app\anggaran\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnggaranForm from '@/components/AnggaranForm'
import AnggaranList from '@/components/AnggaranList'

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default async function AnggaranPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canManage = !!profile && ['paguyuban', 'superadmin'].includes(profile.role)

  const { data: rows } = await supabase
    .from('iuran_transactions')
    .select('id, type, category, amount, description, transaction_date, author:profiles(full_name)')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })

  const transactions = (rows ?? []).map((t: any) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    transaction_date: t.transaction_date,
    author_name: t.author?.full_name ?? 'Admin',
  }))

  const totalIncome = transactions.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Transparansi Keuangan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Anggaran & Iuran
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div
          className="mb-6 rounded-3xl px-6 py-7 text-center"
          style={{ background: 'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), #0a0b0f' }}
        >
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c7c9d2' }}>Saldo Saat Ini</div>
          <div className="mt-2 text-3xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            {formatRupiah(balance)}
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#8fd3a6' }}>Pemasukan</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalIncome)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#e6a89c' }}>Pengeluaran</div>
              <div className="text-sm font-bold" style={{ color: '#ffffff' }}>{formatRupiah(totalExpense)}</div>
            </div>
          </div>
        </div>

        {canManage ? (
          <div className="mb-6">
            <AnggaranForm />
          </div>
        ) : null}

        <div className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Transaksi
        </div>
        <AnggaranList transactions={transactions} canManage={canManage} />
      </div>
    </main>
  )
}

```

### app\auth\callback\route.ts
```
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

```

### app\chat\[friendId]\page.tsx
```
(gagal dibaca: A parameter cannot be found that matches parameter name 'Raw'.)
```

### app\chat\actions.ts
```
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(receiverId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed) return { error: 'Pesan tidak boleh kosong.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('chat_messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: trimmed,
  })

  if (error) {
    return { error: 'Pesan gagal dikirim. Pastikan kalian sudah berteman.' }
  }

  return { error: null }
}

export async function markMessagesRead(senderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)
}

```

### app\chat\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ChatListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: friendships } = await supabase
    .from('friendships')
    .select('id, requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, full_name, avatar_url), addressee:profiles!friendships_addressee_id_fkey(id, full_name, avatar_url)')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  const friends = (friendships ?? []).map((f: any) => {
    const isRequester = f.requester_id === user.id
    const friend = isRequester ? f.addressee : f.requester
    return { id: friend.id, full_name: friend.full_name, avatar_url: friend.avatar_url }
  })

  let lastMessages: Record<string, { content: string; created_at: string; is_mine: boolean }> = {}

  if (friends.length > 0) {
    const friendIds = friends.map((f) => f.id)
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('sender_id, receiver_id, content, created_at')
      .or(
        friendIds
          .map((id) => `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`)
          .join(',')
      )
      .order('created_at', { ascending: false })

    for (const m of msgs ?? []) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
      if (!lastMessages[otherId]) {
        lastMessages[otherId] = { content: m.content, created_at: m.created_at, is_mine: m.sender_id === user.id }
      }
    }
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Obrolan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Pesan
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/warga" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Cari Warga</Link>
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <p className="text-sm font-medium" style={{ color: '#5b543f' }}>
              Kamu belum punya teman. Cari dan tambahkan teman dulu di halaman Warga.
            </p>
            <Link href="/warga" className="mt-3 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
              Cari Warga →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {friends.map((f) => {
              const last = lastMessages[f.id]
              return (
                <Link
                  key={f.id}
                  href={`/chat/${f.id}`}
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition hover:-translate-y-0.5"
                  style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                >
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{ background: '#e8e2d0' }}
                  >
                    {f.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.avatar_url} alt={f.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>{(f.full_name ?? '?').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{f.full_name}</div>
                    <div className="truncate text-[12px] font-medium" style={{ color: '#9c7a3f' }}>
                      {last ? `${last.is_mine ? 'Kamu: ' : ''}${last.content}` : 'Mulai obrolan'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

```

### app\darurat\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type EmergencyState = { error: string; success: boolean }

const RESOLVER_ROLES = ['security', 'paguyuban', 'manajemen', 'superadmin']

export async function triggerEmergency(prevState: EmergencyState, formData: FormData): Promise<EmergencyState> {
  const message = (formData.get('message') as string)?.trim()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('emergency_alerts').insert({
    created_by: user.id,
    house_id: profile?.house_id ?? null,
    message: message || null,
    status: 'aktif',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/darurat')
  return { error: '', success: true }
}

export async function resolveEmergency(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !RESOLVER_ROLES.includes(profile.role)) {
    return { error: 'Tidak punya akses.' }
  }

  const { error } = await supabase
    .from('emergency_alerts')
    .update({ status: 'selesai', resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/darurat')
  return { error: null }
}

```

### app\darurat\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmergencyPanel from '@/components/EmergencyPanel'

const RESOLVER_ROLES = ['security', 'paguyuban', 'manajemen', 'superadmin']

export default async function DaruratPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canResolve = !!profile && RESOLVER_ROLES.includes(profile.role)

  const { data: alertsRaw } = await supabase
    .from('emergency_alerts')
    .select('id, message, status, created_at, created_by, house:houses(nomor_rumah), creator:created_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(20)

  const alerts = (alertsRaw ?? []).map((a: any) => ({
    ...a,
    house: Array.isArray(a.house) ? a.house[0] : a.house,
    creator: Array.isArray(a.creator) ? a.creator[0] : a.creator,
  }))

  const activeAlerts = alerts.filter((a) => a.status === 'aktif')

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Keadaan Darurat</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Tombol Darurat
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Tekan tombol untuk mengirim alert ke Security dan Pengurus secara langsung.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <EmergencyPanel alerts={alerts} canResolve={canResolve} currentUserId={user.id} />
      </div>
    </main>
  )
}

```

### app\dashboard\actions.ts
```
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

```

### app\dashboard\page.tsx
```
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import NotificationBell from '@/components/NotificationBell'

const menu = [
  {
    title: 'Tombol Darurat',
    href: '/darurat',
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
    danger: true,
  },
  {
    title: 'Forum Warga',
    href: '/forum',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Warga & Teman',
    href: '/warga',
    path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    title: 'Pesan',
    href: '/chat',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'Pengaduan',
    href: '/pengaduan',
    path: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  },
  {
    title: 'QR Tamu',
    href: '/qr-tamu',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
  {
    title: 'Anggaran & Iuran',
    href: '/anggaran',
    path: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    title: 'Polling Warga',
    href: '/polling',
    path: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  },
  {
    title: 'Katalog Tukang',
    href: '/tukang',
    path: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  },
  {
    title: 'Profil Saya',
    href: '/profile',
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url, house_id, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  // house_id hanya wajib untuk warga. Akun staff/admin (security, it_support, manajemen,
  // paguyuban, superadmin) tidak selalu terikat ke satu rumah.
  if (profile?.role === 'warga' && !profile?.house_id) {
    redirect('/lengkapi-profil')
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const displayName = profile?.full_name ?? 'Warga'
  const houseLabel = (profile as any)?.house?.nomor_rumah
  const isSecurity = profile?.role === 'security' || profile?.role === 'superadmin'
  const isPaguyuban = profile?.role === 'paguyuban' || profile?.role === 'superadmin'
  const isManajemen = profile?.role === 'manajemen' || profile?.role === 'superadmin'
  const isItSupport = profile?.role === 'it_support' || profile?.role === 'superadmin'
  const isSuperadmin = profile?.role === 'superadmin'
  const canSeeRumahKosong = isSecurity || isPaguyuban

  return (
    <main className="flex w-full flex-col">
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-hinggil-mansion.jpg"
              alt="Hinggil Mansion"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <span
              className="text-sm font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
            >
              HINGGIL MANSION
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ color: '#efe4c8' }}>
              <NotificationBell />
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white/10"
                style={{ color: '#efe4c8', border: '1px solid rgba(230,201,138,0.35)' }}
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-2 md:px-10 md:pb-14">
          <h1
            className="text-2xl font-bold md:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}
          >
            Halo, {displayName}
          </h1>
          <p className="mt-1.5 text-sm font-medium md:text-base" style={{ color: '#c7c9d2' }}>
            {houseLabel ? `Rumah ${houseLabel}` : 'Selamat datang kembali'}
          </p>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
            Menu Cepat
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {menu.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{
                  background: '#ffffff',
                  border: m.danger ? '1px solid rgba(179,57,47,0.25)' : '1px solid rgba(26,19,5,0.08)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: m.danger ? '#b3392f' : '#1a1305' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={m.danger ? '#ffffff' : '#e6c98a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.path} />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: m.danger ? '#b3392f' : '#1f1a10' }}>
                  {m.title}
                </div>
              </Link>
            ))}

            {canSeeRumahKosong ? (
              <Link
                href="/rumah-kosong"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Rumah Kosong</div>
              </Link>
            ) : null}

            {isSecurity ? (
              <Link
                href="/security"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Security</div>
              </Link>
            ) : null}

            {isSecurity ? (
              <Link
                href="/keamanan/scan-tamu"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Verifikasi Tamu</div>
              </Link>
            ) : null}

            {isPaguyuban ? (
              <Link
                href="/paguyuban"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Paguyuban</div>
              </Link>
            ) : null}

            {isPaguyuban ? (
              <Link
                href="/paguyuban/moderasi-forum"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Moderasi Forum</div>
              </Link>
            ) : null}

            {isManajemen ? (
              <Link
                href="/manajemen"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Manajemen</div>
              </Link>
            ) : null}

            {isManajemen ? (
              <Link
                href="/tukang/kelola"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 12 2 2 4-4M21 12c0 4.5-3.5 8.5-9 10-5.5-1.5-9-5.5-9-10V5l9-3 9 3v7Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Tukang</div>
              </Link>
            ) : null}

            {isPaguyuban ? (
              <Link
                href="/paguyuban/kelola-staff"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Staff</div>
              </Link>
            ) : null}

            {isItSupport ? (
              <Link
                href="/it-support"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Error Logs</div>
              </Link>
            ) : null}

            {isSuperadmin ? (
              <Link
                href="/superadmin"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Admin</div>
              </Link>
            ) : null}
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
                Pengumuman Terbaru
              </span>
              <Link href="/pengumuman" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
                Lihat Semua
              </Link>
            </div>

            {announcements && announcements.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {announcements.map((a) => (
                  <Link
                    key={a.id}
                    href="/pengumuman"
                    className="flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
                    style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                  >
                    <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                      {a.title}
                    </span>
                    <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
                      {new Date(a.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada pengumuman.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

```

### app\faq\page.tsx
```
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/AppHeader'
import FaqAccordion from '@/components/FaqAccordion'

export default async function FaqPage() {
  const supabase = await createClient()
  const { data: faqItems } = await supabase
    .from('faq_items')
    .select('id, question, answer')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <>
      <AppHeader />
      <main className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 pt-6 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold"
            style={{ color: '#9c7a3f' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-14 pt-6 md:px-10 md:pb-20">
          <div className="mb-8 text-center md:mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Pusat Bantuan
            </span>
            <h1
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Pertanyaan yang Sering Diajukan
            </h1>
          </div>

          {faqItems && faqItems.length > 0 ? (
            <FaqAccordion items={faqItems} />
          ) : (
            <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
              Belum ada FAQ yang tersedia saat ini.
            </p>
          )}
        </div>
      </main>
    </>
  )
}

```

### app\forum\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ForumPostState = {
  error: string
}

export async function createForumPost(
  prevState: ForumPostState,
  formData: FormData
): Promise<ForumPostState> {
  const content = (formData.get('content') as string)?.trim()

  if (!content) {
    return { error: 'Tulis pesan terlebih dahulu.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase.from('forum_posts').insert({
    author_id: user.id,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { error: '' }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing } = await supabase
    .from('forum_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('forum_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('forum_likes').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/forum')
}

export async function addComment(postId: string, content: string) {
  if (!content.trim()) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.from('forum_comments').insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
  })

  revalidatePath('/forum')
}

export async function reportPost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.from('forum_reports').insert({
    post_id: postId,
    reporter_id: user.id,
  })

  revalidatePath('/forum')
}

```

### app\forum\page.tsx
```
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ForumPostForm from '@/components/ForumPostForm'
import ForumFeed from '@/components/ForumFeed'
import NotificationBell from '@/components/NotificationBell'

export default async function ForumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rawPosts } = await supabase
    .from('forum_posts')
    .select('id, content, created_at, author:profiles(full_name)')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50)

  const postIds = (rawPosts ?? []).map((p) => p.id)

  const [{ data: likes }, { data: comments }] = await Promise.all([
    postIds.length
      ? supabase.from('forum_likes').select('post_id, user_id').in('post_id', postIds)
      : Promise.resolve({ data: [] as any[] }),
    postIds.length
      ? supabase
          .from('forum_comments')
          .select('id, post_id, content, created_at, author:profiles(full_name)')
          .in('post_id', postIds)
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
  ])

  const posts = (rawPosts ?? []).map((p: any) => {
    const postLikes = (likes ?? []).filter((l: any) => l.post_id === p.id)
    const postComments = (comments ?? [])
      .filter((c: any) => c.post_id === p.id)
      .map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        author_name: c.author?.full_name ?? 'Warga',
      }))

    return {
      id: p.id,
      content: p.content,
      created_at: p.created_at,
      author_name: p.author?.full_name ?? 'Warga',
      likeCount: postLikes.length,
      likedByMe: !!user && postLikes.some((l: any) => l.user_id === user.id),
      comments: postComments,
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Komunitas
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Forum Warga
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
              Beranda
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <ForumPostForm />
        </div>

        <ForumFeed posts={posts} />
      </div>
    </main>
  )
}

```

### app\globals.css
```
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

### app\it-support\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ROLES = ['it_support', 'superadmin']

async function requireItSupport() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function resolveErrorLog(id: string) {
  const ctx = await requireItSupport()
  if (!ctx) return { error: 'Tidak punya akses.' }

  const { error } = await ctx.supabase
    .from('error_logs')
    .update({ resolved: true, resolved_by: ctx.userId, resolved_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/it-support')
  return { error: null }
}

export type ErrorLogState = { error: string; success: boolean }

export async function createErrorLog(prevState: ErrorLogState, formData: FormData): Promise<ErrorLogState> {
  const level = (formData.get('level') as string) || 'error'
  const module_ = (formData.get('module') as string)?.trim() || 'app'
  const message = (formData.get('message') as string)?.trim()

  if (!message) {
    return { error: 'Pesan error wajib diisi.', success: false }
  }

  const ctx = await requireItSupport()
  if (!ctx) return { error: 'Tidak punya akses.', success: false }

  const { error } = await ctx.supabase.from('error_logs').insert({
    level,
    module: module_,
    message,
    resolved: false,
  })

  if (error) return { error: error.message, success: false }

  revalidatePath('/it-support')
  return { error: '', success: true }
}

```

### app\it-support\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ErrorLogTable from '@/components/admin/ErrorLogTable'

const ALLOWED_ROLES = ['it_support', 'superadmin']

const NAV_ITEMS = [{ title: 'Error Logs', href: '/it-support' }]

export default async function ItSupportPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus IT Support.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: logs } = await supabase
    .from('error_logs')
    .select('id, level, module, message, resolved, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  const allLogs = logs ?? []
  const belumSelesai = allLogs.filter((l) => !l.resolved).length
  const now = new Date()
  const errorLogs24h = allLogs.filter((l) => Date.now() - new Date(l.created_at).getTime() < 1000 * 60 * 60 * 24).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="IT Support" userName={myProfile.full_name ?? 'IT Support'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>IT Support</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Error Logs
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Kamu tidak dapat mengakses data pribadi warga, keuangan, atau chat. Hanya log error sistem.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Total Log"
          value={allLogs.length}
          iconBg="#a8c8f0"
          iconPath="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
        />
        <StatCard
          label="Belum Diperbaiki"
          value={belumSelesai}
          badge={belumSelesai > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#f2b8b0"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Log 24 Jam Terakhir"
          value={errorLogs24h}
          iconBg="#e6c98a"
          iconPath="M12 6v6l4 2"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Log Terbaru
      </div>
      <ErrorLogTable logs={allLogs} />
    </AdminLayout>
  )
}

```

### app\keamanan\scan-tamu\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ScanState = { error: string; success: boolean }

const ALLOWED_ROLES = ['security', 'superadmin']

async function requireSecurity() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return null
  }

  return { supabase, userId: user.id }
}

export async function checkInGuest(prevState: ScanState, formData: FormData): Promise<ScanState> {
  const code = (formData.get('visit_code') as string)?.trim()

  if (!code) {
    return { error: 'Masukkan kode tamu.', success: false }
  }

  const ctx = await requireSecurity()
  if (!ctx) return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }

  const { data: visit, error: findError } = await ctx.supabase
    .from('guest_visits')
    .select('id, status')
    .eq('visit_code', code)
    .eq('status', 'menunggu')
    .maybeSingle()

  if (findError || !visit) {
    return { error: 'Kode tidak ditemukan atau sudah digunakan.', success: false }
  }

  const { error } = await ctx.supabase
    .from('guest_visits')
    .update({ status: 'masuk', checked_in_at: new Date().toISOString(), checked_in_by: ctx.userId })
    .eq('id', visit.id)

  if (error) return { error: error.message, success: false }

  revalidatePath('/keamanan/scan-tamu')
  return { error: '', success: true }
}

export async function checkOutGuest(id: string) {
  const ctx = await requireSecurity()
  if (!ctx) return

  await ctx.supabase
    .from('guest_visits')
    .update({ status: 'keluar', checked_out_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/keamanan/scan-tamu')
}

```

### app\keamanan\scan-tamu\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ScanTamuForm from '@/components/ScanTamuForm'
import GuestLogTable from '@/components/admin/GuestLogTable'

const ALLOWED_ROLES = ['security', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/security' },
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu' },
  { title: 'Status Rumah Kosong', href: '/rumah-kosong' },
  { title: 'Tombol Darurat', href: '/darurat' },
]

export default async function ScanTamuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Security.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: guestsRaw } = await supabase
    .from('guest_visits')
    .select('id, guest_name, purpose, visit_code, status, created_at, checked_in_at, checked_out_at, house:houses(nomor_rumah)')
    .order('created_at', { ascending: false })
    .limit(50)

  const guests = (guestsRaw ?? []).map((g: any) => ({
    ...g,
    house: Array.isArray(g.house) ? g.house[0] : g.house,
  }))

  const tamuDiDalam = guests.filter((g) => g.status === 'masuk').length
  const tamuMenunggu = guests.filter((g) => g.status === 'menunggu').length
  const bulanIni = guests.filter((g) => {
    const d = new Date(g.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Security" userName={myProfile.full_name ?? 'Security'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Security</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Verifikasi Tamu
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Masukkan kode tamu untuk verifikasi masuk, lalu catat saat tamu keluar.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Tamu Di Dalam"
          value={tamuDiDalam}
          iconBg="#a8d8c8"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={tamuMenunggu}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Tamu Bulan Ini"
          value={bulanIni}
          iconBg="#a8c8f0"
          iconPath="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Log Tamu Terbaru
          </div>
          <GuestLogTable guests={guests} />
        </div>

        <div>
          <ScanTamuForm />
        </div>
      </div>
    </AdminLayout>
  )
}

```

### app\layout.tsx
```
import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import AppFooter from '@/components/AppFooter'
import AppNavbar from '@/components/AppNavbar'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Warga Hinggil Mansion',
  description: 'Aplikasi komunitas warga Hinggil Mansion',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${plusJakarta.variable}`}>
      <body
        className="flex min-h-screen flex-col antialiased"
        style={{
          background: '#0a0b0f',
          color: '#f5f3ee',
          fontFamily: 'var(--font-plus-jakarta), sans-serif',
        }}
      >
        <AppNavbar />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </body>
    </html>
  )
}

```

### app\lengkapi-profil\actions.ts
```
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CompleteProfileState = {
  error: string
}

export async function completeProfile(
  prevState: CompleteProfileState,
  formData: FormData
): Promise<CompleteProfileState> {
  const phone = formData.get('phone') as string
  const nik = (formData.get('nik') as string)?.trim()
  const nomorRumah = (formData.get('nomor_rumah') as string)?.trim()
  const familyRole = formData.get('family_role') as string
  const occupancyStatus = formData.get('occupancy_status') as string

  if (!phone || !nik || !nomorRumah || !familyRole || !occupancyStatus) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus 16 digit angka sesuai KTP.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingNik } = await supabase
    .from('profiles')
    .select('id')
    .eq('nik', nik)
    .neq('id', user.id)
    .maybeSingle()

  if (existingNik) {
    return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
  }

  let houseId: string | null = null

  const { data: existingHouse } = await supabase
    .from('houses')
    .select('id')
    .ilike('nomor_rumah', nomorRumah)
    .maybeSingle()

  if (existingHouse) {
    houseId = existingHouse.id
  } else {
    const { data: newHouse, error: houseError } = await supabase
      .from('houses')
      .insert({ nomor_rumah: nomorRumah })
      .select('id')
      .single()

    if (houseError) {
      return { error: `Gagal menyimpan data rumah: ${houseError.message}` }
    }
    houseId = newHouse.id
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('house_id', houseId)

  const isHouseOwner = !count || count === 0

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      phone,
      nik,
      house_id: houseId,
      family_role: familyRole,
      occupancy_status: occupancyStatus,
      is_house_owner: isHouseOwner,
    })
    .eq('id', user.id)

  if (profileError) {
    if (profileError.code === '23505') {
      return { error: 'NIK ini sudah terdaftar oleh akun lain.' }
    }
    return { error: `Gagal menyimpan profil: ${profileError.message}` }
  }

  redirect('/dashboard')
}

```

### app\lengkapi-profil\page.tsx
```
'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { completeProfile, type CompleteProfileState } from './actions'

const initialState: CompleteProfileState = { error: '' }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '11px',
  padding: '12px 13px',
  color: '#f5f3ee',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
}

const optionStyle: React.CSSProperties = {
  color: '#1a1305',
  background: '#ffffff',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#b9b2a0',
}

export default function LengkapiProfilPage() {
  const [state, formAction, isPending] = useActionState(completeProfile, initialState)

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="flex-1 px-7 pb-14 pt-10">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={48}
            height={48}
            className="rounded-xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-[21px] font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Lengkapi Data Warga
            </h1>
            <p className="text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Satu langkah lagi sebelum masuk ke aplikasi
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>NIK (Nomor KTP)</label>
            <input
              type="text"
              name="nik"
              inputMode="numeric"
              placeholder="16 digit sesuai KTP"
              maxLength={16}
              pattern="\d{16}"
              title="NIK harus 16 digit angka"
              required
              style={inputStyle}
            />
          </div>

          <div className="flex gap-2.5">
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor HP</label>
              <input type="text" name="phone" placeholder="08xx" required style={inputStyle} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor Rumah</label>
              <input type="text" name="nomor_rumah" placeholder="D6" required style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Status Hunian</label>
            <select name="occupancy_status" defaultValue="pemilik" required style={selectStyle}>
              <option value="pemilik" style={optionStyle}>Pemilik</option>
              <option value="penyewa" style={optionStyle}>Penyewa</option>
              <option value="sementara" style={optionStyle}>Sementara</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Peran dalam Keluarga</label>
            <select name="family_role" defaultValue="anggota_keluarga" required style={selectStyle}>
              <option value="kepala_keluarga" style={optionStyle}>Kepala Keluarga</option>
              <option value="anggota_keluarga" style={optionStyle}>Anggota Keluarga</option>
              <option value="asisten_rumah_tangga" style={optionStyle}>Asisten Rumah Tangga</option>
              <option value="lainnya" style={optionStyle}>Lainnya</option>
            </select>
          </div>

          {state.error ? (
            <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>
        </form>
      </div>
    </main>
  )
}

```

### app\loading.tsx
```
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        background: 'rgba(10,11,15,0.92)',
      }}
    >
      <div style={{ position: 'relative', width: 160, height: 60, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            fontSize: 34,
            animation: 'runKid 3.2s ease-in-out infinite',
          }}
        >
          🏃
        </div>
      </div>
      <p
        className="text-sm font-bold tracking-wide"
        style={{ color: '#e6c98a', fontFamily: 'var(--font-fraunces), serif' }}
      >
        Memuat halaman...
      </p>

      <style>{`
        @keyframes runKid {
          0% { left: -40px; transform: scaleX(1); }
          45% { left: calc(100% - 20px); transform: scaleX(1); }
          50% { left: calc(100% - 20px); transform: scaleX(-1); }
          95% { left: -40px; transform: scaleX(-1); }
          100% { left: -40px; transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}

```

### app\login\actions.ts
```
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LoginState = { error: string | null }

export async function loginUser(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email atau password salah.' }
  }

  redirect('/dashboard')
}

```

### app\login\page.tsx
```
'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { loginUser } from './actions'

const initialState = { error: '' }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#b9b2a0',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState)

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: '#9a9ca8' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={56}
            height={56}
            className="rounded-2xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Selamat Datang Kembali
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masuk ke akun warga Hinggil Mansion
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="nama@email.com" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label style={labelStyle}>Password</label>
              <Link href="/lupa-password" style={{ fontSize: '12px', color: '#e6c98a', fontWeight: 600 }}>
                Lupa Password?
              </Link>
            </div>
            <input type="password" name="password" placeholder="••••••••" required style={inputStyle} />
          </div>

          {state?.error ? (
            <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="mt-1.5 text-center text-[13px]" style={{ color: '#9a9ca8' }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: '#e6c98a', fontWeight: 600 }}>
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

```

### app\lupa-password\page.tsx
```
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setIsSubmitting(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="px-6 pt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: '#9a9ca8' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali ke Masuk
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={52}
            height={52}
            className="rounded-2xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Lupa Password
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masukkan email kamu, kami kirimkan link untuk atur ulang password
            </p>
          </div>
        </div>

        {sent ? (
          <div
            className="rounded-2xl px-6 py-7 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,106,0.15)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#f5f3ee' }}>
              Link berhasil dikirim ke {email}
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Cek inbox atau folder spam kamu, lalu ikuti link untuk membuat password baru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '12px', color: '#b9b2a0' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={inputStyle}
              />
            </div>

            {error ? (
              <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
              style={{
                border: 'none',
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
                boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

```

### app\manajemen\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ComplaintAdminTable from '@/components/admin/ComplaintAdminTable'

const ALLOWED_ROLES = ['manajemen', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/manajemen' },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function ManajemenDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Manajemen Perumahan.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { count: totalRumah } = await supabase.from('houses').select('id', { count: 'exact', head: true })

  const { count: wargaAktif } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'warga')
    .eq('account_status', 'aktif')

  const { data: complaintsRaw } = await supabase
    .from('complaints')
    .select('id, title, description, category, status, created_at, house:houses(nomor_rumah), creator:created_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(30)

  const complaints = (complaintsRaw ?? []).map((c: any) => ({
    ...c,
    house: Array.isArray(c.house) ? c.house[0] : c.house,
    creator: Array.isArray(c.creator) ? c.creator[0] : c.creator,
  }))

  const pengaduanBaru = complaints.filter((c) => c.status === 'baru').length
  const pengaduanDiproses = complaints.filter((c) => c.status === 'diproses').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Manajemen Perumahan" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Manajemen Perumahan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Manajemen
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Fokus: pengaduan warga, katalog tukang, pengumuman.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Pengaduan Baru"
          value={pengaduanBaru}
          badge={pengaduanBaru > 0 ? 'URGENT' : undefined}
          caption="Belum diproses"
          iconBg="#f2b8b0"
          iconPath="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        />
        <StatCard
          label="Sedang Diproses"
          value={pengaduanDiproses}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Total Rumah"
          value={totalRumah ?? 0}
          iconBg="#a8d8c8"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Warga Aktif"
          value={wargaAktif ?? 0}
          iconBg="#a8c8f0"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Pengaduan Terbaru
      </div>
      <ComplaintAdminTable complaints={complaints} />
    </AdminLayout>
  )
}

```

### app\page.tsx
```
'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

const features = [
  {
    title: 'Tombol Darurat',
    desc: 'Laporan darurat sekali tekan, langsung ke warga & security.',
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Forum Warga',
    desc: 'Diskusi dan info antar warga, satu komunitas satu forum.',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Pengumuman',
    desc: 'Info resmi dari pengurus langsung ke beranda kamu.',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    desc: 'Undang tamu, security scan di pos, tercatat rapi.',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
]

const facilities = [
  { title: 'Masjid', desc: 'Fasilitas ibadah di dalam kawasan, dekat dari setiap unit rumah.' },
  { title: 'Club House', desc: 'Ruang bersama untuk bersantai dan berkumpul warga.' },
  { title: 'Bale Warga', desc: 'Pendopo komunal gaya joglo, titik kumpul warga dan penerima tamu klaster.' },
  { title: 'Playground', desc: 'Area bermain anak yang aman, di dalam kawasan berpagar.' },
  { title: 'Jogging Track', desc: 'Jalur jogging teduh mengelilingi kawasan.' },
  { title: 'Keamanan 24 Jam', desc: 'One gate system dengan pos satpam, menjaga privasi seluruh penghuni.' },
]

export default function LandingPage() {
  const [showDetail, setShowDetail] = useState(false)

  return (
    <main className="flex w-full flex-col">
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <AppHeader />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-14 pt-10 text-center md:px-10 md:pb-20 md:pt-16">
          <h1
            className="max-w-3xl text-[34px] font-bold leading-[1.15] md:text-[56px]"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}
          >
            Komunitas Hinggil Mansion, dalam satu genggaman.
          </h1>
          <p
            className="mt-5 max-w-xl text-base font-medium leading-relaxed md:text-lg"
            style={{ color: '#c7c9d2' }}
          >
            Keamanan, komunikasi, dan kenyamanan seluruh warga menyatu dalam satu aplikasi.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl px-10 py-4 text-center text-base font-bold sm:min-w-[168px]"
              style={{
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
                boxShadow: '0 10px 26px -10px rgba(205,161,90,0.6)',
              }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl px-10 py-4 text-center text-base font-bold sm:min-w-[168px]"
              style={{ border: '2px solid rgba(230,201,138,0.5)', color: '#f2e8d0' }}
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <div className="mb-7 flex flex-col items-center gap-3 text-center md:mb-9">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Fitur Warga
            </span>
            <h2
              className="text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Semua kebutuhan warga, satu aplikasi
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center md:py-8"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14"
                  style={{ background: '#1a1305' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.path} />
                  </svg>
                </div>
                <div className="text-[15px] font-bold md:text-base" style={{ color: '#1f1a10' }}>
                  {f.title}
                </div>
                {showDetail ? (
                  <div className="text-[13px] font-medium leading-snug md:text-sm" style={{ color: '#5b543f' }}>
                    {f.desc}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center md:mt-8">
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="rounded-full px-7 py-3 text-sm font-bold md:text-base"
              style={{ border: '2px solid #1a1305', color: '#1a1305', background: 'transparent' }}
            >
              {showDetail ? 'Sembunyikan Detail' : 'Lihat Detail Semua Fitur'}
            </button>
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0', borderTop: '1px solid rgba(26,19,5,0.06)' }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <div className="mb-7 text-center md:mb-9">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Fasilitas Kawasan
            </span>
            <h2
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Nyaman untuk seluruh keluarga
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {facilities.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl px-5 py-5 md:px-6 md:py-6"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="text-base font-bold md:text-lg" style={{ color: '#1f1a10' }}>
                  {f.title}
                </div>
                <div className="mt-1.5 text-sm font-medium leading-relaxed md:text-base" style={{ color: '#5b543f' }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#0a0b0f' }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <div className="mb-6 text-center md:mb-8">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#d4af6a' }}
            >
              Lokasi
            </span>
            <h2
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Bantul, Daerah Istimewa Yogyakarta
            </h2>
          </div>
          <div
            className="mx-auto flex max-w-2xl flex-col gap-4 rounded-2xl px-6 py-6 md:px-8 md:py-8"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex justify-between gap-4">
              <span className="text-sm font-bold md:text-base" style={{ color: '#c7c9d2' }}>Alamat Klaster</span>
              <span className="text-right text-sm font-semibold md:text-base" style={{ color: '#f5f3ee' }}>
                Bangen, Bangunjiwo, Kec. Kasihan, Kabupaten Bantul, D.I. Yogyakarta 55184
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0', borderTop: '1px solid rgba(26,19,5,0.06)' }}>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center md:px-10">
          <p className="text-sm font-semibold md:text-base" style={{ color: '#5b543f' }}>
            Butuh informasi lebih lanjut?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/faq"
              className="rounded-full px-6 py-2.5 text-sm font-bold md:text-base"
              style={{ border: '2px solid #1a1305', color: '#1a1305' }}
            >
              Lihat FAQ
            </Link>
            <Link
              href="/syarat-ketentuan"
              className="rounded-full px-6 py-2.5 text-sm font-bold md:text-base"
              style={{ border: '2px solid #1a1305', color: '#1a1305' }}
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

```

### app\paguyuban\kelola-staff\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type StaffAccountState = { error: string; success: boolean }

const MANAGED_ROLES = ['security', 'it_support']
const ALLOWED_CALLER_ROLES = ['paguyuban', 'superadmin']

async function requireStaffManager() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ALLOWED_CALLER_ROLES.includes(profile.role)) {
    return null
  }

  return supabase
}

export async function createStaffAccount(prevState: StaffAccountState, formData: FormData): Promise<StaffAccountState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role = formData.get('role') as string

  if (!fullName || !email || !password || !MANAGED_ROLES.includes(role)) {
    return { error: 'Nama, email, password, dan role wajib diisi dengan benar.', success: false }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.', success: false }
  }

  const requester = await requireStaffManager()
  if (!requester) {
    return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }
  }

  try {
    const admin = createAdminClient()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      return { error: createError?.message ?? 'Gagal membuat akun.', success: false }
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({ full_name: fullName, role })
      .eq('id', created.user.id)

    if (profileError) {
      return { error: `Akun dibuat tapi gagal set profil: ${profileError.message}`, success: false }
    }

    revalidatePath('/paguyuban/kelola-staff')
    return { error: '', success: true }
  } catch (err) {
    console.error('createStaffAccount gagal:', err)
    return {
      error: 'Gagal terhubung ke server Supabase (kemungkinan SUPABASE_SERVICE_ROLE_KEY belum/salah di Vercel). Hubungi developer.',
      success: false,
    }
  }
}

export async function updateStaffAccount(id: string, fullName: string, role: string) {
  const requester = await requireStaffManager()
  if (!requester) return { error: 'Tidak punya akses.' }

  if (!MANAGED_ROLES.includes(role)) {
    return { error: 'Role tidak valid.' }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/paguyuban/kelola-staff')
    return { error: null }
  } catch (err) {
    console.error('updateStaffAccount gagal:', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function deleteStaffAccount(id: string) {
  const requester = await requireStaffManager()
  if (!requester) return

  try {
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(id)
    revalidatePath('/paguyuban/kelola-staff')
  } catch (err) {
    console.error('deleteStaffAccount gagal:', err)
  }
}

```

### app\paguyuban\kelola-staff\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import { createStaffAccount, updateStaffAccount, deleteStaffAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'it_support', label: 'IT Support' },
]

const ALLOWED_CALLER_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
  { title: 'Pengumuman', href: '/pengumuman' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
]

export default async function KelolaStaffPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_CALLER_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Paguyuban dan Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: accounts } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['security', 'it_support'])
    .order('created_at', { ascending: false })

  const securityCount = (accounts ?? []).filter((a) => a.role === 'security').length
  const itSupportCount = (accounts ?? []).filter((a) => a.role === 'it_support').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Staff
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Tambah, edit, atau hapus akun Security dan IT Support.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Security"
          value={securityCount}
          iconBg="#a8c8f0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="IT Support"
          value={itSupportCount}
          iconBg="#c9b8f0"
          iconPath="M6 4h12v10H6zM2 20h20M9 17l-1 3M15 17l1 3"
        />
        <StatCard
          label="Total Staff"
          value={(accounts ?? []).length}
          iconBg="#e6c98a"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Daftar Staff
          </div>
          <AdminAccountTable
            accounts={accounts ?? []}
            roleOptions={ROLE_OPTIONS}
            updateAction={updateStaffAccount}
            deleteAction={deleteStaffAccount}
          />
        </div>

        <div>
          <AdminAccountPanel title="Tambah Akun Staff" roleOptions={ROLE_OPTIONS} createAction={createStaffAccount} />
        </div>
      </div>
    </AdminLayout>
  )
}

```

### app\paguyuban\moderasi-forum\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function reactivatePost(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return
  }

  await supabase.from('forum_posts').update({ is_hidden: false, report_count: 0 }).eq('id', postId)
  await supabase.from('forum_reports').delete().eq('post_id', postId)

  revalidatePath('/paguyuban/moderasi-forum')
  revalidatePath('/forum')
}

export async function deletePostPermanently(postId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return
  }

  await supabase.from('forum_posts').delete().eq('id', postId)

  revalidatePath('/paguyuban/moderasi-forum')
  revalidatePath('/forum')
}

```

### app\paguyuban\moderasi-forum\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import ModerasiForumTable from '@/components/admin/ModerasiForumTable'

const ALLOWED_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/paguyuban' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
]

export default async function ModerasiForumPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Paguyuban.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: postsRaw } = await supabase
    .from('forum_posts')
    .select('id, content, report_count, created_at, author:profiles(full_name)')
    .eq('is_hidden', true)
    .order('created_at', { ascending: false })

  const posts = (postsRaw ?? []).map((p: any) => ({
    id: p.id,
    content: p.content,
    report_count: p.report_count ?? 0,
    created_at: p.created_at,
    author_name: (Array.isArray(p.author) ? p.author[0]?.full_name : p.author?.full_name) ?? 'Warga',
  }))

  const totalLaporan = posts.reduce((sum, p) => sum + (p.report_count ?? 0), 0)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Moderasi Forum
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Postingan yang disembunyikan otomatis karena dilaporkan warga.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Postingan Disembunyikan"
          value={posts.length}
          badge={posts.length > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#f2b8b0"
          iconPath="M3 3l18 18M10.6 10.6a2 2 0 1 0 2.8 2.8M9.9 4.24A9.1 9.1 0 0 1 12 4c5 0 9 4 10 8-.3 1.1-.86 2.2-1.6 3.2M6.6 6.6C4.4 8 3 10 2 12c1 4 5 8 10 8 1.5 0 2.9-.3 4.2-.9"
        />
        <StatCard
          label="Total Laporan"
          value={totalLaporan}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Postingan Disembunyikan
      </div>
      <ModerasiForumTable posts={posts} />
    </AdminLayout>
  )
}

```

### app\paguyuban\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'

const ALLOWED_ROLES = ['paguyuban', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/paguyuban' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default async function PaguyubanDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Admin Paguyuban.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: transactions } = await supabase
    .from('iuran_transactions')
    .select('id, type, category, amount, description, transaction_date')
    .order('transaction_date', { ascending: false })
    .limit(200)

  const allTx = transactions ?? []
  const totalPemasukan = allTx.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const totalPengeluaran = allTx.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)
  const saldo = totalPemasukan - totalPengeluaran

  const now = new Date()
  const bulanIniTx = allTx.filter((t) => {
    const d = new Date(t.transaction_date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const pemasukanBulanIni = bulanIniTx.filter((t) => t.type === 'pemasukan').reduce((sum, t) => sum + Number(t.amount), 0)
  const pengeluaranBulanIni = bulanIniTx.filter((t) => t.type === 'pengeluaran').reduce((sum, t) => sum + Number(t.amount), 0)

  const { count: rumahKosong } = await supabase
    .from('houses')
    .select('id', { count: 'exact', head: true })
    .eq('is_empty_flagged', true)

  const { count: pollingAktif } = await supabase
    .from('polls')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const recentTx = allTx.slice(0, 6)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Paguyuban" userName={myProfile.full_name ?? 'Ketua Paguyuban'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Paguyuban
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Fokus: anggaran/iuran, polling, pengumuman, kelola katalog tukang.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Saldo Kas Warga"
          value={formatRupiah(saldo)}
          iconBg="#a8d8c8"
          iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(pemasukanBulanIni)}
          iconBg="#a8c8f0"
          iconPath="M12 19V5M5 12l7-7 7 7"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(pengeluaranBulanIni)}
          iconBg="#f2b8b0"
          iconPath="M12 5v14M5 12l7 7 7-7"
        />
        <StatCard
          label="Rumah Kosong"
          value={rumahKosong ?? 0}
          caption="Terpantau security"
          iconBg="#e6c98a"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Transaksi Terbaru</span>
            <Link href="/anggaran" className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>Lihat Semua</Link>
          </div>
          <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <table className="w-full border-collapse text-left">
              <tbody>
                {recentTx.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>Belum ada transaksi.</td>
                  </tr>
                ) : (
                  recentTx.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                      <td className="px-5 py-3.5">
                        <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{t.category}</div>
                        <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                          {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13.5px] font-bold" style={{ color: t.type === 'pemasukan' ? '#2f6b4f' : '#b3392f' }}>
                        {t.type === 'pemasukan' ? '+' : '-'}{formatRupiah(Number(t.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Polling Aktif ({pollingAktif ?? 0})
          </div>
          <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
            <p className="mb-3 text-[13px] font-medium" style={{ color: '#5b543f' }}>
              {(pollingAktif ?? 0) > 0
                ? `Ada ${pollingAktif} polling yang masih berjalan. Kelola atau tutup dari halaman Polling Warga.`
                : 'Tidak ada polling aktif saat ini.'}
            </p>
            <Link
              href="/polling"
              className="block rounded-xl py-2.5 text-center text-[12.5px] font-bold"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              Kelola Polling
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

```

### app\pengaduan\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ComplaintState = { error: string; success: boolean }

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'security', 'superadmin']
const CATEGORY_OPTIONS = ['kebersihan', 'keamanan', 'fasilitas', 'lainnya']
const STATUS_OPTIONS = ['baru', 'diproses', 'selesai']

export async function createComplaint(prevState: ComplaintState, formData: FormData): Promise<ComplaintState> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const category = (formData.get('category') as string) || 'lainnya'

  if (!title || !description) {
    return { error: 'Judul dan deskripsi pengaduan wajib diisi.', success: false }
  }

  if (!CATEGORY_OPTIONS.includes(category)) {
    return { error: 'Kategori tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('complaints').insert({
    title,
    description,
    category,
    created_by: user.id,
    house_id: profile?.house_id ?? null,
    status: 'baru',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/pengaduan')
  revalidatePath('/manajemen')
  return { error: '', success: true }
}

export async function updateComplaintStatus(id: string, status: string) {
  if (!STATUS_OPTIONS.includes(status)) {
    return { error: 'Status tidak valid.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    return { error: 'Tidak punya akses.' }
  }

  const { error } = await supabase
    .from('complaints')
    .update({ status, handled_by: user.id, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/pengaduan')
  revalidatePath('/manajemen')
  return { error: null }
}

```

### app\pengaduan\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComplaintForm from '@/components/ComplaintForm'
import ComplaintItem from '@/components/ComplaintItem'

export default async function PengaduanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: complaints } = await supabase
    .from('complaints')
    .select('id, title, description, category, status, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Layanan Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Pengaduan
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Laporkan keluhan seputar kebersihan, keamanan, atau fasilitas perumahan.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <ComplaintForm />
        </div>

        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Pengaduan Saya
        </div>

        {complaints && complaints.length > 0 ? (
          <div className="flex flex-col gap-3">
            {complaints.map((c) => (
              <ComplaintItem key={c.id} item={c} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada pengaduan yang kamu buat.
          </p>
        )}
      </div>
    </main>
  )
}

```

### app\pengumuman\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

async function requireAnnouncementAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Belum login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    throw new Error('Tidak punya akses untuk membuat/menghapus pengumuman')
  }

  return { supabase, userId: user.id }
}

export async function createAnnouncement(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()

  if (!title || !content) {
    return { error: 'Judul dan isi pengumuman wajib diisi.' }
  }

  const { supabase, userId } = await requireAnnouncementAdmin()

  const { error } = await supabase.from('announcements').insert({
    title,
    content,
    created_by: userId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteAnnouncement(id: string) {
  const { supabase } = await requireAnnouncementAdmin()

  const { error } = await supabase.from('announcements').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/pengumuman')
  revalidatePath('/dashboard')
  return { error: null }
}

```

### app\pengumuman\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnnouncementForm from '@/components/AnnouncementForm'
import AnnouncementList from '@/components/AnnouncementList'

const ADMIN_ROLES = ['manajemen', 'paguyuban', 'superadmin']

export default async function PengumumanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  const canManage = !!myProfile && ADMIN_ROLES.includes(myProfile.role)

  const { data: announcementsRaw } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, author:profiles(full_name)')
    .order('created_at', { ascending: false })

  const announcements = (announcementsRaw ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    created_at: a.created_at,
    author_name: (Array.isArray(a.author) ? a.author[0]?.full_name : a.author?.full_name) ?? 'Admin',
  }))

  return (
    <main className="flex w-full flex-col" style={{ background: '#faf7f0' }}>
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#e6c98a' }}>
            ← Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-8 pt-1 md:px-10 md:pb-10">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Informasi Warga
          </span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}>
            Pengumuman
          </h1>
        </div>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-3xl px-6 py-8 md:px-10 md:py-10">
          {canManage ? <AnnouncementForm /> : null}
          <AnnouncementList items={announcements} canManage={canManage} />
        </div>
      </section>
    </main>
  )
}

```

### app\polling\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type CreatePollState = { error: string; success: boolean }

export async function createPoll(prevState: CreatePollState, formData: FormData): Promise<CreatePollState> {
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const optionsRaw = (formData.get('options') as string) ?? ''
  const options = optionsRaw
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean)

  if (!title || options.length < 2) {
    return { error: 'Judul wajib diisi dan minimal 2 pilihan jawaban.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) {
    return { error: 'Kamu tidak punya akses untuk membuat polling.', success: false }
  }

  const { data: poll, error } = await supabase
    .from('polls')
    .insert({ title, description: description || null, created_by: user.id })
    .select('id')
    .single()

  if (error || !poll) {
    return { error: error?.message ?? 'Gagal membuat polling.', success: false }
  }

  const { error: optError } = await supabase
    .from('poll_options')
    .insert(options.map((option_text) => ({ poll_id: poll.id, option_text })))

  if (optError) {
    return { error: optError.message, success: false }
  }

  revalidatePath('/polling')
  return { error: '', success: true }
}

export async function votePoll(pollId: string, optionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase.from('poll_votes').insert({ poll_id: pollId, option_id: optionId, voter_id: user.id })
  revalidatePath('/polling')
}

export async function closePoll(pollId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || !['paguyuban', 'superadmin'].includes(profile.role)) return

  await supabase.from('polls').update({ is_active: false }).eq('id', pollId)
  revalidatePath('/polling')
}

```

### app\polling\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PollCreateForm from '@/components/PollCreateForm'
import PollCard from '@/components/PollCard'

export default async function PollingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canManage = !!profile && ['paguyuban', 'superadmin'].includes(profile.role)

  const { data: polls } = await supabase
    .from('polls')
    .select('id, title, description, is_active, created_at')
    .order('created_at', { ascending: false })

  const pollIds = (polls ?? []).map((p) => p.id)

  const [{ data: options }, { data: votes }] = await Promise.all([
    pollIds.length > 0
      ? supabase.from('poll_options').select('id, poll_id, option_text').in('poll_id', pollIds)
      : Promise.resolve({ data: [] as any[] }),
    pollIds.length > 0
      ? supabase.from('poll_votes').select('id, poll_id, option_id, voter_id').in('poll_id', pollIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const enrichedPolls = (polls ?? []).map((p) => {
    const pollOptions = (options ?? []).filter((o) => o.poll_id === p.id)
    const pollVotes = (votes ?? []).filter((v) => v.poll_id === p.id)
    const myVote = pollVotes.find((v) => v.voter_id === user.id)

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      is_active: p.is_active,
      totalVotes: pollVotes.length,
      votedOptionId: myVote?.option_id ?? null,
      options: pollOptions.map((o) => ({
        id: o.id,
        option_text: o.option_text,
        voteCount: pollVotes.filter((v) => v.option_id === o.id).length,
      })),
    }
  })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Suara Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Polling Warga
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {canManage ? (
          <div className="mb-6">
            <PollCreateForm />
          </div>
        ) : null}

        {enrichedPolls.length > 0 ? (
          <div className="flex flex-col gap-3">
            {enrichedPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} canManage={canManage} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada polling saat ini.
          </p>
        )}
      </div>
    </main>
  )
}

```

### app\profile\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type UpdateProfileState = {
  error: string
  success: boolean
}

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const bio = (formData.get('bio') as string)?.trim()
  const nik = (formData.get('nik') as string)?.trim()
  const familyRole = formData.get('family_role') as string
  const occupancyStatus = formData.get('occupancy_status') as string

  if (!fullName || !phone || !nik || !familyRole || !occupancyStatus) {
    return { error: 'Nama, HP, NIK, peran keluarga, dan status hunian wajib diisi.', success: false }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus terdiri dari 16 digit angka.', success: false }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existingNik } = await supabase
    .from('profiles')
    .select('id')
    .eq('nik', nik)
    .neq('id', user.id)
    .maybeSingle()

  if (existingNik) {
    return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      bio: bio || null,
      nik,
      family_role: familyRole,
      occupancy_status: occupancyStatus,
    })
    .eq('id', user.id)

  if (error) {
    if ((error as any).code === '23505') {
      return { error: 'NIK ini sudah terdaftar pada akun lain.', success: false }
    }
    return { error: error.message, success: false }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

```

### app\profile\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileEditForm from '@/components/ProfileEditForm'
import ProfileInfoCard from '@/components/ProfileInfoCard'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, bio, nik, avatar_url, family_role, occupancy_status, account_status, is_house_owner, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  const houseLabel = (profile as any)?.house?.nomor_rumah ?? null

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-lg px-6 pt-4 md:px-10">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#9c7a3f' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Beranda
        </Link>
      </div>

      <div
        className="mt-3 w-full"
        style={{
          height: 128,
          background:
            'radial-gradient(120% 140% at 50% 0%, rgba(212,175,106,0.25) 0%, rgba(10,11,15,0) 70%), #0a0b0f',
        }}
      />

      <div className="mx-auto w-full max-w-lg px-6 pb-14 md:px-10">
        <ProfileInfoCard
          editable
          profile={{
            userId: user.id,
            fullName: profile?.full_name ?? 'Warga',
            phone: profile?.phone ?? null,
            bio: profile?.bio ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            familyRole: profile?.family_role ?? null,
            occupancyStatus: profile?.occupancy_status ?? null,
            accountStatus: profile?.account_status ?? null,
            isHouseOwner: !!profile?.is_house_owner,
            houseLabel,
          }}
        >
          <div className="mt-6">
            <ProfileEditForm
              fullName={profile?.full_name ?? ''}
              phone={profile?.phone ?? ''}
              bio={profile?.bio ?? ''}
              nik={profile?.nik ?? ''}
              familyRole={profile?.family_role ?? 'anggota_keluarga'}
              occupancyStatus={profile?.occupancy_status ?? 'pemilik'}
            />
          </div>
        </ProfileInfoCard>
      </div>
    </main>
  )
}

```

### app\qr-tamu\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type GuestVisitState = { error: string; success: boolean; code?: string }

const PURPOSE_OPTIONS = ['keluarga', 'kurir', 'tukang', 'delivery', 'lainnya']

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createGuestVisit(prevState: GuestVisitState, formData: FormData): Promise<GuestVisitState> {
  const guestName = (formData.get('guest_name') as string)?.trim()
  const guestPhone = (formData.get('guest_phone') as string)?.trim()
  const purpose = (formData.get('purpose') as string) || 'lainnya'

  if (!guestName) {
    return { error: 'Nama tamu wajib diisi.', success: false }
  }

  if (!PURPOSE_OPTIONS.includes(purpose)) {
    return { error: 'Keperluan tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  let code = generateCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase
      .from('guest_visits')
      .select('id')
      .eq('visit_code', code)
      .eq('status', 'menunggu')
      .maybeSingle()
    if (!existing) break
    code = generateCode()
  }

  const { error } = await supabase.from('guest_visits').insert({
    guest_name: guestName,
    guest_phone: guestPhone || null,
    purpose,
    visit_code: code,
    status: 'menunggu',
    invited_by: user.id,
    house_id: profile?.house_id ?? null,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/qr-tamu')
  return { error: '', success: true, code }
}

export async function cancelGuestVisit(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase.from('guest_visits').update({ status: 'dibatalkan' }).eq('id', id).eq('invited_by', user.id)
  revalidatePath('/qr-tamu')
}

```

### app\qr-tamu\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GuestInviteForm from '@/components/GuestInviteForm'
import GuestVisitItem from '@/components/GuestVisitItem'

export default async function QrTamuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: visits } = await supabase
    .from('guest_visits')
    .select('id, guest_name, purpose, visit_code, status, created_at, checked_in_at')
    .eq('invited_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keamanan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              QR Tamu
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Buat kode tamu, berikan ke tamu, lalu tunjukkan ke Security saat tiba.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <GuestInviteForm />
        </div>

        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Tamu Saya
        </div>

        {visits && visits.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visits.map((v) => (
              <GuestVisitItem key={v.id} item={v} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada tamu yang kamu undang.
          </p>
        )}
      </div>
    </main>
  )
}

```

### app\register\actions.ts
```
'use server'

import { createClient } from '@/lib/supabase/server'

export type RegisterState = {
  error: string
  success: boolean
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const fullName = formData.get('full_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = formData.get('phone') as string
  const nik = (formData.get('nik') as string)?.trim()
  const nomorRumah = (formData.get('nomor_rumah') as string)?.trim()
  const familyRole = formData.get('family_role') as string
  const occupancyStatus = formData.get('occupancy_status') as string

  if (!fullName || !email || !password || !phone || !nik || !nomorRumah || !familyRole || !occupancyStatus) {
    return { error: 'Semua field wajib diisi.', success: false }
  }

  if (!/^\d{16}$/.test(nik)) {
    return { error: 'NIK harus 16 digit angka sesuai KTP.', success: false }
  }

  const supabase = await createClient()

  const { data: existingNik } = await supabase
    .from('profiles')
    .select('id')
    .eq('nik', nik)
    .maybeSingle()

  if (existingNik) {
    return { error: 'NIK ini sudah terdaftar. Setiap warga hanya boleh mendaftar satu akun.', success: false }
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (signUpError || !signUpData.user) {
    return { error: signUpError?.message ?? 'Gagal membuat akun.', success: false }
  }

  const userId = signUpData.user.id

  if (!signUpData.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return {
        error:
          'Akun berhasil dibuat, tapi belum bisa login otomatis (kemungkinan email perlu dikonfirmasi dulu). Hubungi admin untuk mengaktifkan akun kamu, atau matikan "Confirm Email" di pengaturan Supabase.',
        success: false,
      }
    }
  }

  let houseId: string | null = null

  const { data: existingHouse } = await supabase
    .from('houses')
    .select('id')
    .ilike('nomor_rumah', nomorRumah)
    .maybeSingle()

  if (existingHouse) {
    houseId = existingHouse.id
  } else {
    const { data: newHouse, error: houseError } = await supabase
      .from('houses')
      .insert({ nomor_rumah: nomorRumah })
      .select('id')
      .single()

    if (houseError) {
      return { error: `Gagal menyimpan data rumah: ${houseError.message}`, success: false }
    }
    houseId = newHouse.id
  }

  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('house_id', houseId)

  const isHouseOwner = !count || count === 0

  const { error: profileError, data: updatedProfile } = await supabase
    .from('profiles')
    .update({
      phone,
      nik,
      house_id: houseId,
      family_role: familyRole,
      occupancy_status: occupancyStatus,
      is_house_owner: isHouseOwner,
    })
    .eq('id', userId)
    .select('id')

  if (profileError) {
    if (profileError.code === '23505') {
      return { error: 'NIK ini sudah terdaftar oleh akun lain.', success: false }
    }
    return { error: `Gagal menyimpan profil: ${profileError.message}`, success: false }
  }

  if (!updatedProfile || updatedProfile.length === 0) {
    return {
      error:
        'Akun dibuat tapi data profil gagal tersimpan karena sesi belum aktif. Hubungi admin untuk memperbaiki data ini secara manual.',
      success: false,
    }
  }

  return { error: '', success: true }
}

```

### app\register\page.tsx
```
'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { registerUser, type RegisterState } from './actions'

const initialState: RegisterState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '11px',
  padding: '12px 13px',
  color: '#f5f3ee',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
}

const optionStyle: React.CSSProperties = {
  color: '#1a1305',
  background: '#ffffff',
}

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#b9b2a0',
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!state.success) return
    if (countdown <= 0) {
      router.push('/login')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [state.success, countdown, router])

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      {state.success ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(10,11,15,0.82)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl px-7 py-8 text-center"
            style={{ background: '#141620', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,106,0.15)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Pendaftaran Berhasil
            </h2>
            <p className="mt-2 text-sm font-medium" style={{ color: '#9a9ca8' }}>
              Akun kamu sudah dibuat. Silakan masuk menggunakan email dan password kamu.
            </p>
            <p className="mt-4 text-xs font-semibold" style={{ color: '#6d6f7a' }}>
              Mengarahkan ke halaman Masuk dalam {countdown} detik...
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block w-full rounded-xl py-3 text-sm font-bold"
              style={{
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
              }}
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      ) : null}

      <div className="px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px]"
          style={{ color: '#9a9ca8' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
      </div>

      <div className="flex-1 px-7 pb-14 pt-4">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={48}
            height={48}
            className="rounded-xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-[21px] font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Daftar Warga
            </h1>
            <p className="text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Bergabung dengan komunitas Hinggil Mansion
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Nama Lengkap</label>
            <input type="text" name="full_name" placeholder="Nama sesuai KTP" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>NIK (Nomor KTP)</label>
            <input
              type="text"
              name="nik"
              inputMode="numeric"
              placeholder="16 digit sesuai KTP"
              maxLength={16}
              pattern="\d{16}"
              title="NIK harus 16 digit angka"
              required
              style={inputStyle}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" placeholder="nama@email.com" required style={inputStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" placeholder="••••••••" required minLength={6} style={inputStyle} />
          </div>

          <div className="flex gap-2.5">
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor HP</label>
              <input type="text" name="phone" placeholder="08xx" required style={inputStyle} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label style={labelStyle}>Nomor Rumah</label>
              <input type="text" name="nomor_rumah" placeholder="D6" required style={inputStyle} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Status Hunian</label>
            <select name="occupancy_status" defaultValue="pemilik" required style={selectStyle}>
              <option value="pemilik" style={optionStyle}>Pemilik</option>
              <option value="penyewa" style={optionStyle}>Penyewa</option>
              <option value="sementara" style={optionStyle}>Sementara</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Peran dalam Keluarga</label>
            <select name="family_role" defaultValue="anggota_keluarga" required style={selectStyle}>
              <option value="kepala_keluarga" style={optionStyle}>Kepala Keluarga</option>
              <option value="anggota_keluarga" style={optionStyle}>Anggota Keluarga</option>
              <option value="asisten_rumah_tangga" style={optionStyle}>Asisten Rumah Tangga</option>
              <option value="lainnya" style={optionStyle}>Lainnya</option>
            </select>
          </div>

          {state.error ? (
            <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 rounded-xl py-3.5 text-[14.5px] font-bold"
            style={{
              border: 'none',
              background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
              color: '#1a1305',
              boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'default' : 'pointer',
            }}
          >
            {isPending ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="mt-1 text-center text-[12.5px]" style={{ color: '#9a9ca8' }}>
            Sudah punya akun?{' '}
            <Link href="/login" style={{ color: '#e6c98a', fontWeight: 600 }}>
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}

```

### app\reset-password\page.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak sama.')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 2500)
  }

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)',
      }}
    >
      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={52}
            height={52}
            className="rounded-2xl object-cover"
          />
          <div className="text-center">
            <h1
              className="mb-1.5 text-2xl font-medium"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
            >
              Atur Password Baru
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>
              Masukkan password baru untuk akun kamu
            </p>
          </div>
        </div>

        {done ? (
          <div
            className="rounded-2xl px-6 py-7 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: 'rgba(212,175,106,0.15)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: '#f5f3ee' }}>
              Password berhasil diubah
            </p>
            <p className="mt-2 text-[12.5px]" style={{ color: '#9a9ca8' }}>
              Mengarahkan ke halaman Masuk...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '12px', color: '#b9b2a0' }}>Password Baru</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '12px', color: '#b9b2a0' }}>Konfirmasi Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {error ? (
              <p className="text-[12.5px]" style={{ color: '#e08a8a' }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold"
              style={{
                border: 'none',
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
                boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

```

### app\rumah-kosong\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'security', 'superadmin'].includes(profile.role)) {
    return null
  }

  return supabase
}

export async function flagHouseEmpty(houseId: string) {
  const supabase = await requireAccess()
  if (!supabase) return

  await supabase.from('houses').update({ is_empty_flagged: true, empty_since: new Date().toISOString() }).eq('id', houseId)
  revalidatePath('/rumah-kosong')
}

export async function unflagHouseEmpty(houseId: string) {
  const supabase = await requireAccess()
  if (!supabase) return

  await supabase.from('houses').update({ is_empty_flagged: false, empty_since: null }).eq('id', houseId)
  revalidatePath('/rumah-kosong')
}

```

### app\rumah-kosong\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RumahKosongList from '@/components/RumahKosongList'

export default async function RumahKosongPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['paguyuban', 'security', 'superadmin'].includes(profile.role)) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Halaman ini khusus untuk paguyuban & security.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const { data: houses } = await supabase
    .from('houses')
    .select('id, nomor_rumah, is_empty_flagged, empty_since')
    .order('nomor_rumah', { ascending: true })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keamanan Lingkungan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Status Rumah Kosong
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <RumahKosongList houses={houses ?? []} />
      </div>
    </main>
  )
}

```

### app\security\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import GuestLogTable from '@/components/admin/GuestLogTable'

const ALLOWED_ROLES = ['security', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/security' },
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu' },
  { title: 'Status Rumah Kosong', href: '/rumah-kosong' },
  { title: 'Tombol Darurat', href: '/darurat' },
]

export default async function SecurityDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Security.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: guestsRaw } = await supabase
    .from('guest_visits')
    .select('id, guest_name, purpose, visit_code, status, created_at, checked_in_at, checked_out_at, house:houses(nomor_rumah)')
    .order('created_at', { ascending: false })
    .limit(15)

  const guests = (guestsRaw ?? []).map((g: any) => ({
    ...g,
    house: Array.isArray(g.house) ? g.house[0] : g.house,
  }))

  const { count: tamuDiDalam } = await supabase
    .from('guest_visits')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'masuk')

  const { count: rumahKosong } = await supabase
    .from('houses')
    .select('id', { count: 'exact', head: true })
    .eq('is_empty_flagged', true)

  const { count: alertAktif } = await supabase
    .from('emergency_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'aktif')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: tamuBulanIni } = await supabase
    .from('guest_visits')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  const { data: rumahKosongList } = await supabase
    .from('houses')
    .select('id, nomor_rumah, empty_since')
    .eq('is_empty_flagged', true)
    .order('empty_since', { ascending: true })
    .limit(6)

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Security" userName={myProfile.full_name ?? 'Security'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Security</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Dashboard Security
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Pantau tamu, rumah kosong, dan alert darurat secara real-time.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Tamu Di Dalam"
          value={tamuDiDalam ?? 0}
          iconBg="#a8d8c8"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Rumah Kosong"
          value={rumahKosong ?? 0}
          caption="Perlu patroli ekstra"
          iconBg="#e6c98a"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Alert Darurat"
          value={alertAktif ?? 0}
          badge={(alertAktif ?? 0) > 0 ? 'AKTIF' : undefined}
          caption={(alertAktif ?? 0) > 0 ? 'Butuh respons' : 'Aman terkendali'}
          iconBg="#f2b8b0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        <StatCard
          label="Tamu Bulan Ini"
          value={tamuBulanIni ?? 0}
          iconBg="#a8c8f0"
          iconPath="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Log Tamu Terbaru
          </div>
          <GuestLogTable guests={guests} />
        </div>

        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Rumah Kosong
          </div>
          <div className="flex flex-col gap-2.5">
            {rumahKosongList && rumahKosongList.length > 0 ? (
              rumahKosongList.map((h) => {
                const days = h.empty_since
                  ? Math.max(0, Math.floor((Date.now() - new Date(h.empty_since).getTime()) / (1000 * 60 * 60 * 24)))
                  : 0
                return (
                  <div key={h.id} className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{h.nomor_rumah}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: days >= 7 ? 'rgba(179,57,47,0.12)' : 'rgba(212,175,106,0.16)', color: days >= 7 ? '#b3392f' : '#9c7a3f' }}
                      >
                        {days} HARI
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl px-5 py-6 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
                Tidak ada rumah kosong.
              </div>
            )}
            <Link
              href="/rumah-kosong"
              className="rounded-xl py-2.5 text-center text-[12.5px] font-bold"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              Lihat Semua
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

```

### app\superadmin\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminAccountState = { error: string; success: boolean }

const MANAGED_ROLES = ['manajemen', 'paguyuban']

async function requireSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || profile.role !== 'superadmin') {
    return null
  }

  return supabase
}

export async function createAdminAccount(prevState: AdminAccountState, formData: FormData): Promise<AdminAccountState> {
  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role = formData.get('role') as string

  if (!fullName || !email || !password || !MANAGED_ROLES.includes(role)) {
    return { error: 'Nama, email, password, dan role wajib diisi dengan benar.', success: false }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!myProfile || myProfile.role !== 'superadmin') {
    return { error: 'Kamu tidak punya akses untuk fitur ini.', success: false }
  }

  try {
    const admin = createAdminClient()

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !created.user) {
      return { error: createError?.message ?? 'Gagal membuat akun.', success: false }
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({ full_name: fullName, role })
      .eq('id', created.user.id)

    if (profileError) {
      return { error: `Akun dibuat tapi gagal set profil: ${profileError.message}`, success: false }
    }

    revalidatePath('/superadmin')
    return { error: '', success: true }
  } catch (err) {
    console.error('createAdminAccount gagal:', err)
    return {
      error: 'Gagal terhubung ke server Supabase (kemungkinan SUPABASE_SERVICE_ROLE_KEY belum/salah di Vercel). Hubungi developer.',
      success: false,
    }
  }
}

export async function updateAdminAccount(id: string, fullName: string, role: string) {
  const requester = await requireSuperadmin()
  if (!requester) return { error: 'Tidak punya akses.' }

  if (!MANAGED_ROLES.includes(role)) {
    return { error: 'Role tidak valid.' }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ full_name: fullName, role }).eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/superadmin')
    return { error: null }
  } catch (err) {
    console.error('updateAdminAccount gagal:', err)
    return { error: 'Gagal terhubung ke server Supabase. Hubungi developer.' }
  }
}

export async function deleteAdminAccount(id: string) {
  const requester = await requireSuperadmin()
  if (!requester) return

  try {
    const admin = createAdminClient()
    await admin.auth.admin.deleteUser(id)
    revalidatePath('/superadmin')
  } catch (err) {
    console.error('deleteAdminAccount gagal:', err)
  }
}

```

### app\superadmin\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import { createAdminAccount, updateAdminAccount, deleteAdminAccount } from './actions'

const ROLE_OPTIONS = [
  { value: 'manajemen', label: 'Admin Manajemen Perumahan' },
  { value: 'paguyuban', label: 'Admin Paguyuban' },
]

const NAV_ITEMS = [
  { title: 'Kelola Admin', href: '/superadmin' },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function SuperadminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || myProfile.role !== 'superadmin') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: accounts } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .in('role', ['manajemen', 'paguyuban'])
    .order('created_at', { ascending: false })

  const { count: wargaCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'warga')

  const paguyubanCount = (accounts ?? []).filter((a) => a.role === 'paguyuban').length
  const manajemenCount = (accounts ?? []).filter((a) => a.role === 'manajemen').length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Superadmin" userName={myProfile.full_name ?? 'Superadmin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Admin
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Tambah, edit, atau hapus akun Admin Paguyuban dan Admin Manajemen Perumahan.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total Warga"
          value={wargaCount ?? 0}
          caption="Akun aktif"
          iconBg="#e6c98a"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
        <StatCard
          label="Admin Paguyuban"
          value={paguyubanCount}
          iconBg="#c9b8f0"
          iconPath="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6"
        />
        <StatCard
          label="Admin Manajemen"
          value={manajemenCount}
          iconBg="#a8d8c8"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard
          label="Total Admin"
          value={(accounts ?? []).length}
          iconBg="#f2b8b0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Daftar Admin
          </div>
          <AdminAccountTable
            accounts={accounts ?? []}
            roleOptions={ROLE_OPTIONS}
            updateAction={updateAdminAccount}
            deleteAction={deleteAdminAccount}
          />
        </div>

        <div>
          <AdminAccountPanel title="Tambah Akun Admin" roleOptions={ROLE_OPTIONS} createAction={createAdminAccount} />
        </div>
      </div>
    </AdminLayout>
  )
}

```

### app\syarat-ketentuan\page.tsx
```
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/AppHeader'

export default async function SyaratKetentuanPage() {
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('app_pages')
    .select('title, content, updated_at')
    .eq('slug', 'syarat-ketentuan')
    .maybeSingle()

  const updatedAt = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <AppHeader />
      <main className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 pt-6 md:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold"
            style={{ color: '#9c7a3f' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
        <div className="mx-auto w-full max-w-3xl px-6 pb-14 pt-6 md:px-10 md:pb-20">
          <div className="mb-8 md:mb-10">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Dokumen Resmi
            </span>
            <h1
              className="mt-2 text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              {page?.title ?? 'Syarat & Ketentuan'}
            </h1>
            {updatedAt ? (
              <p className="mt-2 text-sm font-medium" style={{ color: '#9c7a3f' }}>
                Terakhir diperbarui: {updatedAt}
              </p>
            ) : null}
          </div>

          <div
            className="whitespace-pre-line rounded-2xl px-6 py-7 text-[15px] font-medium leading-relaxed md:px-8 md:py-9 md:text-base"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#3a3424' }}
          >
            {page?.content ?? 'Dokumen belum tersedia.'}
          </div>
        </div>
      </main>
    </>
  )
}

```

### app\test-koneksi\page.tsx
```
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TestKoneksiPage() {
  const [status, setStatus] = useState("Menghubungkan...")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ error }) => {
      setStatus(error ? `Gagal: ${error.message}` : "Terhubung ke Supabase")
    })
  }, [])

  return (
    <main style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Test Koneksi Supabase</h1>
      <p>{status}</p>
      <p style={{ color: "#888", fontSize: 12 }}>
        URL project: {process.env.NEXT_PUBLIC_SUPABASE_URL}
      </p>
    </main>
  )
}

```

### app\tukang\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type SubmitTukangState = { error: string; success: boolean }

export async function submitTukang(prevState: SubmitTukangState, formData: FormData): Promise<SubmitTukangState> {
  const name = (formData.get('name') as string)?.trim()
  const specialty = (formData.get('specialty') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!name || !specialty || !phone) {
    return { error: 'Nama, keahlian, dan nomor HP wajib diisi.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('tukang_catalog').insert({
    name,
    specialty,
    phone,
    description: description || null,
    submitted_by: user.id,
    status: 'pending',
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/tukang')
  return { error: '', success: true }
}

async function requireManajemen() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['manajemen', 'superadmin'].includes(profile.role)) {
    return null
  }

  return supabase
}

export async function approveTukang(id: string) {
  const supabase = await requireManajemen()
  if (!supabase) return
  await supabase.from('tukang_catalog').update({ status: 'approved' }).eq('id', id)
  revalidatePath('/tukang')
  revalidatePath('/tukang/kelola')
}

export async function rejectTukang(id: string) {
  const supabase = await requireManajemen()
  if (!supabase) return
  await supabase.from('tukang_catalog').update({ status: 'rejected' }).eq('id', id)
  revalidatePath('/tukang')
  revalidatePath('/tukang/kelola')
}

```

### app\tukang\kelola\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import TukangKelolaTable from '@/components/admin/TukangKelolaTable'

const ALLOWED_ROLES = ['manajemen', 'superadmin']

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/manajemen' },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola' },
  { title: 'Pengumuman', href: '/pengumuman' },
]

export default async function TukangKelolaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: myProfile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle()

  if (!myProfile || !ALLOWED_ROLES.includes(myProfile.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Manajemen Perumahan.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const { data: pendingRaw } = await supabase
    .from('tukang_catalog')
    .select('id, name, specialty, phone, description, created_at, submitter:profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const pending = (pendingRaw ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    phone: t.phone,
    description: t.description,
    created_at: t.created_at,
    submitter_name: (Array.isArray(t.submitter) ? t.submitter[0]?.full_name : t.submitter?.full_name) ?? 'Warga',
  }))

  const { count: totalApproved } = await supabase
    .from('tukang_catalog')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalRejected } = await supabase
    .from('tukang_catalog')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'rejected')

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel="Manajemen Perumahan" userName={myProfile.full_name ?? 'Admin'} navItems={NAV_ITEMS}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Manajemen Perumahan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Katalog Tukang
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Verifikasi tukang yang didaftarkan warga sebelum tampil di Katalog Tukang.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          badge={pending.length > 0 ? 'PERLU AKSI' : undefined}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3"
        />
        <StatCard
          label="Terverifikasi"
          value={totalApproved ?? 0}
          iconBg="#a8d8c8"
          iconPath="m9 12 2 2 4-4M21 12c0 4.5-3.5 8.5-9 10-5.5-1.5-9-5.5-9-10V5l9-3 9 3v7Z"
        />
        <StatCard
          label="Ditolak"
          value={totalRejected ?? 0}
          iconBg="#f2b8b0"
          iconPath="M18 6 6 18M6 6l12 12"
        />
      </div>

      <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
        Menunggu Verifikasi
      </div>
      <TukangKelolaTable items={pending} />
    </AdminLayout>
  )
}

```

### app\tukang\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TukangForm from '@/components/TukangForm'

export default async function TukangPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isManajemen = !!profile && ['manajemen', 'superadmin'].includes(profile.role)

  const { data: tukangList } = await supabase
    .from('tukang_catalog')
    .select('id, name, specialty, phone, description')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rekomendasi Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Katalog Tukang
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isManajemen ? (
              <Link href="/tukang/kelola" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Kelola</Link>
            ) : null}
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        <div className="mb-6">
          <TukangForm />
        </div>

        {tukangList && tukangList.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tukangList.map((t) => (
              <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
                  >
                    {t.specialty}
                  </span>
                </div>
                {t.description ? (
                  <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{t.description}</p>
                ) : null}
                <a
                  href={`https://wa.me/62${t.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold"
                  style={{ color: '#2f8a4f' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
                  </svg>
                  {t.phone}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada tukang direkomendasikan.
          </p>
        )}
      </div>
    </main>
  )
}

```

### app\warga\[id]\page.tsx
```
(gagal dibaca: A parameter cannot be found that matches parameter name 'Raw'.)
```

### app\warga\actions.ts
```
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function sendFriendRequest(addresseeId: string) {
  const { supabase, user } = await currentUser()
  if (user.id === addresseeId) return

  await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
  revalidatePath('/warga')
  revalidatePath(`/warga/${addresseeId}`)
}

export async function acceptFriendRequest(friendshipId: string) {
  const { supabase, user } = await currentUser()

  await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  revalidatePath('/warga')
  revalidatePath('/chat')
}

export async function rejectFriendRequest(friendshipId: string) {
  const { supabase, user } = await currentUser()

  await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  revalidatePath('/warga')
  revalidatePath('/chat')
}

```

### app\warga\page.tsx
```
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function WargaDirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  const [{ data: allProfiles }, { data: myFriendships }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, family_role, house:houses(nomor_rumah)')
      .neq('id', userId)
      .order('full_name', { ascending: true }),
    supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
  ])

  const pendingReceived = (myFriendships ?? []).filter((f) => f.status === 'pending' && f.addressee_id === userId)

  function friendLabel(profileId: string): string | null {
    const f = (myFriendships ?? []).find((fr) => fr.requester_id === profileId || fr.addressee_id === profileId)
    if (!f) return null
    if (f.status === 'accepted') return 'Berteman'
    if (f.requester_id === userId) return 'Menunggu'
    return 'Minta Berteman'
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Komunitas</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Warga Hinggil Mansion
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {pendingReceived.length > 0 ? (
          <div
            className="mb-6 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(212,175,106,0.12)', border: '1px solid rgba(212,175,106,0.35)' }}
          >
            <span className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>
              {pendingReceived.length} permintaan pertemanan menunggu konfirmasi kamu
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5">
          {(allProfiles ?? []).map((p: any) => {
            const label = friendLabel(p.id)
            return (
              <Link
                key={p.id}
                href={`/warga/${p.id}`}
                className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: '#e8e2d0' }}
                >
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatar_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>{(p.full_name ?? '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.full_name ?? 'Warga'}</div>
                  <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                    {p.house?.nomor_rumah ? `Rumah ${p.house.nomor_rumah}` : 'Belum ada rumah'}
                  </div>
                </div>
                {label ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: label === 'Berteman' ? 'rgba(47,138,79,0.12)' : 'rgba(212,175,106,0.18)',
                      color: label === 'Berteman' ? '#2f8a4f' : '#9c7a3f',
                    }}
                  >
                    {label}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}

```

### components\admin\AdminAccountPanel.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#5b543f' }

type RoleOption = { value: string; label: string }

export default function AdminAccountPanel({
  title,
  roleOptions,
  createAction,
}: {
  title: string
  roleOptions: RoleOption[]
  createAction: (prevState: { error: string; success: boolean }, formData: FormData) => Promise<{ error: string; success: boolean }>
}) {
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createAction({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      router.refresh()
      const form = document.getElementById('admin-account-panel-form') as HTMLFormElement | null
      form?.reset()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#1a1305' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{title}</span>
      </div>

      <form id="admin-account-panel-form" action={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Nama Lengkap</label>
          <input type="text" name="full_name" required style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Email</label>
          <input type="email" name="email" required style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Password Sementara</label>
          <input type="text" name="password" required minLength={6} placeholder="Minimal 6 karakter" style={inputStyle} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Role</label>
          <select name="role" required style={inputStyle}>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {error ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Membuat Akun...' : '+ Buat Akun'}
        </button>

        <p className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
          Beritahukan password ini ke orang yang bersangkutan secara langsung/pribadi.
        </p>
      </form>
    </div>
  )
}

```

### components\admin\AdminAccountTable.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Account = { id: string; full_name: string; role: string; created_at: string }
type RoleOption = { value: string; label: string }

const inputStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '9px',
  padding: '7px 10px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function AdminAccountTable({
  accounts,
  roleOptions,
  updateAction,
  deleteAction,
}: {
  accounts: Account[]
  roleOptions: RoleOption[]
  updateAction: (id: string, fullName: string, role: string) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [isPending, startTransition] = useTransition()

  function startEdit(a: Account) {
    setEditingId(a.id)
    setName(a.full_name)
    setRole(a.role)
  }

  function handleSave(id: string) {
    startTransition(async () => {
      await updateAction(id, name, role)
      router.refresh()
      setEditingId(null)
    })
  }

  function handleDelete(id: string, fullName: string) {
    if (!confirm(`Hapus akun ${fullName}? Tindakan ini permanen.`)) return
    startTransition(async () => {
      await deleteAction(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Role</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada akun.
              </td>
            </tr>
          ) : (
            accounts.map((a) => {
              const roleLabel = roleOptions.find((r) => r.value === a.role)?.label ?? a.role
              const isEditing = editingId === a.id
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                    ) : (
                      <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {isEditing ? (
                      <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                        {roleOptions.map((r) => (
                          <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(212,175,106,0.16)', color: '#9c7a3f' }}
                      >
                        {roleLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: '#f2f1ec', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSave(a.id)}
                          className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                          style={{ background: '#1a1305', color: '#e6c98a' }}
                        >
                          {isPending ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => startEdit(a)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(a.id, a.full_name)}
                          className="text-[12px] font-bold"
                          style={{ color: '#b3392f' }}
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

```

### components\admin\AdminLayout.tsx
```
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from '@/components/NotificationBell'

export type AdminNavItem = { title: string; href: string }

export default function AdminLayout({
  portalLabel,
  roleLabel,
  userName,
  navItems,
  children,
}: {
  portalLabel: string
  roleLabel: string
  userName: string
  navItems: AdminNavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex min-h-screen w-full" style={{ background: '#f2f1ec' }}>
      <aside
        className="hidden w-64 flex-shrink-0 flex-col md:flex"
        style={{ background: '#0a0b0f', borderRight: '1px solid rgba(230,201,138,0.12)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '1px solid rgba(230,201,138,0.1)' }}>
          <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={34} height={34} className="rounded-lg object-cover" />
          <div>
            <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
              {portalLabel}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{roleLabel}</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                style={{
                  background: active ? 'rgba(212,175,106,0.16)' : 'transparent',
                  color: active ? '#e6c98a' : '#c7c9d2',
                }}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(230,201,138,0.1)' }}>
          <Link
            href="/dashboard"
            className="block rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition"
            style={{ color: '#6b6552' }}
          >
            ← Beranda Warga
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header
          className="flex items-center justify-between px-6 py-4 md:px-9"
          style={{ background: '#ffffff', borderBottom: '1px solid rgba(26,19,5,0.08)' }}
        >
          <div>
            <div className="text-[11.5px] font-semibold capitalize" style={{ color: '#9c7a3f' }}>{today}</div>
            <div className="text-lg font-bold md:text-xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Halo, {userName}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ color: '#1f1a10' }}>
              <NotificationBell />
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold"
              style={{ background: '#1a1305', color: '#e6c98a' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-7 md:px-9 md:py-9">{children}</main>
      </div>
    </div>
  )
}

```

### components\admin\ComplaintAdminTable.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateComplaintStatus } from '@/app/pengaduan/actions'

type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
  house?: { nomor_rumah: string } | null
  creator?: { full_name: string } | null
}

const STATUS_OPTIONS = ['baru', 'diproses', 'selesai']

const CATEGORY_LABEL: Record<string, string> = {
  kebersihan: 'Kebersihan',
  keamanan: 'Keamanan',
  fasilitas: 'Fasilitas',
  lainnya: 'Lainnya',
}

const selectStyle: React.CSSProperties = {
  background: '#f2f1ec',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '9px',
  padding: '6px 9px',
  color: '#1f1a10',
  fontSize: '12.5px',
  fontFamily: 'inherit',
  outline: 'none',
}

export default function ComplaintAdminTable({ complaints }: { complaints: Complaint[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateComplaintStatus(id, status)
      router.refresh()
    })
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Belum ada pengaduan masuk.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {complaints.map((c) => (
        <div key={c.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div>
              <span
                className="mr-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'rgba(212,175,106,0.14)', color: '#9c7a3f' }}
              >
                {CATEGORY_LABEL[c.category] ?? c.category}
              </span>
              <span className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{c.title}</span>
            </div>
            <select
              value={c.status}
              disabled={isPending}
              onChange={(e) => handleStatusChange(c.id, e.target.value)}
              style={selectStyle}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} style={{ color: '#1a1305' }}>
                  {s === 'baru' ? 'Baru' : s === 'diproses' ? 'Diproses' : 'Selesai'}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[13px]" style={{ color: '#5b543f' }}>{c.description}</p>
          <div className="mt-2 text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
            {c.creator?.full_name ?? 'Warga'} {c.house?.nomor_rumah ? `· Rumah ${c.house.nomor_rumah}` : ''} ·{' '}
            {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\admin\ErrorLogTable.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { resolveErrorLog } from '@/app/it-support/actions'

type ErrorLog = {
  id: string
  level: string
  module: string
  message: string
  resolved: boolean
  created_at: string
}

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  error: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f' },
  warning: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f' },
  info: { bg: 'rgba(168,200,240,0.3)', text: '#3a5a8a' },
}

export default function ErrorLogTable({ logs }: { logs: ErrorLog[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveErrorLog(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#0a0b0f' }}>
      {logs.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#6b6552' }}>
          Belum ada log error.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 p-4">
          {logs.map((log) => {
            const style = LEVEL_STYLE[log.level] ?? LEVEL_STYLE.error
            return (
              <div key={log.id} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {log.level}
                    </span>
                    <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{log.module}</span>
                  </div>
                  {log.resolved ? (
                    <span className="text-[11px] font-bold" style={{ color: '#2f6b4f' }}>Selesai</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleResolve(log.id)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-bold"
                      style={{ background: '#e6c98a', color: '#1a1305' }}
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
                <p className="font-mono text-[12.5px]" style={{ color: '#e6e8ee' }}>{log.message}</p>
                <span className="mt-1 block text-[11px] font-medium" style={{ color: '#6b6552' }}>
                  {new Date(log.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

```

### components\admin\GuestLogTable.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { checkOutGuest } from '@/app/keamanan/scan-tamu/actions'

type GuestVisit = {
  id: string
  guest_name: string
  purpose: string
  visit_code: string
  status: string
  created_at: string
  checked_in_at: string | null
  checked_out_at: string | null
  house?: { nomor_rumah: string } | null
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Menunggu' },
  masuk: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Di Dalam' },
  keluar: { bg: 'rgba(107,101,82,0.14)', text: '#6b6552', label: 'Sudah Keluar' },
  dibatalkan: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Dibatalkan' },
}

export default function GuestLogTable({ guests }: { guests: GuestVisit[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCheckOut(id: string) {
    startTransition(async () => {
      await checkOutGuest(id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(26,19,5,0.08)' }}>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Nama Tamu</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah</th>
            <th className="px-5 py-3 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Status</th>
            <th className="px-5 py-3 text-right text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada log tamu.
              </td>
            </tr>
          ) : (
            guests.map((g) => {
              const statusStyle = STATUS_STYLE[g.status] ?? STATUS_STYLE.menunggu
              return (
                <tr key={g.id} style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
                  <td className="px-5 py-3.5">
                    <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{g.guest_name}</div>
                    <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>Kode: {g.visit_code}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                    {g.house?.nomor_rumah ?? '-'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                      style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {g.status === 'masuk' ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCheckOut(g.id)}
                        className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                        style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
                      >
                        Keluar
                      </button>
                    ) : (
                      <span className="text-[12px] font-medium" style={{ color: '#9c7a3f' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

```

### components\admin\ModerasiForumTable.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reactivatePost, deletePostPermanently } from '@/app/paguyuban/moderasi-forum/actions'

type HiddenPost = {
  id: string
  content: string
  author_name: string
  report_count: number
  created_at: string
}

export default function ModerasiForumTable({ posts }: { posts: HiddenPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReactivate(id: string) {
    startTransition(async () => {
      await reactivatePost(id)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus postingan ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return
    startTransition(async () => {
      await deletePostPermanently(id)
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Tidak ada postingan yang disembunyikan.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {posts.map((p) => (
        <div key={p.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.author_name}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: '#f2b8b0', color: '#7a231b' }}
                >
                  {p.report_count} laporan
                </span>
              </div>
              <p className="mt-1.5 text-[13px]" style={{ color: '#5b543f' }}>{p.content}</p>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(p.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Hapus Permanen
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReactivate(p.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#1a1305', color: '#e6c98a' }}
              >
                Aktifkan Kembali
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\admin\StatCard.tsx
```
export default function StatCard({
  label,
  value,
  caption,
  iconBg,
  iconPath,
  badge,
}: {
  label: string
  value: string | number
  caption?: string
  iconBg: string
  iconPath: string
  badge?: string
}) {
  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: iconBg }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1305" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPath} />
          </svg>
        </div>
        {badge ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(179,57,47,0.12)', color: '#b3392f' }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>{value}</div>
      {caption ? <div className="mt-1 text-[12px] font-medium" style={{ color: '#5b543f' }}>{caption}</div> : null}
    </div>
  )
}

```

### components\admin\TukangKelolaTable.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveTukang, rejectTukang } from '@/app/tukang/actions'

type PendingTukang = {
  id: string
  name: string
  specialty: string
  phone: string
  description: string | null
  created_at: string
  submitter_name: string
}

export default function TukangKelolaTable({ items }: { items: PendingTukang[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveTukang(id)
      router.refresh()
    })
  }

  function handleReject(id: string) {
    if (!confirm('Tolak pendaftaran tukang ini?')) return
    startTransition(async () => {
      await rejectTukang(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Tidak ada tukang yang menunggu verifikasi.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</div>
              <div className="text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>{t.specialty} · {t.phone}</div>
              {t.description ? <p className="mt-1.5 text-[13px]" style={{ color: '#5b543f' }}>{t.description}</p> : null}
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                Diajukan oleh {t.submitter_name} ·{' '}
                {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReject(t.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Tolak
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleApprove(t.id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#1a1305', color: '#e6c98a' }}
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\AdminAccountForm.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

type RoleOption = { value: string; label: string }

export default function AdminAccountForm({
  roleOptions,
  createAction,
  buttonLabel,
}: {
  roleOptions: RoleOption[]
  createAction: (prevState: { error: string; success: boolean }, formData: FormData) => Promise<{ error: string; success: boolean }>
  buttonLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createAction({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      router.refresh()
      setOpen(false)
    } else {
      setError(result.error)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        {buttonLabel}
      </button>
    )
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Lengkap</label>
        <input type="text" name="full_name" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Email</label>
        <input type="email" name="email" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Password Sementara</label>
        <input type="text" name="password" required minLength={6} placeholder="Minimal 6 karakter" style={inputStyle} />
        <p className="text-[11px] font-medium" style={{ color: '#9c7a3f' }}>
          Beritahukan password ini ke orang yang bersangkutan secara langsung/pribadi.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Role</label>
        <select name="role" required style={inputStyle}>
          {roleOptions.map((r) => (
            <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Membuat...' : 'Buat Akun'}
        </button>
      </div>
    </form>
  )
}

```

### components\AdminAccountList.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Account = { id: string; full_name: string; role: string; created_at: string }
type RoleOption = { value: string; label: string }

const inputStyle: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '10px',
  padding: '9px 11px',
  color: '#1f1a10',
  fontSize: '13px',
  fontFamily: 'inherit',
  width: '100%',
  outline: 'none',
}

export default function AdminAccountList({
  accounts,
  roleOptions,
  updateAction,
  deleteAction,
}: {
  accounts: Account[]
  roleOptions: RoleOption[]
  updateAction: (id: string, fullName: string, role: string) => Promise<{ error: string | null }>
  deleteAction: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [isPending, startTransition] = useTransition()

  function startEdit(a: Account) {
    setEditingId(a.id)
    setName(a.full_name)
    setRole(a.role)
  }

  function handleSave(id: string) {
    startTransition(async () => {
      await updateAction(id, name, role)
      router.refresh()
      setEditingId(null)
    })
  }

  function handleDelete(id: string, fullName: string) {
    if (!confirm(`Hapus akun ${fullName}? Tindakan ini permanen.`)) return
    startTransition(async () => {
      await deleteAction(id)
      router.refresh()
    })
  }

  if (accounts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada akun.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {accounts.map((a) => {
        const roleLabel = roleOptions.find((r) => r.value === a.role)?.label ?? a.role
        return (
          <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            {editingId === a.id ? (
              <div className="flex flex-col gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                <select value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle}>
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value} style={{ color: '#1a1305' }}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                    style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSave(a.id)}
                    className="flex-1 rounded-lg py-2 text-[12.5px] font-bold"
                    style={{ background: '#1a1305', color: '#f5f3ee' }}
                  >
                    {isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{a.full_name}</div>
                  <span
                    className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => startEdit(a)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(a.id, a.full_name)}
                    className="text-[12px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

```

### components\AnggaranForm.tsx
```
'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction, type AddTransactionState } from '@/app/anggaran/actions'

const initialState: AddTransactionState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export default function AnggaranForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: AddTransactionState, formData: FormData) => {
    const result = await addTransaction(prev, formData)
    if (result.success) {
      router.refresh()
    }
    return result
  }, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Tambah Transaksi
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Jenis</label>
        <select name="type" defaultValue="pemasukan" required style={inputStyle}>
          <option value="pemasukan" style={{ color: '#1a1305' }}>Pemasukan</option>
          <option value="pengeluaran" style={{ color: '#1a1305' }}>Pengeluaran</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Kategori</label>
        <input type="text" name="category" required placeholder="Iuran Bulanan, Kebersihan, Perbaikan, dll" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nominal (Rp)</label>
        <input type="number" name="amount" required min="1" step="1" placeholder="500000" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Tanggal</label>
        <input type="date" name="transaction_date" required defaultValue={new Date().toISOString().slice(0, 10)} style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keterangan (opsional)</label>
        <textarea name="description" rows={2} placeholder="Detail transaksi..." style={inputStyle} />
      </div>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}
      {state.success ? <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>Transaksi berhasil ditambahkan.</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Tutup
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

```

### components\AnggaranList.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '@/app/anggaran/actions'

type Trx = {
  id: string
  type: string
  category: string
  amount: number
  description: string | null
  transaction_date: string
  author_name: string
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function AnggaranList({ transactions, canManage }: { transactions: Trx[]; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Hapus transaksi ini?')) return
    startTransition(async () => {
      await deleteTransaction(id)
      router.refresh()
    })
  }

  if (transactions.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada transaksi tercatat.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {transactions.map((t) => {
        const isIncome = t.type === 'pemasukan'
        return (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.category}</div>
              <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}
                {t.author_name}
              </div>
              {t.description ? (
                <div className="mt-1 text-[12px] font-medium" style={{ color: '#5b543f' }}>{t.description}</div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold" style={{ color: isIncome ? '#2f8a4f' : '#b3392f' }}>
                {isIncome ? '+' : '-'} {formatRupiah(t.amount)}
              </span>
              {canManage ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(t.id)}
                  style={{ color: '#b3392f' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

```

### components\AnnouncementForm.tsx
```
'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createAnnouncement } from '@/app/pengumuman/actions'

export default function AnnouncementForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createAnnouncement(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      formRef.current?.reset()
      setOpen(false)
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-5 w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition"
        style={{ background: '#1a1305', color: '#e6c98a' }}
      >
        + Buat Pengumuman Baru
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-5 flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Pengumuman Baru</div>

      <input
        name="title"
        type="text"
        required
        placeholder="Judul pengumuman"
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
        style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
      />

      <textarea
        name="content"
        required
        rows={4}
        placeholder="Isi pengumuman"
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
        style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
      />

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#1a1305', color: '#e6c98a' }}
        >
          {isPending ? 'Mengirim...' : 'Kirim ke Semua Warga'}
        </button>
      </div>
    </form>
  )
}

```

### components\AnnouncementList.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAnnouncement } from '@/app/pengumuman/actions'

type Announcement = {
  id: string
  title: string
  content: string
  created_at: string
  author_name: string
}

export default function AnnouncementList({ items, canManage }: { items: Announcement[]; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    if (!confirm('Hapus pengumuman ini?')) return
    startTransition(async () => {
      await deleteAnnouncement(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl px-5 py-8 text-center text-sm font-medium" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', color: '#5b543f' }}>
        Belum ada pengumuman.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((a) => (
        <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{a.title}</div>
              <p className="mt-1.5 whitespace-pre-wrap text-[13px]" style={{ color: '#5b543f' }}>{a.content}</p>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                {a.author_name} ·{' '}
                {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            {canManage ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(a.id)}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold"
                style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.2)' }}
              >
                Hapus
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\AppFooter.tsx
```
import Image from 'next/image'

export default function AppFooter() {
  return (
    <footer
      className="mt-auto px-4 py-5 text-center text-xs"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6d6f7a' }}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Dikembangkan oleh</span>
        <Image
          src="/logo-skuy-creative.png"
          alt="SKUY Creative Agency"
          width={16}
          height={16}
          className="rounded"
        />
        <span style={{ color: '#9a9ca8', fontWeight: 600 }}>SKUY Creative Agency</span>
      </div>
    </footer>
  )
}

```

### components\AppHeader.tsx
```
import Image from 'next/image'
import Link from 'next/link'

export default function AppHeader() {
  return (
    <header
      className="w-full"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0b0f' }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span
            className="text-sm font-bold tracking-wide md:text-base"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
          >
            HINGGIL MANSION
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold md:gap-7 md:text-base">
          <Link href="/faq" style={{ color: '#c7c9d2' }}>
            FAQ
          </Link>
          <Link href="/syarat-ketentuan" style={{ color: '#c7c9d2' }}>
            Syarat &amp; Ketentuan
          </Link>
        </nav>
      </div>
    </header>
  )
}

```

### components\AppNavbar.tsx
```
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

const sidebarLinks = [
  { title: 'Beranda', href: '/dashboard' },
  { title: 'Forum Warga', href: '/forum' },
  { title: 'Warga & Teman', href: '/warga' },
  { title: 'Pesan', href: '/chat' },
  { title: 'Pengaduan', href: '/pengaduan' },
  { title: 'Anggaran & Iuran', href: '/anggaran' },
  { title: 'Polling Warga', href: '/polling' },
  { title: 'Katalog Tukang', href: '/tukang' },
]

const roleLinks = [
  { title: 'Dashboard Security', href: '/security', roles: ['security', 'superadmin'] },
  { title: 'Verifikasi Tamu', href: '/keamanan/scan-tamu', roles: ['security', 'superadmin'] },
  { title: 'Status Rumah Kosong', href: '/rumah-kosong', roles: ['security', 'paguyuban', 'superadmin'] },
  { title: 'Dashboard Paguyuban', href: '/paguyuban', roles: ['paguyuban', 'superadmin'] },
  { title: 'Moderasi Forum', href: '/paguyuban/moderasi-forum', roles: ['paguyuban', 'superadmin'] },
  { title: 'Dashboard Manajemen', href: '/manajemen', roles: ['manajemen', 'superadmin'] },
  { title: 'Kelola Katalog Tukang', href: '/tukang/kelola', roles: ['manajemen', 'superadmin'] },
  { title: 'Kelola Staff', href: '/paguyuban/kelola-staff', roles: ['paguyuban', 'superadmin'] },
  { title: 'Kelola Admin', href: '/superadmin', roles: ['superadmin'] },
  { title: 'Error Logs (IT Support)', href: '/it-support', roles: ['it_support', 'superadmin'] },
]

const quickIcons = [
  {
    title: 'Darurat',
    href: '/darurat',
    danger: true,
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    href: '/qr-tamu',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
  {
    title: 'Profil',
    href: '/profile',
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

export default function AppNavbar() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user)
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
        setRole(profile?.role ?? null)
      }
    })
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!loggedIn) return null

  const visibleRoleLinks = roleLinks.filter((l) => role && l.roles.includes(role))

  return (
    <>
      <div
        className="sticky top-0 z-40 w-full"
        style={{ background: '#0a0b0f', borderBottom: '1px solid rgba(230,201,138,0.15)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4 py-2.5 md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ color: '#e6c98a' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link href="/dashboard" className="mr-auto flex flex-shrink-0 items-center gap-2">
            <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={24} height={24} className="rounded-md object-cover" />
          </Link>

          <div className="flex flex-shrink-0 items-center gap-1">
            {quickIcons.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.title}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={{
                    background: item.danger ? '#b3392f' : active ? 'rgba(212,175,106,0.18)' : 'transparent',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={item.danger ? '#ffffff' : active ? '#e6c98a' : '#c7c9d2'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.path} />
                  </svg>
                </Link>
              )
            })}
          </div>

          <div className="flex-shrink-0" style={{ color: '#efe4c8' }}>
            <NotificationBell />
          </div>
        </div>
      </div>

      {sidebarOpen ? (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(10,11,15,0.55)' }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: 260,
              zIndex: 50,
              background: '#0a0b0f',
              borderRight: '1px solid rgba(230,201,138,0.15)',
              overflowY: 'auto',
            }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(230,201,138,0.12)' }}>
              <div className="flex items-center gap-2">
                <Image src="/logo-hinggil-mansion.jpg" alt="Hinggil Mansion" width={26} height={26} className="rounded-md object-cover" />
                <span className="text-[12.5px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}>
                  HINGGIL MANSION
                </span>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} style={{ color: '#c7c9d2' }} aria-label="Tutup menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-0.5 px-3 py-3">
              {sidebarLinks.map((l) => {
                const active = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                    style={{ background: active ? 'rgba(212,175,106,0.14)' : 'transparent', color: active ? '#e6c98a' : '#c7c9d2' }}
                  >
                    {l.title}
                  </Link>
                )
              })}

              {visibleRoleLinks.length > 0 ? (
                <>
                  <div className="mt-3 mb-1 px-3.5 text-[10.5px] font-bold uppercase tracking-widest" style={{ color: '#6b6552' }}>
                    Khusus Admin
                  </div>
                  {visibleRoleLinks.map((l) => {
                    const active = pathname === l.href
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition"
                        style={{ background: active ? 'rgba(212,175,106,0.14)' : 'transparent', color: active ? '#e6c98a' : '#c7c9d2' }}
                      >
                        {l.title}
                      </Link>
                    )
                  })}
                </>
              ) : null}
            </nav>
          </div>
        </>
      ) : null}
    </>
  )
}

```

### components\AvatarUploader.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AvatarUploader({
  userId,
  currentAvatarUrl,
}: {
  userId: string
  currentAvatarUrl: string | null
}) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('File harus berformat JPG atau PNG.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB.')
      return
    }
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    startTransition(async () => {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError(`Gagal upload: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)

      if (updateError) {
        setError(`Gagal simpan ke profil: ${updateError.message}`)
        return
      }

      setPreview(avatarUrl)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Foto profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground">
            Belum ada foto
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Ganti Foto Profil (JPG/PNG, maks 2MB)</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={isPending}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isPending && <p className="text-sm text-muted-foreground">Mengunggah...</p>}
    </div>
  )
}

```

### components\ChatThread.tsx
```
'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markMessagesRead } from '@/app/chat/actions'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ChatThread({ myId, friendId, friendName }: { myId: string; friendId: string; friendName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('chat_messages')
      .select('id, sender_id, content, created_at')
      .or(
        `and(sender_id.eq.${myId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${myId})`
      )
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) setMessages(data)
  }

  useEffect(() => {
    load()
    markMessagesRead(friendId)
    const interval = setInterval(load, 4000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSend() {
    const content = text.trim()
    if (!content) return
    setText('')
    startTransition(async () => {
      await sendMessage(friendId, content)
      await load()
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-[12.5px] font-medium" style={{ color: '#9c7a3f' }}>
            Mulai obrolan dengan {friendName}
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === myId
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div
                  className="max-w-[75%] rounded-2xl px-4 py-2.5 text-[13.5px] font-medium"
                  style={{
                    background: isMine ? '#1a1305' : '#ffffff',
                    color: isMine ? '#f5f3ee' : '#1f1a10',
                    border: isMine ? 'none' : '1px solid rgba(26,19,5,0.08)',
                    borderBottomRightRadius: isMine ? 4 : 16,
                    borderBottomLeftRadius: isMine ? 16 : 4,
                  }}
                >
                  {m.content}
                  <div
                    className="mt-1 text-[10px] font-semibold"
                    style={{ color: isMine ? 'rgba(245,243,238,0.55)' : '#9c7a3f', textAlign: 'right' }}
                  >
                    {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2.5 border-t px-4 py-3" style={{ borderColor: 'rgba(26,19,5,0.08)', background: '#faf7f0' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Tulis pesan..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', outline: 'none' }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: '#1a1305', opacity: isPending || !text.trim() ? 0.5 : 1 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  )
}

```

### components\ComplaintForm.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createComplaint } from '@/app/pengaduan/actions'

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

const CATEGORY_OPTIONS = [
  { value: 'kebersihan', label: 'Kebersihan' },
  { value: 'keamanan', label: 'Keamanan' },
  { value: 'fasilitas', label: 'Fasilitas' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function ComplaintForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createComplaint({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      router.refresh()
      setOpen(false)
    } else {
      setError(result.error)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Buat Pengaduan Baru
      </button>
    )
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Kategori</label>
        <select name="category" required style={inputStyle}>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value} style={{ color: '#1a1305' }}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Judul</label>
        <input type="text" name="title" required placeholder="Contoh: Lampu jalan Blok C mati" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Detail Pengaduan</label>
        <textarea name="description" required rows={4} placeholder="Jelaskan kejadian atau keluhannya" style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Mengirim...' : 'Kirim Pengaduan'}
        </button>
      </div>
    </form>
  )
}

```

### components\ComplaintItem.tsx
```
type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  created_at: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  baru: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Baru' },
  diproses: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Diproses' },
  selesai: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Selesai' },
}

const CATEGORY_LABEL: Record<string, string> = {
  kebersihan: 'Kebersihan',
  keamanan: 'Keamanan',
  fasilitas: 'Fasilitas',
  lainnya: 'Lainnya',
}

export default function ComplaintItem({ item }: { item: Complaint }) {
  const statusStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.baru

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-1.5">
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(212,175,106,0.14)', color: '#9c7a3f' }}
          >
            {CATEGORY_LABEL[item.category] ?? item.category}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: statusStyle.bg, color: statusStyle.text }}
          >
            {statusStyle.label}
          </span>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{item.title}</div>
      <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>{item.description}</p>
    </div>
  )
}

```

### components\EmergencyPanel.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { triggerEmergency, resolveEmergency } from '@/app/darurat/actions'

type Alert = {
  id: string
  message: string | null
  status: string
  created_at: string
  created_by: string
  house?: { nomor_rumah: string } | null
  creator?: { full_name: string } | null
}

export default function EmergencyPanel({
  alerts,
  canResolve,
  currentUserId,
}: {
  alerts: Alert[]
  canResolve: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const activeAlerts = alerts.filter((a) => a.status === 'aktif')
  const myActiveAlert = activeAlerts.find((a) => a.created_by === currentUserId)

  function handleTrigger() {
    const formData = new FormData()
    formData.set('message', message)
    startTransition(async () => {
      const result = await triggerEmergency({ error: '', success: false }, formData)
      if (result.success) {
        setSent(true)
        setConfirmOpen(false)
        setMessage('')
        router.refresh()
      }
    })
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveEmergency(id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {myActiveAlert ? (
        <div className="rounded-2xl px-5 py-5 text-center" style={{ background: 'rgba(179,57,47,0.1)', border: '1px solid rgba(179,57,47,0.3)' }}>
          <span className="text-sm font-bold" style={{ color: '#b3392f' }}>
            Alert darurat kamu sedang aktif. Security & Pengurus sudah diberitahu.
          </span>
        </div>
      ) : !confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl transition hover:opacity-90"
          style={{ background: '#b3392f' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-lg font-bold text-white">TEKAN JIKA DARURAT</span>
        </button>
      ) : (
        <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.3)' }}>
          <p className="mb-3 text-sm font-bold" style={{ color: '#b3392f' }}>
            Yakin ingin mengirim alert darurat? Security dan Pengurus akan langsung diberitahu.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Jelaskan situasi singkat (opsional)"
            rows={3}
            className="mb-3 w-full"
            style={{
              background: '#faf7f0',
              border: '1px solid rgba(26,19,5,0.12)',
              borderRadius: '11px',
              padding: '11px 13px',
              color: '#1f1a10',
              fontSize: '13.5px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleTrigger}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: '#b3392f', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Mengirim...' : 'Kirim Alert Darurat'}
            </button>
          </div>
        </div>
      )}

      {canResolve ? (
        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Alert Aktif ({activeAlerts.length})
          </div>
          {activeAlerts.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {activeAlerts.map((a) => (
                <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.25)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                        {a.creator?.full_name ?? 'Warga'} {a.house?.nomor_rumah ? `· Rumah ${a.house.nomor_rumah}` : ''}
                      </div>
                      {a.message ? <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>{a.message}</p> : null}
                      <span className="mt-1 block text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                        {new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleResolve(a.id)}
                      className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                      style={{ background: '#1a1305', color: '#e6c98a' }}
                    >
                      Tandai Selesai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada alert darurat aktif saat ini.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

```

### components\FaqAccordion.tsx
```
'use client'

import { useState } from 'react'

type FaqItem = {
  id: string
  question: string
  answer: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
            style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="text-[15px] font-bold md:text-lg" style={{ color: '#1f1a10' }}>
                {item.question}
              </span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1305"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {isOpen ? (
              <p
                className="mt-3 text-sm font-medium leading-relaxed md:text-base"
                style={{ color: '#5b543f' }}
              >
                {item.answer}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

```

### components\ForumFeed.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike, addComment, reportPost } from '@/app/forum/actions'

type Comment = {
  id: string
  content: string
  created_at: string
  author_name: string
}

type Post = {
  id: string
  content: string
  created_at: string
  author_name: string
  likeCount: number
  likedByMe: boolean
  comments: Comment[]
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j`
  const days = Math.floor(hours / 24)
  return `${days}h`
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  function handleLike() {
    startTransition(async () => {
      await toggleLike(post.id)
      router.refresh()
    })
  }

  function handleReport() {
    if (!confirm('Laporkan postingan ini sebagai tidak pantas?')) return
    startTransition(async () => {
      await reportPost(post.id)
      router.refresh()
    })
  }

  function handleComment() {
    if (!commentText.trim()) return
    startTransition(async () => {
      await addComment(post.id, commentText)
      setCommentText('')
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: '#1a1305', color: '#e6c98a' }}
          >
            {post.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{post.author_name}</div>
            <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        <button type="button" onClick={handleReport} title="Laporkan" style={{ color: '#c7c2b3' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#3a3424' }}>
        {post.content}
      </p>

      <div className="mt-3.5 flex items-center gap-5 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: post.likedByMe ? '#b3392f' : '#8a8c96' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? '#b3392f' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          {post.likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: '#8a8c96' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
          </svg>
          {post.comments.length}
        </button>
      </div>

      {showComments ? (
        <div className="mt-3 flex flex-col gap-2.5 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-xl px-3.5 py-2.5" style={{ background: '#faf7f0' }}>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{c.author_name}</span>
                <span className="text-[10.5px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] font-medium" style={{ color: '#3a3424' }}>{c.content}</p>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 rounded-full px-4 py-2 text-[13px]"
              style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={isPending}
              className="rounded-full px-4 py-2 text-[13px] font-bold"
              style={{ background: '#1a1305', color: '#f5f3ee' }}
            >
              Kirim
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ForumFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada postingan. Jadilah yang pertama menulis!
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

```

### components\ForumPostForm.tsx
```
'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createForumPost, type ForumPostState } from '@/app/forum/actions'

const initialState: ForumPostState = { error: '' }

export default function ForumPostForm() {
  const [state, formAction, isPending] = useActionState(createForumPost, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isPending && !state.error) {
      formRef.current?.reset()
    }
  }, [isPending, state.error])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-6 flex flex-col gap-2.5 rounded-2xl px-4 py-4 md:px-5 md:py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <textarea
        name="content"
        rows={3}
        required
        placeholder="Tulis sesuatu untuk warga lain..."
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: '#faf7f0',
          border: '1px solid rgba(26,19,5,0.1)',
          color: '#1f1a10',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />
      {state.error ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-full px-6 py-2.5 text-sm font-bold"
        style={{
          border: 'none',
          background: '#1a1305',
          color: '#f5f3ee',
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? 'default' : 'pointer',
        }}
      >
        {isPending ? 'Mengirim...' : 'Kirim'}
      </button>
    </form>
  )
}

```

### components\FriendActionButton.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from '@/app/warga/actions'

type FriendState = {
  status: 'none' | 'pending_sent' | 'pending_received' | 'accepted'
  friendshipId: string | null
}

export default function FriendActionButton({ targetUserId, state }: { targetUserId: string; state: FriendState }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    startTransition(async () => {
      await sendFriendRequest(targetUserId)
      router.refresh()
    })
  }

  function handleAccept() {
    if (!state.friendshipId) return
    startTransition(async () => {
      await acceptFriendRequest(state.friendshipId!)
      router.refresh()
    })
  }

  function handleReject() {
    if (!state.friendshipId) return
    startTransition(async () => {
      await rejectFriendRequest(state.friendshipId!)
      router.refresh()
    })
  }

  if (state.status === 'accepted') {
    return (
      <div className="flex gap-2.5">
        <Link
          href={`/chat/${targetUserId}`}
          className="flex-1 rounded-xl py-2.5 text-center text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee' }}
        >
          Chat
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={handleReject}
          className="rounded-xl px-4 py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}
        >
          Hapus Teman
        </button>
      </div>
    )
  }

  if (state.status === 'pending_sent') {
    return (
      <button type="button" disabled className="w-full rounded-xl py-2.5 text-sm font-bold" style={{ background: '#faf7f0', color: '#9c7a3f', border: '1px solid rgba(26,19,5,0.12)' }}>
        Menunggu Konfirmasi
      </button>
    )
  }

  if (state.status === 'pending_received') {
    return (
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleAccept}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold"
          style={{ background: '#2f8a4f', color: '#ffffff' }}
        >
          Terima
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleReject}
          className="flex-1 rounded-xl py-2.5 text-sm font-bold"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Tolak
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleAdd}
      className="w-full rounded-xl py-2.5 text-sm font-bold transition hover:opacity-90"
      style={{ background: '#1a1305', color: '#f5f3ee' }}
    >
      + Tambah Teman
    </button>
  )
}

```

### components\GuestInviteForm.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGuestVisit } from '@/app/qr-tamu/actions'

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

const PURPOSE_OPTIONS = [
  { value: 'keluarga', label: 'Keluarga / Kerabat' },
  { value: 'kurir', label: 'Kurir / Ojek Online' },
  { value: 'tukang', label: 'Tukang / Jasa' },
  { value: 'delivery', label: 'Delivery / Pengantaran' },
  { value: 'lainnya', label: 'Lainnya' },
]

export default function GuestInviteForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    const result = await createGuestVisit({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      setGeneratedCode(result.code ?? null)
      router.refresh()
    } else {
      setError(result.error)
    }
  }

  if (generatedCode) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl px-5 py-7 text-center" style={{ background: '#1a1305' }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Kode Tamu</span>
        <span className="text-4xl font-bold tracking-[0.3em]" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#e6c98a' }}>
          {generatedCode}
        </span>
        <p className="text-[12.5px] font-medium" style={{ color: '#c7c9d2' }}>
          Berikan kode ini ke tamu. Tunjukkan ke Security saat tiba di gerbang.
        </p>
        <button
          type="button"
          onClick={() => {
            setGeneratedCode(null)
            setOpen(false)
          }}
          className="mt-1 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ background: '#e6c98a', color: '#1a1305' }}
        >
          Selesai
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Undang Tamu Baru
      </button>
    )
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Tamu</label>
        <input type="text" name="guest_name" required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP Tamu (opsional)</label>
        <input type="tel" name="guest_phone" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keperluan</label>
        <select name="purpose" required style={inputStyle}>
          {PURPOSE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value} style={{ color: '#1a1305' }}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Membuat Kode...' : 'Buat Kode Tamu'}
        </button>
      </div>
    </form>
  )
}

```

### components\GuestVisitItem.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelGuestVisit } from '@/app/qr-tamu/actions'

type GuestVisit = {
  id: string
  guest_name: string
  purpose: string
  visit_code: string
  status: string
  created_at: string
  checked_in_at: string | null
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: 'rgba(212,175,106,0.18)', text: '#9c7a3f', label: 'Menunggu' },
  masuk: { bg: 'rgba(74,140,110,0.16)', text: '#2f6b4f', label: 'Di Dalam' },
  keluar: { bg: 'rgba(107,101,82,0.14)', text: '#6b6552', label: 'Sudah Keluar' },
  dibatalkan: { bg: 'rgba(179,57,47,0.12)', text: '#b3392f', label: 'Dibatalkan' },
}

const PURPOSE_LABEL: Record<string, string> = {
  keluarga: 'Keluarga / Kerabat',
  kurir: 'Kurir / Ojek Online',
  tukang: 'Tukang / Jasa',
  delivery: 'Delivery / Pengantaran',
  lainnya: 'Lainnya',
}

export default function GuestVisitItem({ item }: { item: GuestVisit }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const statusStyle = STATUS_STYLE[item.status] ?? STATUS_STYLE.menunggu

  function handleCancel() {
    if (!confirm(`Batalkan undangan untuk ${item.guest_name}?`)) return
    startTransition(async () => {
      await cancelGuestVisit(item.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: statusStyle.bg, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
        <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
          {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{item.guest_name}</div>
      <p className="mt-0.5 text-[12.5px]" style={{ color: '#5b543f' }}>{PURPOSE_LABEL[item.purpose] ?? item.purpose}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-lg font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#9c7a3f' }}>
          {item.visit_code}
        </span>
        {item.status === 'menunggu' ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="text-[12px] font-bold"
            style={{ color: '#b3392f' }}
          >
            Batalkan
          </button>
        ) : null}
      </div>
    </div>
  )
}

```

### components\ModerasiForumList.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reactivatePost, deletePostPermanently } from '@/app/paguyuban/moderasi-forum/actions'

type HiddenPost = {
  id: string
  content: string
  author_name: string
  report_count: number
  created_at: string
}

export default function ModerasiForumList({ posts }: { posts: HiddenPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleReactivate(id: string) {
    startTransition(async () => {
      await reactivatePost(id)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus postingan ini secara permanen?')) return
    startTransition(async () => {
      await deletePostPermanently(id)
      router.refresh()
    })
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Tidak ada postingan yang perlu direview saat ini.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <div key={p.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.2)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.author_name}</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(179,57,47,0.1)', color: '#b3392f' }}>
              {p.report_count} laporan
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm font-medium" style={{ color: '#3a3424' }}>
            {p.content}
          </p>
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              onClick={() => handleReactivate(p.id)}
              disabled={isPending}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#2f8a4f', color: '#ffffff' }}
            >
              Aktifkan Kembali
            </button>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              disabled={isPending}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#b3392f', color: '#ffffff' }}
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\NotificationBell.tsx
```
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Notif = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  async function load() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notifications')
      .select('id, type, title, body, link, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (data) {
      setNotifs(data)
      setUnread(data.filter((n) => !n.is_read).length)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  async function markAllRead() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  async function markOneRead(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    setUnread((u) => Math.max(0, u - 1))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'relative', color: '#5b543f' }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#b3392f',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              minWidth: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 32,
              width: 320,
              maxHeight: 400,
              overflowY: 'auto',
              background: '#ffffff',
              border: '1px solid rgba(26,19,5,0.1)',
              borderRadius: 14,
              boxShadow: '0 16px 40px -12px rgba(0,0,0,0.25)',
              zIndex: 50,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(26,19,5,0.06)' }}>
              <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>Notifikasi</span>
              {unread > 0 ? (
                <button type="button" onClick={markAllRead} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
                  Tandai semua dibaca
                </button>
              ) : null}
            </div>

            {notifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-[12.5px] font-medium" style={{ color: '#8a8c96' }}>
                Belum ada notifikasi.
              </p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  href={n.link ?? '#'}
                  onClick={() => markOneRead(n.id)}
                  className="block px-4 py-3"
                  style={{
                    borderBottom: '1px solid rgba(26,19,5,0.05)',
                    background: n.is_read ? 'transparent' : 'rgba(212,175,106,0.06)',
                  }}
                >
                  <div className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{n.title}</div>
                  {n.body ? (
                    <div className="mt-0.5 text-[11.5px] font-medium" style={{ color: '#5b543f' }}>{n.body}</div>
                  ) : null}
                </Link>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

```

### components\PollCard.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { votePoll, closePoll } from '@/app/polling/actions'

type Option = { id: string; option_text: string; voteCount: number }
type Poll = {
  id: string
  title: string
  description: string | null
  is_active: boolean
  options: Option[]
  totalVotes: number
  votedOptionId: string | null
}

export default function PollCard({ poll, canManage }: { poll: Poll; canManage: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const hasVoted = !!poll.votedOptionId

  function handleVote(optionId: string) {
    if (hasVoted || !poll.is_active) return
    startTransition(async () => {
      await votePoll(poll.id, optionId)
      router.refresh()
    })
  }

  function handleClose() {
    if (!confirm('Tutup polling ini? Warga tidak bisa vote lagi setelah ditutup.')) return
    startTransition(async () => {
      await closePoll(poll.id)
      router.refresh()
    })
  }

  return (
    <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{poll.title}</div>
          {poll.description ? (
            <div className="mt-1 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{poll.description}</div>
          ) : null}
        </div>
        {!poll.is_active ? (
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(26,19,5,0.08)', color: '#5b543f' }}
          >
            Ditutup
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {poll.options.map((opt) => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0
          const isMine = poll.votedOptionId === opt.id
          const showResult = hasVoted || !poll.is_active

          if (!showResult) {
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isPending}
                onClick={() => handleVote(opt.id)}
                className="rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition hover:opacity-85"
                style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}
              >
                {opt.option_text}
              </button>
            )
          }

          return (
            <div key={opt.id} className="relative overflow-hidden rounded-xl" style={{ border: isMine ? '1px solid #d4af6a' : '1px solid rgba(26,19,5,0.1)' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${pct}%`,
                  background: isMine ? 'rgba(212,175,106,0.25)' : 'rgba(26,19,5,0.06)',
                }}
              />
              <div className="relative flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-semibold" style={{ color: '#1f1a10' }}>
                  {opt.option_text} {isMine ? '✓' : ''}
                </span>
                <span className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>{pct}% ({opt.voteCount})</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{poll.totalVotes} suara</span>
        {canManage && poll.is_active ? (
          <button type="button" onClick={handleClose} disabled={isPending} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>
            Tutup Polling
          </button>
        ) : null}
      </div>
    </div>
  )
}

```

### components\PollCreateForm.tsx
```
'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPoll, type CreatePollState } from '@/app/polling/actions'

const initialState: CreatePollState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export default function PollCreateForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: CreatePollState, formData: FormData) => {
    const result = await createPoll(prev, formData)
    if (result.success) {
      router.refresh()
      setOpen(false)
    }
    return result
  }, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Buat Polling Baru
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Judul Polling</label>
        <input type="text" name="title" required placeholder="Renovasi Pos Satpam?" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Deskripsi (opsional)</label>
        <textarea name="description" rows={2} placeholder="Jelaskan konteks polling..." style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Pilihan Jawaban (satu per baris, minimal 2)</label>
        <textarea name="options" rows={4} required placeholder={'Setuju\nTidak Setuju\nAbstain'} style={inputStyle} />
      </div>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Buat Polling'}
        </button>
      </div>
    </form>
  )
}

```

### components\ProfileEditForm.tsx
```
'use client'

import { useActionState, useState } from 'react'
import { updateProfile, type UpdateProfileState } from '@/app/profile/actions'

const initialState: UpdateProfileState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  paddingRight: '34px',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

function SelectChevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#9c7a3f"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export default function ProfileEditForm({
  fullName,
  phone,
  bio,
  nik,
  familyRole,
  occupancyStatus,
}: {
  fullName: string
  phone: string
  bio: string
  nik: string
  familyRole: string
  occupancyStatus: string
}) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        Edit Profil
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Lengkap</label>
        <input type="text" name="full_name" defaultValue={fullName} required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP</label>
        <input type="text" name="phone" defaultValue={phone} required style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>NIK (wajib, sesuai KTP)</label>
        <input
          type="text"
          name="nik"
          defaultValue={nik}
          required
          maxLength={16}
          minLength={16}
          pattern="\d{16}"
          title="NIK harus 16 digit angka"
          placeholder="16 digit sesuai KTP"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Bio (opsional)</label>
        <textarea name="bio" defaultValue={bio} rows={2} placeholder="Ceritakan sedikit tentang kamu..." style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Peran dalam Keluarga</label>
        <div style={{ position: 'relative' }}>
          <select name="family_role" defaultValue={familyRole} required style={selectStyle}>
            <option value="kepala_keluarga" style={{ color: '#1a1305', background: '#ffffff' }}>Kepala Keluarga</option>
            <option value="anggota_keluarga" style={{ color: '#1a1305', background: '#ffffff' }}>Anggota Keluarga</option>
            <option value="asisten_rumah_tangga" style={{ color: '#1a1305', background: '#ffffff' }}>Asisten Rumah Tangga</option>
            <option value="lainnya" style={{ color: '#1a1305', background: '#ffffff' }}>Lainnya</option>
          </select>
          <SelectChevron />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Status Hunian</label>
        <div style={{ position: 'relative' }}>
          <select name="occupancy_status" defaultValue={occupancyStatus} required style={selectStyle}>
            <option value="pemilik" style={{ color: '#1a1305', background: '#ffffff' }}>Pemilik</option>
            <option value="penyewa" style={{ color: '#1a1305', background: '#ffffff' }}>Penyewa</option>
            <option value="sementara" style={{ color: '#1a1305', background: '#ffffff' }}>Sementara</option>
          </select>
          <SelectChevron />
        </div>
      </div>

      {state.error ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-[12.5px] font-semibold" style={{ color: '#2f8a4f' }}>Profil berhasil diperbarui.</p>
      ) : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  )
}

```

### components\ProfileInfoCard.tsx
```
import type { ReactNode } from 'react'
import AvatarUploader from '@/components/AvatarUploader'

const occupancyLabel: Record<string, string> = {
  pemilik: 'Pemilik Rumah',
  penyewa: 'Penyewa',
  sementara: 'Tinggal Sementara',
}

const familyRoleLabel: Record<string, string> = {
  kepala_keluarga: 'Kepala Keluarga',
  anggota_keluarga: 'Anggota Keluarga',
  asisten_rumah_tangga: 'Asisten Rumah Tangga',
  lainnya: 'Lainnya',
}

export type ProfileDisplayData = {
  userId: string
  fullName: string
  phone: string | null
  bio: string | null
  avatarUrl: string | null
  familyRole: string | null
  occupancyStatus: string | null
  accountStatus: string | null
  isHouseOwner: boolean
  houseLabel: string | null
}

export default function ProfileInfoCard({
  profile,
  editable,
  actionSlot,
  children,
}: {
  profile: ProfileDisplayData
  editable: boolean
  actionSlot?: ReactNode
  children?: ReactNode
}) {
  // Nomor HP adalah data pribadi: hanya ditampilkan saat pemilik akun melihat profilnya sendiri.
  const showPhone = editable

  return (
    <>
      <div className="mb-4" style={{ marginTop: -56 }}>
        <div style={{ width: 100 }}>
          {editable ? (
            <AvatarUploader userId={profile.userId} currentAvatarUrl={profile.avatarUrl} />
          ) : (
            <div
              className="overflow-hidden rounded-full"
              style={{ width: 100, height: 100, border: '4px solid #faf7f0', background: '#e8e2d0' }}
            >
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatarUrl} alt={profile.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold" style={{ color: '#9c7a3f' }}>
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          {profile.fullName}
        </h1>
        {profile.isHouseOwner ? (
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
          >
            Pemilik
          </span>
        ) : null}
      </div>
      <p className="text-sm font-semibold" style={{ color: '#9c7a3f' }}>
        {profile.houseLabel ? `Rumah ${profile.houseLabel}` : 'Belum ada rumah'}
      </p>

      {profile.bio ? (
        <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: '#3a3424' }}>
          {profile.bio}
        </p>
      ) : null}

      {actionSlot ? <div className="mt-4">{actionSlot}</div> : null}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Peran</div>
          <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
            {familyRoleLabel[profile.familyRole ?? ''] ?? '-'}
          </div>
        </div>
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Status Hunian</div>
          <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
            {occupancyLabel[profile.occupancyStatus ?? ''] ?? '-'}
          </div>
        </div>
        <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Akun</div>
          <div className="mt-1 text-[12.5px] font-bold capitalize" style={{ color: '#2f8a4f' }}>
            {profile.accountStatus ?? '-'}
          </div>
        </div>
        {showPhone ? (
          <div className="rounded-2xl px-3 py-3 text-center" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
            <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>Nomor HP</div>
            <div className="mt-1 text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>
              {profile.phone || '-'}
            </div>
          </div>
        ) : null}
      </div>

      {children}
    </>
  )
}

```

### components\RumahKosongList.tsx
```
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { flagHouseEmpty, unflagHouseEmpty } from '@/app/rumah-kosong/actions'

type House = {
  id: string
  nomor_rumah: string
  is_empty_flagged: boolean
  empty_since: string | null
}

function daysSince(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
  return days
}

export default function RumahKosongList({ houses }: { houses: House[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<'semua' | 'kosong'>('semua')

  function handleToggle(house: House) {
    startTransition(async () => {
      if (house.is_empty_flagged) {
        await unflagHouseEmpty(house.id)
      } else {
        await flagHouseEmpty(house.id)
      }
      router.refresh()
    })
  }

  const filtered = filter === 'kosong' ? houses.filter((h) => h.is_empty_flagged) : houses

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('semua')}
          className="rounded-full px-4 py-1.5 text-[12.5px] font-bold"
          style={{
            background: filter === 'semua' ? '#1a1305' : '#ffffff',
            color: filter === 'semua' ? '#f5f3ee' : '#5b543f',
            border: '1px solid rgba(26,19,5,0.12)',
          }}
        >
          Semua Rumah
        </button>
        <button
          type="button"
          onClick={() => setFilter('kosong')}
          className="rounded-full px-4 py-1.5 text-[12.5px] font-bold"
          style={{
            background: filter === 'kosong' ? '#b3392f' : '#ffffff',
            color: filter === 'kosong' ? '#ffffff' : '#5b543f',
            border: '1px solid rgba(26,19,5,0.12)',
          }}
        >
          Ditandai Kosong
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada data.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-2xl px-5 py-4"
              style={{
                background: '#ffffff',
                border: h.is_empty_flagged ? '1px solid rgba(179,57,47,0.3)' : '1px solid rgba(26,19,5,0.08)',
              }}
            >
              <div>
                <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>Rumah {h.nomor_rumah}</div>
                {h.is_empty_flagged && h.empty_since ? (
                  <div className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#b3392f' }}>
                    Kosong {daysSince(h.empty_since)} hari
                  </div>
                ) : (
                  <div className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#2f8a4f' }}>Berpenghuni</div>
                )}
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggle(h)}
                className="rounded-xl px-3.5 py-2 text-[12.5px] font-bold"
                style={{
                  background: h.is_empty_flagged ? '#faf7f0' : '#b3392f',
                  color: h.is_empty_flagged ? '#1f1a10' : '#ffffff',
                  border: h.is_empty_flagged ? '1px solid rgba(26,19,5,0.12)' : 'none',
                }}
              >
                {h.is_empty_flagged ? 'Tandai Berpenghuni' : 'Tandai Kosong'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

```

### components\ScanTamuForm.tsx
```
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkInGuest } from '@/app/keamanan/scan-tamu/actions'

export default function ScanTamuForm() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError('')
    setSuccess('')
    const result = await checkInGuest({ error: '', success: false }, formData)
    setIsPending(false)
    if (result.success) {
      setSuccess('Tamu berhasil diverifikasi masuk.')
      router.refresh()
      const form = document.getElementById('scan-tamu-form') as HTMLFormElement | null
      form?.reset()
    } else {
      setError(result.error)
    }
  }

  return (
    <form
      id="scan-tamu-form"
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <label className="text-[11.5px] font-bold" style={{ color: '#5b543f' }}>Kode Tamu (6 digit)</label>
      <input
        type="text"
        name="visit_code"
        required
        maxLength={6}
        inputMode="numeric"
        placeholder="000000"
        className="text-center text-2xl font-bold tracking-[0.4em]"
        style={{
          background: '#f2f1ec',
          border: '1px solid rgba(26,19,5,0.12)',
          borderRadius: '12px',
          padding: '14px',
          color: '#1f1a10',
          outline: 'none',
        }}
      />

      {error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{error}</p> : null}
      {success ? <p className="text-[12.5px] font-semibold" style={{ color: '#2f6b4f' }}>{success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.7 : 1 }}
      >
        {isPending ? 'Memverifikasi...' : 'Verifikasi Masuk'}
      </button>
    </form>
  )
}

```

### components\TukangForm.tsx
```
'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitTukang, type SubmitTukangState } from '@/app/tukang/actions'

const initialState: SubmitTukangState = { error: '', success: false }

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }

export default function TukangForm() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(async (prev: SubmitTukangState, formData: FormData) => {
    const result = await submitTukang(prev, formData)
    if (result.success) {
      router.refresh()
      setOpen(false)
    }
    return result
  }, initialState)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
        style={{ background: '#1a1305', color: '#f5f3ee' }}
      >
        + Rekomendasikan Tukang
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl px-5 py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nama Tukang</label>
        <input type="text" name="name" required placeholder="Pak Slamet" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Keahlian</label>
        <input type="text" name="specialty" required placeholder="Tukang Listrik, Ledeng, Bangunan, dll" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Nomor HP</label>
        <input type="text" name="phone" required placeholder="08xxxxxxxxxx" style={inputStyle} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label style={labelStyle}>Catatan (opsional)</label>
        <textarea name="description" rows={2} placeholder="Pengalaman, area kerja, dll" style={inputStyle} />
      </div>

      <p className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
        Rekomendasi akan ditinjau admin sebelum tampil di katalog.
      </p>

      {state.error ? <p className="text-[12.5px] font-semibold" style={{ color: '#b3392f' }}>{state.error}</p> : null}

      <div className="mt-1 flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-80"
          style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
          style={{ background: '#1a1305', color: '#f5f3ee', opacity: isPending ? 0.7 : 1 }}
        >
          {isPending ? 'Mengirim...' : 'Kirim'}
        </button>
      </div>
    </form>
  )
}

```

### components\TukangKelolaList.tsx
```
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveTukang, rejectTukang } from '@/app/tukang/actions'

type PendingTukang = {
  id: string
  name: string
  specialty: string
  phone: string
  description: string | null
  submitter_name: string
}

export default function TukangKelolaList({ items }: { items: PendingTukang[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove(id: string) {
    startTransition(async () => {
      await approveTukang(id)
      router.refresh()
    })
  }

  function handleReject(id: string) {
    if (!confirm('Tolak rekomendasi ini?')) return
    startTransition(async () => {
      await rejectTukang(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Tidak ada rekomendasi tukang yang menunggu review.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</span>
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}>
              {t.specialty}
            </span>
          </div>
          <div className="mt-1 text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>{t.phone} · diajukan oleh {t.submitter_name}</div>
          {t.description ? <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{t.description}</p> : null}
          <div className="mt-3 flex gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleApprove(t.id)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#2f8a4f', color: '#ffffff' }}
            >
              Setujui
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleReject(t.id)}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold"
              style={{ background: '#b3392f', color: '#ffffff' }}
            >
              Tolak
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

```

### components\ui\button.tsx
```
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

### components\ui\card.tsx
```
import * as React from "react"
import { cn } from "cn"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg bg-card py-(--card-spacing) text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

```

### components\ui\input.tsx
```
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```

### components\ui\label.tsx
```
"use client"

import * as React from "react"
import { cn } from "cn"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

```

### components\ui\select.tsx
```
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "cn"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-3.5 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "pointer-events-none -mx-1 my-1 h-px bg-border/50",
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```

### lib\lib\supabase\client.ts
```
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

```

### lib\supabase\admin.ts
```
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client ini pakai Service Role Key: bisa membuat/menghapus akun login (auth.users) dan
// melewati semua RLS. HANYA dipakai di server actions ('use server'), tidak pernah
// diimpor ke komponen client, dan SUPABASE_SERVICE_ROLE_KEY tidak boleh punya prefix
// NEXT_PUBLIC_ (kalau ada prefix itu, kuncinya akan ikut terkirim ke browser).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

```

### lib\supabase\client.ts
```
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

```

### lib\supabase\middleware.ts
```
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PENTING: jangan taruh logika apa pun di antara createServerClient dan
  // supabase.auth.getUser() di bawah ini. Kesalahan kecil di sini bisa
  // menyebabkan user tiba-tiba ter-logout secara acak dan sulit dilacak.
  await supabase.auth.getUser()

  return supabaseResponse
}

```

### lib\supabase\server.ts
```
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // aman diabaikan kalau dipanggil dari Server Component
          }
        },
      },
    }
  )
}

```

### lib\utils.ts
```
export { cn } from "cn"

```


