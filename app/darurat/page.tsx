import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EmergencyPanel from '@/components/EmergencyPanel'
import { displayName } from '@/lib/display-name'
import { loadEvents } from '@/lib/emergency-data'

const RESOLVER_ROLES = ['security', 'paguyuban', 'staff_paguyuban', 'manajemen', 'superadmin']

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
    .select('id, message, status, emergency_type, created_at, reporter_id, house:houses(nomor_rumah), reporter:reporter_id(full_name, nickname)')
    .in('status', ['aktif', 'ditangani'])
    .order('created_at', { ascending: false })
    .limit(30)

  const alerts = (alertsRaw ?? []).map((a: any) => ({
    ...a,
    house: Array.isArray(a.house) ? a.house[0] : a.house,
    reporter: { full_name: displayName(Array.isArray(a.reporter) ? a.reporter[0] : a.reporter) },
  }))

  // Log respons untuk alert milik sendiri (database hanya mengirim catatan yang tidak internal)
  const myAlertIds = alerts.filter((a: any) => a.reporter_id === user.id).map((a: any) => a.id as string)
  const eventMap = await loadEvents(supabase, myAlertIds)
  const myEvents = Object.fromEntries(Array.from(eventMap.entries()))

  const { data: contacts } = await supabase
    .from('emergency_contacts')
    .select('id, name, phone, description')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

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
              Alert langsung terkirim ke seluruh warga, Security, dan Pengurus, lengkap dengan nama dan nomor rumah kamu.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <EmergencyPanel alerts={alerts} canResolve={canResolve} currentUserId={user.id} contacts={contacts ?? []} myEvents={myEvents} />
      </div>
    </main>
  )
}