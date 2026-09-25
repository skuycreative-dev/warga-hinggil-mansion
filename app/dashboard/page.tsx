import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

const menu = [
  {
    title: 'Tombol Darurat',
    href: '/darurat',
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Forum Warga',
    href: '/forum',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Pengumuman',
    href: '/pengumuman',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
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
    .select('full_name, role, avatar_url, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Warga'
  const houseLabel = (profile as any)?.house?.nomor_rumah

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
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-bold"
              style={{ color: '#c7c9d2' }}
            >
              Keluar
            </button>
          </form>
        </div>

        <div className="mx-auto w-full max-w-3xl px-6 pb-10 pt-2 md:px-10 md:pb-14">
          <h1
            className="text-2xl font-bold md:text-3xl"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}
          >
            Halo, {firstName}
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
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: '#1a1305' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.path} />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>
                  {m.title}
                </div>
              </Link>
            ))}
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
                    className="flex items-center justify-between rounded-2xl px-5 py-4"
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
