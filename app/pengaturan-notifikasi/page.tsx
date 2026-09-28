import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PushSettings from '@/components/push/PushSettings'

export const dynamic = 'force-dynamic'

export default async function PengaturanNotifikasiPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: pref }, { data: devices }] = await Promise.all([
    supabase.from('push_preferences').select('muted').eq('user_id', user.id).maybeSingle(),
    supabase.from('push_subscriptions').select('id, device_label, created_at, last_success_at').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Pengaturan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Notifikasi HP
            </h1>
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>
        <PushSettings muted={(pref?.muted as string[] | undefined) ?? []} devices={(devices ?? []) as any} />
      </div>
    </main>
  )
}