import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
import RumahKosongList from '@/components/RumahKosongList'
import RumahKosongWarga from '@/components/RumahKosongWarga'

const VIEWER_ROLES = ['security', 'paguyuban', 'superadmin']

function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

export default async function RumahKosongPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status, house_id, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'warga'
  const isViewer = VIEWER_ROLES.includes(role)
  const houseLabel = (profile as any)?.house?.nomor_rumah ?? null
  const canActivate = !!profile?.house_id && (role !== 'warga' || profile?.account_status === 'aktif') && role !== 'it_support'

  // Penghuni: status rumahnya sendiri
  const { data: myActive } = profile?.house_id
    ? await supabase
        .from('house_absences')
        .select('id, start_date, end_date, note, contact_phone')
        .eq('house_id', profile.house_id)
        .eq('status', 'aktif')
        .gte('end_date', todayIso())
        .maybeSingle()
    : { data: null }

  // Security / Paguyuban / Superadmin: semua rumah yang sedang / akan kosong
  const { data: absencesRaw } = isViewer
    ? await supabase
        .from('house_absences')
        .select('id, start_date, end_date, note, contact_phone, house:houses(nomor_rumah), reporter:profiles!house_absences_created_by_fkey(full_name, nickname)')
        .eq('status', 'aktif')
        .gte('end_date', todayIso())
        .order('start_date', { ascending: true })
    : { data: [] as any[] }

  const absences = (absencesRaw ?? []).map((a: any) => {
    const reporter = Array.isArray(a.reporter) ? a.reporter[0] : a.reporter
    return {
      ...a,
      house: Array.isArray(a.house) ? a.house[0] : a.house,
      reporter_name: reporter ? displayName(reporter) : null,
    }
  })

  if (!isViewer && !canActivate) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Belum Bisa Dipakai</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Mode Rumah Kosong bisa dipakai setelah akunmu terhubung ke nomor rumah dan diverifikasi Pengurus.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keamanan Lingkungan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Rumah Kosong
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {canActivate ? (
          <div className="mb-9">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rumah Saya</div>
            <RumahKosongWarga active={myActive ?? null} houseLabel={houseLabel} />
          </div>
        ) : null}

        {isViewer ? (
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
              Rumah yang Sedang / Akan Kosong ({absences.length})
            </div>
            <RumahKosongList absences={absences} />
          </div>
        ) : null}
      </div>
    </main>
  )
}