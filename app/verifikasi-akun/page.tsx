import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import VerifikasiAccountTable from '@/components/admin/VerifikasiAccountTable'
import ChangeRequestTable from '@/components/admin/ChangeRequestTable'
import { approveAccount, rejectAccount, deleteWargaAccount, approveChangeRequest, rejectChangeRequest } from './actions'

export default async function VerifikasiAkunPage() {
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

  const { data: pendingRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone, nik, family_role, occupancy_status, created_at, house:houses(nomor_rumah)')
    .eq('role', 'warga')
    .eq('account_status', 'menunggu_verifikasi')
    .order('created_at', { ascending: true })

  const { data: ditolakRaw } = await supabase
    .from('profiles')
    .select('id, full_name, phone, nik, family_role, occupancy_status, created_at, house:houses(nomor_rumah)')
    .eq('role', 'warga')
    .eq('account_status', 'ditolak')
    .order('created_at', { ascending: false })
    .limit(30)

  const normalize = (rows: any[] | null) =>
    (rows ?? []).map((r) => ({ ...r, house: Array.isArray(r.house) ? r.house[0] : r.house }))

  const pending = normalize(pendingRaw)
  const ditolak = normalize(ditolakRaw)

  const { data: requestsRaw } = await supabase
    .from('profile_change_requests')
    .select('id, field, old_value, new_value, created_at, requester:profiles!profile_change_requests_user_id_fkey(full_name, nickname, house:houses(nomor_rumah))')
    .eq('status', 'menunggu')
    .order('created_at', { ascending: true })

  const requests = (requestsRaw ?? []).map((r: any) => {
    const requester = Array.isArray(r.requester) ? r.requester[0] : r.requester
    return {
      ...r,
      requester: requester ? { ...requester, house: Array.isArray(requester.house) ? requester.house[0] : requester.house } : null,
    }
  })

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keanggotaan</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Verifikasi Akun Warga
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Akun warga baru bisa login dan lihat dashboard, tapi semua fitur terkunci sampai disetujui di sini.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Menunggu Verifikasi"
          value={pending.length}
          iconBg="#e6c98a"
          iconPath="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
        <StatCard
          label="Pengajuan Ubah Data"
          value={requests.length}
          iconBg="#c9b8f0"
          iconPath="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
        />
        <StatCard
          label="Ditolak"
          value={ditolak.length}
          iconBg="#f2b8b0"
          iconPath="M18 6 6 18M6 6l12 12"
        />
      </div>

      <div className="mb-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Menunggu Verifikasi ({pending.length})
        </div>
        <VerifikasiAccountTable accounts={pending} mode="pending" approveAction={approveAccount} rejectAction={rejectAccount} />
      </div>

      <div className="mb-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Pengajuan Perubahan Data ({requests.length})
        </div>
        <ChangeRequestTable
          requests={requests}
          canReviewFullName={access.isSuperadmin || access.isKetuaPaguyuban}
          approveAction={approveChangeRequest}
          rejectAction={rejectChangeRequest}
        />
      </div>

      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Ditolak — bisa dihapus untuk daftar ulang ({ditolak.length})
        </div>
        <VerifikasiAccountTable accounts={ditolak} mode="ditolak" deleteAction={deleteWargaAccount} />
      </div>
    </AdminLayout>
  )
}