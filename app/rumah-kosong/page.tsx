import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { displayName } from '@/lib/display-name'
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

  // Riwayat patroli Security untuk rumah sendiri selama Mode Rumah Kosong (Step 321)
  const { data: checksRaw } = myActive
    ? await supabase
        .from('patrol_checks')
        .select('id, checked_at, result, note, checker:profiles!patrol_checks_checked_by_fkey(full_name, nickname)')
        .eq('absence_id', myActive.id)
        .order('checked_at', { ascending: false })
        .limit(30)
    : { data: [] as any[] }

  const checks = (checksRaw ?? []).map((c: any) => ({
    id: c.id as string,
    checked_at: c.checked_at as string,
    result: c.result as string,
    note: c.note as string | null,
    checker: displayName(Array.isArray(c.checker) ? c.checker[0] : c.checker, 'Security'),
  }))

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

        {myActive ? (
          <div className="mb-9">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Patroli Security di Rumahmu ({checks.length})</div>
            {checks.length === 0 ? (
              <p className="rounded-2xl px-5 py-5 text-center text-[13px]" style={{ background: '#ffffff', color: '#5b543f' }}>
                Belum ada patroli tercatat. Kamu akan mendapat notifikasi setiap kali rumahmu dicek.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {checks.map((c) => (
                  <div key={c.id} className="rounded-xl px-4 py-2.5" style={{ background: '#ffffff', border: `1px solid ${c.result === 'aman' ? 'rgba(47,107,79,0.25)' : 'rgba(179,57,47,0.35)'}` }}>
                    <div className="text-[13px] font-bold" style={{ color: c.result === 'aman' ? '#2f6b4f' : '#b3392f' }}>
                      {c.result === 'aman' ? 'Aman ✓' : 'Perlu perhatian'} · {c.checker}
                    </div>
                    <div className="text-[11.5px]" style={{ color: '#9c7a3f' }}>
                      {new Date(c.checked_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {c.note ? <p className="mt-0.5 text-[12.5px]" style={{ color: '#3d3727' }}>{c.note}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {isViewer ? (
          <Link
            href="/keamanan/rumah-kosong"
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{ background: '#1a1305' }}
          >
            <div>
              <div className="text-[14px] font-bold" style={{ color: 'var(--brand-accent)' }}>Dashboard Rumah Kosong & Patroli</div>
              <div className="text-[12px]" style={{ color: '#d8cfb8' }}>Daftar rumah kosong, target patroli, catat patroli, cetak jadwal.</div>
            </div>
            <span className="text-[14px] font-bold" style={{ color: 'var(--brand-accent)' }}>→</span>
          </Link>
        ) : null}
      </div>
    </main>
  )
}