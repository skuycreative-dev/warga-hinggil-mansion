import Link from 'next/link'
import { getMyAccess } from '@/lib/access'
import TwoFactorManager from '@/components/security/TwoFactorManager'

export const dynamic = 'force-dynamic'

export default async function KeamananAkunPage({ searchParams }: { searchParams: Promise<{ wajib?: string }> }) {
  const access = await getMyAccess({ allowPending2fa: true })
  const sp = await searchParams
  const forced = sp.wajib === '1' && access.needs2fa

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{access.roleLabel}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Keamanan Akun
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>Verifikasi 2 langkah (2FA) dengan aplikasi Authenticator.</p>
          </div>
          {!forced ? (
            <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          ) : null}
        </div>
        <TwoFactorManager required={access.needs2fa} forced={forced} />
      </div>
    </main>
  )
}