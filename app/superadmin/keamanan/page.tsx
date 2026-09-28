import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { MFA_ROLES } from '@/lib/mfa'
import AdminLayout from '@/components/admin/AdminLayout'
import SecurityCenter, { type AdminFactorRow, type LockRow, type ResetRow } from '@/components/admin/SecurityCenter'

export const dynamic = 'force-dynamic'

const ROLE_NAME: Record<string, string> = {
  superadmin: 'Superadmin',
  paguyuban: 'Ketua Paguyuban',
  staff_paguyuban: 'Staff Paguyuban',
  manajemen: 'Manajemen',
}

export default async function KeamananSuperadminPage() {
  const access = await getMyAccess()
  if (!access.isSuperadmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const [{ data: resets }, { data: locks }, { data: admins }] = await Promise.all([
    supabase.rpc('list_password_reset_requests'),
    supabase.rpc('list_auth_lockouts'),
    supabase.from('profiles').select('id, full_name, nickname, role, staff_position').in('role', MFA_ROLES).eq('account_status', 'aktif').order('role'),
  ])

  // Jumlah perangkat 2FA tiap admin (dibaca lewat server, tidak pernah dikirim ke browser selain angkanya)
  const adminClient = createAdminClient()
  const adminRows: AdminFactorRow[] = await Promise.all(
    (admins ?? []).map(async (a: any) => {
      let factors = 0
      try {
        const { data } = await adminClient.auth.admin.mfa.listFactors({ userId: a.id })
        factors = (data?.factors ?? []).filter((f) => f.status === 'verified').length
      } catch {
        factors = 0
      }
      const role = a.role === 'staff_paguyuban' ? `${ROLE_NAME.staff_paguyuban} (${a.staff_position ?? '-'})` : ROLE_NAME[a.role] ?? a.role
      return { id: a.id, name: a.nickname || a.full_name || 'Tanpa nama', role, factors, isMe: a.id === access.userId }
    })
  )

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Keamanan &amp; Reset Password
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Permintaan lupa password dari warga masuk ke sini. Buat link sekali pakai lalu kirim lewat WhatsApp atau Gmail dengan template
          otomatis.
        </p>
      </div>
      <SecurityCenter resets={(resets ?? []) as ResetRow[]} locks={(locks ?? []) as LockRow[]} admins={adminRows} />
    </AdminLayout>
  )
}