import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import KelolaWargaTable from '@/components/admin/KelolaWargaTable'
import { deactivateWarga, restoreWarga, permanentlyDeleteMovedWarga } from './actions'

export const dynamic = 'force-dynamic'

export default async function KelolaWargaPage() {
  const access = await getMyAccess()

  if (!access.canVerifyAccounts) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>
            Halaman ini khusus Superadmin, Admin Paguyuban, dan Sekretaris Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()

  const [{ data: aktifRaw }, { data: pindahRaw }, { data: arsipRaw }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, nickname, phone, family_role, house:houses(nomor_rumah)')
      .eq('role', 'warga')
      .eq('account_status', 'aktif')
      .order('full_name', { ascending: true })
      .limit(1000),
    supabase
      .from('profiles')
      .select('id, full_name, nickname, deactivated_at, deactivated_reason')
      .eq('role', 'warga')
      .eq('account_status', 'pindah')
      .order('deactivated_at', { ascending: false })
      .limit(500),
    supabase
      .from('warga_arsip')
      .select('id, full_name, nomor_rumah, alasan, dihapus_oleh_nama, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const normalize = (rows: any[] | null) =>
    (rows ?? []).map((r) => ({ ...r, house: Array.isArray(r.house) ? r.house[0] : r.house }))

  const aktif = normalize(aktifRaw)
  const pindah = pindahRaw ?? []
  const arsip = arsipRaw ?? []

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keanggotaan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Warga
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Kalau ada warga yang pindah dari perumahan, tandai dulu di sini supaya rumahnya bisa didaftarkan ke
          pemilik/penyewa baru. Akun bisa dihapus permanen setelah ditandai pindah -- riwayat forum, IPL, dan
          catatan lainnya tetap tersimpan.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Warga Aktif" value={aktif.length} iconBg="#a8d8c8" iconPath="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <StatCard
          label="Menunggu Dihapus"
          value={pindah.length}
          badge={pindah.length ? 'PERLU DICEK' : undefined}
          iconBg="#f2b8b0"
          iconPath="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"
        />
        <StatCard label="Total Diarsipkan" value={arsip.length} iconBg="#c9b8f0" iconPath="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
      </div>

      <KelolaWargaTable
        aktif={aktif}
        pindah={pindah}
        arsip={arsip}
        deactivateAction={deactivateWarga}
        restoreAction={restoreWarga}
        deleteAction={permanentlyDeleteMovedWarga}
      />
    </AdminLayout>
  )
}