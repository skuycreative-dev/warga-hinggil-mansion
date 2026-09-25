import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import NotificationBell from '@/components/NotificationBell'

const menu = [
  {
    title: 'Tombol Darurat',
    href: '/darurat',
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
    danger: true,
  },
  {
    title: 'Forum Warga',
    href: '/forum',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Warga & Teman',
    href: '/warga',
    path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    title: 'Pesan',
    href: '/chat',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    href: '/qr-tamu',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
  {
    title: 'Anggaran & Iuran',
    href: '/anggaran',
    path: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    title: 'Polling Warga',
    href: '/polling',
    path: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  },
  {
    title: 'Katalog Tukang',
    href: '/tukang',
    path: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  },
  {
    title: 'Profil Saya',
    href: '/profile',
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url, house_id, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.house_id) {
    redirect('/lengkapi-profil')
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const displayName = profile?.full_name ?? 'Warga'
  const houseLabel = (profile as any)?.house?.nomor_rumah
  const isSecurity = profile?.role === 'security' || profile?.role === 'superadmin'
  const isPaguyuban = profile?.role === 'paguyuban' || profile?.role === 'superadmin'
  const isManajemen = profile?.role === 'manajemen' || profile?.role === 'superadmin'
  const canSeeRumahKosong = isSecurity || isPaguyuban

  return (
    <main className="flex w-full flex-col">
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5 md:px-10">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-hinggil-mansion.jpg"
              alt="Hinggil Mansion"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
            <span
              className="text-sm font-bold tracking-wide"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
            >
              HINGGIL MANSION
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ color: '#efe4c8' }}>
              <NotificationBell />
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white/10"
                style={{ color: '#efe4c8', border: '1px solid rgba(230,201,138,0.35)' }}
              >
                Keluar
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-2 md:px-10 md:pb-14">
          <h1
            className="text-2xl font-bold md:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}
          >
            Halo, {displayName}
          </h1>
          <p className="mt-1.5 text-sm font-medium md:text-base" style={{ color: '#c7c9d2' }}>
            {houseLabel ? `Rumah ${houseLabel}` : 'Selamat datang kembali'}
          </p>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
            Menu Cepat
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {menu.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{
                  background: '#ffffff',
                  border: m.danger ? '1px solid rgba(179,57,47,0.25)' : '1px solid rgba(26,19,5,0.08)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: m.danger ? '#b3392f' : '#1a1305' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={m.danger ? '#ffffff' : '#e6c98a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.path} />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: m.danger ? '#b3392f' : '#1f1a10' }}>
                  {m.title}
                </div>
              </Link>
            ))}

            {canSeeRumahKosong ? (
              <Link
                href="/rumah-kosong"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Rumah Kosong</div>
              </Link>
            ) : null}

            {isSecurity ? (
              <Link
                href="/keamanan/scan-tamu"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Verifikasi Tamu</div>
              </Link>
            ) : null}

            {isPaguyuban ? (
              <Link
                href="/paguyuban/moderasi-forum"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Moderasi Forum</div>
              </Link>
            ) : null}

            {isManajemen ? (
              <Link
                href="/tukang/kelola"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 12 2 2 4-4M21 12c0 4.5-3.5 8.5-9 10-5.5-1.5-9-5.5-9-10V5l9-3 9 3v7Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Tukang</div>
              </Link>
            ) : null}
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
                Pengumuman Terbaru
              </span>
              <Link href="/pengumuman" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
                Lihat Semua
              </Link>
            </div>

            {announcements && announcements.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {announcements.map((a) => (
                  <Link
                    key={a.id}
                    href="/pengumuman"
                    className="flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
                    style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                  >
                    <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                      {a.title}
                    </span>
                    <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
                      {new Date(a.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium" style={{ color: '#5b543f' }}>
                Belum ada pengumuman.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
