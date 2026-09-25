import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmergencyPanel from '@/components/EmergencyPanel'

const RESOLVER_ROLES = ['security', 'paguyuban', 'manajemen', 'superadmin']

export default async function DaruratPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const canResolve = !!profile && RESOLVER_ROLES.includes(profile.role)

  const { data: alertsRaw } = await supabase
    .from('emergency_alerts')
    .select('id, message, status, created_at, created_by, house:houses(nomor_rumah), creator:created_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(20)

  const alerts = (alertsRaw ?? []).map((a: any) => ({
    ...a,
    house: Array.isArray(a.house) ? a.house[0] : a.house,
    creator: Array.isArray(a.creator) ? a.creator[0] : a.creator,
  }))

  const activeAlerts = alerts.filter((a) => a.status === 'aktif')

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#b3392f' }}>Keadaan Darurat</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Tombol Darurat
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Tekan tombol untuk mengirim alert ke Security dan Pengurus secara langsung.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <EmergencyPanel alerts={alerts} canResolve={canResolve} currentUserId={user.id} />
      </div>
    </main>
  )
}
