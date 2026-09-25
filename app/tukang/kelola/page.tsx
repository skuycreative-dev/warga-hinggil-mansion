import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TukangKelolaList from '@/components/TukangKelolaList'

export default async function TukangKelolaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

  if (!profile || !['manajemen', 'superadmin'].includes(profile.role)) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>Halaman ini khusus untuk manajemen.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const { data: rows } = await supabase
    .from('tukang_catalog')
    .select('id, name, specialty, phone, description, submitter:profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const items = (rows ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    specialty: t.specialty,
    phone: t.phone,
    description: t.description,
    submitter_name: t.submitter?.full_name ?? 'Warga',
  }))

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Review</span>
            <h1 className="mt-1 text-2xl font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Kelola Katalog Tukang
            </h1>
          </div>
          <Link href="/tukang" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali</Link>
        </div>

        <TukangKelolaList items={items} />
      </div>
    </main>
  )
}
