import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import BrandingForm from '@/components/admin/BrandingForm'

export const dynamic = 'force-dynamic'

export default async function IdentitasPerumahanPage() {
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
  const { data } = await supabase.from('app_branding').select('*').eq('id', 1).maybeSingle()

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>White Label</span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
            Identitas Perumahan
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
            Nama, logo, kontak, dan warna tema yang tampil di aplikasi, halaman login, laporan, dan saat aplikasi dipasang di HP.
            Warga yang sudah memasang aplikasi di HP akan melihat nama/ikon baru setelah membuka ulang aplikasinya.
          </p>
        </div>
        <BrandingForm
          initial={{
            community_name: data?.community_name ?? 'Hinggil Mansion',
            app_name: data?.app_name ?? 'Warga Hinggil Mansion',
            short_name: data?.short_name ?? 'Hinggil Mansion',
            tagline: data?.tagline ?? '',
            theme_color: data?.theme_color ?? '#0a0b0f',
            accent_color: data?.accent_color ?? '#e6c98a',
            contact_whatsapp: data?.contact_whatsapp ?? '',
            contact_email: data?.contact_email ?? '',
            address: data?.address ?? '',
            city: data?.city ?? '',
          }}
        />
      </div>
    </AdminLayout>
  )
}