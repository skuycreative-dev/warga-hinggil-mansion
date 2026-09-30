import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import AdminAccountPanel from '@/components/admin/AdminAccountPanel'
import AdminAccountTable from '@/components/admin/AdminAccountTable'
import JabatanManager from '@/components/admin/JabatanManager'
import { listActiveWargaForPicker, listJabatanHolders } from '@/lib/jabatan'
import { createStaffAccount, updateStaffAccount, deleteStaffAccount, assignStaffJabatan, revokeStaffJabatan } from './actions'

// Paket T (30 Sep 2026): Sekretaris/Bendahara/Security sekarang diangkat dari warga aktif lewat
// JabatanManager di bawah, bukan lewat panel buat-akun-baru ini lagi.
const JABATAN_OPTIONS = [
  { value: 'sekretaris', label: 'Sekretaris Paguyuban' },
  { value: 'bendahara', label: 'Bendahara Paguyuban' },
  { value: 'security', label: 'Security' },
]

// IT Support hanya bisa dikelola Superadmin, dan tetap akun terpisah (bukan warga penghuni)
const IT_SUPPORT_OPTION = { value: 'it_support', label: 'IT Support' }

export default async function KelolaStaffPage() {
  const access = await getMyAccess()

  if (!access.canManageStaff) {
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

  // IT Support: hanya Superadmin yang boleh buat akun baru dari sini (bukan warga penghuni).
  const itSupportOnly = access.canCreateItSupport ? [IT_SUPPORT_OPTION] : []

  const supabase = await createClient()
  const { data: accountsRaw } = access.canCreateItSupport
    ? await supabase.from('profiles').select('id, full_name, role, staff_position, created_at').eq('role', 'it_support').order('created_at', { ascending: false })
    : { data: [] as any[] }

  const accounts = (accountsRaw ?? []).map((a: any) => ({
    id: a.id as string,
    full_name: (a.full_name ?? '') as string,
    created_at: a.created_at as string,
    role: a.role as string,
  }))

  const [jabatanHolders, wargaOptions] = await Promise.all([
    listJabatanHolders(['sekretaris', 'bendahara', 'security']),
    listActiveWargaForPicker(),
  ])

  const pengurusCount = jabatanHolders.filter((h) => h.jabatan === 'sekretaris' || h.jabatan === 'bendahara').length
  const securityCount = jabatanHolders.filter((h) => h.jabatan === 'security').length
  const itSupportCount = accounts.length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Paguyuban</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Staff
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          {access.canCreateItSupport
            ? 'Angkat Sekretaris, Bendahara, dan Security dari warga aktif. Akun IT Support tetap dibuat terpisah di bawah.'
            : 'Angkat Sekretaris, Bendahara, dan Security dari warga aktif. Akun IT Support dikelola Superadmin.'}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Pengurus Paguyuban"
          value={pengurusCount}
          caption="Sekretaris & Bendahara"
          iconBg="var(--brand-accent)"
          iconPath="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6"
        />
        <StatCard
          label="Security"
          value={securityCount}
          iconBg="#a8c8f0"
          iconPath="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"
        />
        {access.canCreateItSupport ? (
          <StatCard
            label="IT Support"
            value={itSupportCount}
            iconBg="#c9b8f0"
            iconPath="M6 4h12v10H6zM2 20h20M9 17l-1 3M15 17l1 3"
          />
        ) : null}
        <StatCard
          label="Total Staff"
          value={jabatanHolders.length + accounts.length}
          iconBg="#a8d8c8"
          iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        />
      </div>

      <JabatanManager
        title="Pengurus Paguyuban & Security (diangkat dari warga aktif)"
        description="Pilih warga yang statusnya sudah aktif/terverifikasi untuk diangkat jadi Sekretaris, Bendahara, atau Security. Kalau jabatannya dicabut nanti, akun otomatis kembali jadi warga biasa -- data & riwayat sebagai warga tidak hilang."
        jabatanOptions={JABATAN_OPTIONS}
        wargaOptions={wargaOptions}
        holders={jabatanHolders}
        assignAction={assignStaffJabatan}
        revokeAction={revokeStaffJabatan}
      />

      {access.canCreateItSupport ? (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
              Daftar IT Support
            </div>
            <AdminAccountTable
              accounts={accounts}
              roleOptions={itSupportOnly}
              updateAction={updateStaffAccount}
              deleteAction={deleteStaffAccount}
            />
          </div>

          <div>
            <AdminAccountPanel title="Tambah Akun IT Support" roleOptions={itSupportOnly} createAction={createStaffAccount} />
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}