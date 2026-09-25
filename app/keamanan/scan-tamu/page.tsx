import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScanTamuForm from '@/components/ScanTamuForm'

export default async function ScanTamuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const allowedRoles = ['security', 'superadmin']

  if (!profile || !allowedRoles.includes(profile.role)) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>
            Akses Ditolak
          </p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Halaman ini khusus untuk petugas keamanan.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-md px-6 py-10 md:px-10 md:py-14">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold"
          style={{ color: '#9c7a3f' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="mt-4 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Pos Keamanan
          </span>
          <h1
            className="mt-1 text-2xl font-bold"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
          >
            Verifikasi Tamu
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#5b543f' }}>
            Masukkan kode dari QR tamu untuk check-in
          </p>
        </div>

        <ScanTamuForm />
      </div>
    </main>
  )
}
