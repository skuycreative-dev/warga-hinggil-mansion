import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StatCard from '@/components/admin/StatCard'
import KelolaWargaTable from '@/components/admin/KelolaWargaTable'
import ChangeRequestTable from '@/components/admin/ChangeRequestTable'
import OccupancyRequestList from '@/components/admin/OccupancyRequestList'
import FamilyMembersAdminList from '@/components/admin/FamilyMembersAdminList'
import { approveChangeRequest, rejectChangeRequest } from '@/app/verifikasi-akun/actions'
import {
  deactivateWarga,
  restoreWarga,
  permanentlyDeleteMovedWarga,
  approveOccupancyRequest,
  rejectOccupancyRequest,
  deleteFamilyMemberAdmin,
} from './actions'

// Paket V (30 Sep 2026): halaman ini sekarang memakai admin client (bukan client biasa yang
// tunduk RLS) untuk SEMUA pembacaan data -- ini juga menutup tuntas bug lama "Warga Aktif
// selalu 0" yang disebabkan sesi 2FA (aal2) belum aktif saat query dijalankan lewat RLS.
// Penulisan/perubahan data tetap lewat action yang memvalidasi hak akses sendiri (lihat actions.ts).

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

  const admin = createAdminClient()

  const [{ data: aktifRaw }, { data: pindahRaw }, { data: arsipRaw }, { data: familyRaw }, { data: occRequestsRaw }, { data: changeRequestsRaw }] =
    await Promise.all([
      admin
        .from('profiles')
        .select('id, full_name, nickname, phone, family_role, house:houses(nomor_rumah)')
        .eq('role', 'warga')
        .eq('account_status', 'aktif')
        .order('full_name', { ascending: true })
        .limit(1000),
      admin
        .from('profiles')
        .select('id, full_name, nickname, deactivated_at, deactivated_reason')
        .eq('role', 'warga')
        .eq('account_status', 'pindah')
        .order('deactivated_at', { ascending: false })
        .limit(500),
      admin
        .from('warga_arsip')
        .select('id, full_name, nomor_rumah, alasan, dihapus_oleh_nama, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      // Anggota Keluarga Tanpa Akun (anak/lansia/ART tanpa login sendiri), semua rumah.
      admin.from('family_members').select('id, name, relation, note, house:houses(nomor_rumah)').order('created_at', { ascending: false }).limit(1000),
      // Pengajuan status hunian dari penghuni yang bukan pemilik rumah (Paket V).
      admin
        .from('house_occupancy_requests')
        .select('id, new_status, note, requested_by, created_at, house:houses(nomor_rumah)')
        .eq('status', 'menunggu')
        .order('created_at', { ascending: true }),
      // Pengajuan perubahan data lain (nama, peran keluarga, dll) -- sama seperti di Verifikasi Akun,
      // ditampilkan juga di sini supaya semua urusan data warga terkumpul di satu tempat.
      admin
        .from('profile_change_requests')
        .select('id, field, old_value, new_value, created_at, requester:profiles!profile_change_requests_user_id_fkey(full_name, nickname, house:houses(nomor_rumah))')
        .eq('status', 'menunggu')
        .order('created_at', { ascending: true }),
    ])

  const normalize = (rows: any[] | null) =>
    (rows ?? []).map((r) => ({ ...r, house: Array.isArray(r.house) ? r.house[0] : r.house }))

  const aktif = normalize(aktifRaw)
  const pindah = pindahRaw ?? []
  const arsip = arsipRaw ?? []

  const familyMembers = normalize(familyRaw).map((r: any) => ({
    id: r.id as string,
    name: r.name as string,
    relation: r.relation as string,
    note: (r.note as string | null) ?? null,
    house_label: (r.house?.nomor_rumah as string | undefined) ?? null,
  }))

  const occRequestsNormalized = normalize(occRequestsRaw)
  const requesterIds = Array.from(new Set(occRequestsNormalized.map((r: any) => r.requested_by as string)))
  const { data: requesterProfiles } = requesterIds.length
    ? await admin.from('profiles').select('id, full_name, nickname').in('id', requesterIds)
    : { data: [] as any[] }
  const requesterName = new Map((requesterProfiles ?? []).map((p: any) => [p.id as string, (p.nickname?.trim() || p.full_name) as string]))

  const occupancyRequests = occRequestsNormalized.map((r: any) => ({
    id: r.id as string,
    house_label: (r.house?.nomor_rumah as string | undefined) ?? '-',
    requester_name: requesterName.get(r.requested_by as string) ?? 'Penghuni',
    new_status: r.new_status as string,
    note: (r.note as string | null) ?? null,
    created_at: r.created_at as string,
  }))

  const changeRequests = (changeRequestsRaw ?? []).map((r: any) => {
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

      <div className="mt-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Pengajuan Status Hunian ({occupancyRequests.length})
        </div>
        <p className="mb-3 text-[12.5px]" style={{ color: '#5b543f' }}>
          Penghuni rumah yang bukan pemilik (istri, anak, dst) mengajukan perubahan di menu Status Hunian --
          disetujui/ditolak di sini.
        </p>
        <OccupancyRequestList requests={occupancyRequests} approveAction={approveOccupancyRequest} rejectAction={rejectOccupancyRequest} />
      </div>

      <div className="mt-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Pengajuan Perubahan Data ({changeRequests.length})
        </div>
        <ChangeRequestTable
          requests={changeRequests}
          canReviewFullName={access.isSuperadmin || access.isKetuaPaguyuban}
          approveAction={approveChangeRequest}
          rejectAction={rejectChangeRequest}
        />
      </div>

      <div className="mt-9">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Anggota Keluarga Tanpa Akun ({familyMembers.length})
        </div>
        <p className="mb-3 text-[12.5px]" style={{ color: '#5b543f' }}>
          Anak, lansia, ART, atau penghuni lain yang didaftarkan tanpa akun login sendiri oleh Kepala/Ibu Rumah
          Tangga masing-masing rumah.
        </p>
        <FamilyMembersAdminList members={familyMembers} deleteAction={deleteFamilyMemberAdmin} />
      </div>
    </AdminLayout>
  )
}