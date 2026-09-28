import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import { FEATURES } from '@/lib/features'
import AdminLayout from '@/components/admin/AdminLayout'
import FeatureToggleList from '@/components/admin/FeatureToggleList'

export const dynamic = 'force-dynamic'

export default async function KelolaFiturPage() {
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
  const { data } = await supabase.from('app_features').select('key, enabled, updated_at')
  const byKey = new Map((data ?? []).map((r) => [r.key as string, r]))

  const rows = FEATURES.map((f) => ({
    key: f.key,
    label: f.label,
    description: f.description,
    enabled: byKey.get(f.key)?.enabled ?? true,
    updatedAt: (byKey.get(f.key)?.updated_at as string | undefined) ?? null,
  }))
  const activeCount = rows.filter((r) => r.enabled).length

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>White Label</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Kelola Fitur
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          {activeCount} dari {rows.length} fitur aktif. Fitur yang dinonaktifkan tetap tampil tombolnya di aplikasi warga, tapi terkunci
          dengan pesan &quot;Hubungi Superadmin untuk mengaktifkan fitur ini&quot;. Superadmin tetap bisa membuka semua fitur untuk
          pengecekan.
        </p>
      </div>
      <FeatureToggleList rows={rows} />
    </AdminLayout>
  )
}