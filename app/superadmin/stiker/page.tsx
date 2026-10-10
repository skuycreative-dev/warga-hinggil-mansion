import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'
import StickerManager, { type AdminPack } from '@/components/admin/StickerManager'

export const dynamic = 'force-dynamic'

export default async function KelolaStikerPage() {
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
  const [{ data: packs }, { data: stickers }] = await Promise.all([
    supabase.from('sticker_packs').select('id, name, is_active').order('sort_order').order('created_at'),
    supabase.from('stickers').select('id, pack_id, path, label, is_active').order('sort_order').order('created_at'),
  ])

  const result: AdminPack[] = ((packs ?? []) as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    is_active: p.is_active,
    stickers: ((stickers ?? []) as any[]).filter((s) => s.pack_id === p.id),
  }))

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Konten</span>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
            Kelola Stiker
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
            Unggah paket stiker yang bisa dipakai warga di chat, postingan forum, dan komentar forum. Warga hanya bisa memilih dari paket ini.
          </p>
        </div>
        <StickerManager packs={result} />
      </div>
    </AdminLayout>
  )
}