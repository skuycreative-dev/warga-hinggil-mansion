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
