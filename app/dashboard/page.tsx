import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import NotificationBell from '@/components/NotificationBell'
import { displayName as nameOf } from '@/lib/display-name'
import FamilyRequestList from '@/components/FamilyRequestList'

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
    title: 'Pengaduan',
    href: '/pengaduan',
    path: 'M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
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
    title: 'Rumah Kosong',
    href: '/rumah-kosong',
    path: 'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z',
  },
  {
    title: 'Profil Saya',
    href: '/profile',
    path: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 21c1.5-4 5-6 8-6s6.5 2 8 6',
  },
]

// Menu yang tetap bisa dipakai walau akun warga belum diverifikasi Pengurus
const UNLOCKED_WHEN_PENDING = ['Tombol Darurat', 'Profil Saya']

const EMERGENCY_LABEL: Record<string, string> = {
  kebakaran: 'Kebakaran',
  maling: 'Maling',
  perampokan: 'Perampokan',
  kekerasan: 'Kekerasan',
  medis: 'Darurat Medis',
  bencana: 'Bencana Alam',
  lainnya: 'Darurat',
}

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
    .select('full_name, nickname, role, staff_position, avatar_url, house_id, account_status, deactivated_reason, family_role, family_status, house:houses(nomor_rumah)')
    .eq('id', user.id)
    .maybeSingle()

  // house_id hanya wajib untuk warga. Akun staff/admin (security, it_support, manajemen,
  // paguyuban, superadmin) tidak selalu terikat ke satu rumah.
  if (profile?.role === 'warga' && !profile?.house_id) {
    redirect('/lengkapi-profil')
  }

  // Polling aktif ditampilkan di dashboard (kebutuhan #10)
  const { data: pollsRaw } = await supabase
    .from('polls')
    .select('id, title, closes_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)
  const openPolls = (pollsRaw ?? []).filter((p) => !p.closes_at || new Date(p.closes_at).getTime() > Date.now()).slice(0, 2)
  const { data: myVotes } =
    openPolls.length > 0
      ? await supabase.from('poll_votes').select('poll_id').eq('voter_id', user.id).in('poll_id', openPolls.map((p) => p.id))
      : { data: [] as { poll_id: string }[] }
  const votedPollIds = new Set((myVotes ?? []).map((v) => v.poll_id))

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const sejak24Jam = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: daruratRaw } = await supabase
    .from('emergency_alerts')
    .select('id, emergency_type, status, created_at, house:houses(nomor_rumah), reporter:reporter_id(full_name, nickname)')
    .in('status', ['aktif', 'ditangani'])
    .gte('created_at', sejak24Jam)
    .order('created_at', { ascending: false })
    .limit(3)

  const daruratAktif = (daruratRaw ?? []).map((a: any) => ({
    ...a,
    house: Array.isArray(a.house) ? a.house[0] : a.house,
    reporterName: nameOf(Array.isArray(a.reporter) ? a.reporter[0] : a.reporter),
  }))

  const displayName = nameOf(profile)
  const houseLabel = (profile as any)?.house?.nomor_rumah
  const isSecurity = profile?.role === 'security' || profile?.role === 'superadmin'
  const isPaguyuban = profile?.role === 'paguyuban' || profile?.role === 'superadmin'
  const isManajemen = profile?.role === 'manajemen' || profile?.role === 'superadmin'
  const isItSupport = profile?.role === 'it_support' || profile?.role === 'superadmin'
  const isSuperadmin = profile?.role === 'superadmin'

  const isSekretaris = profile?.role === 'staff_paguyuban' && profile?.staff_position === 'sekretaris'
  const canVerifyAccounts = isSuperadmin || profile?.role === 'paguyuban' || isSekretaris
  const canManageEmergencyContacts = canVerifyAccounts
  const isWarga = profile?.role === 'warga'
  // IT Support hanya untuk log error: menu warga disembunyikan (kecuali Tombol Darurat & Profil)
  const isItSupportRole = profile?.role === 'it_support'
  const accountStatus = profile?.account_status ?? 'aktif'
  const isLocked = isWarga && accountStatus !== 'aktif'

  // Kepala Keluarga: daftar orang yang memilih rumahnya saat mendaftar (verifikasi tahap 1)
  const isKepalaKeluarga = profile?.family_role === 'kepala_keluarga' && !!profile?.house_id
  const { data: familyRequestsRaw } = isKepalaKeluarga
    ? await supabase
        .from('profiles')
        .select('id, full_name, nickname, family_role, created_at')
        .eq('house_id', profile!.house_id)
        .eq('family_status', 'menunggu_kepala')
        .order('created_at', { ascending: true })
    : { data: [] as any[] }
  const familyRequests = (familyRequestsRaw ?? []).map((r: any) => ({
    id: r.id as string,
    name: nameOf(r),
    family_role: (r.family_role ?? null) as string | null,
    created_at: r.created_at as string,
  }))
  const familyStatus = profile?.family_status ?? null

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
          {daruratAktif.length > 0 ? (
            <Link
              href="/darurat"
              className="mb-6 block rounded-2xl px-5 py-4"
              style={{ background: '#b3392f', boxShadow: '0 10px 26px rgba(179,57,47,0.3)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)' }}>
                Darurat Aktif di Perumahan
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {daruratAktif.map((a: any) => (
                  <div key={a.id} className="text-sm font-bold text-white">
                    {(EMERGENCY_LABEL[a.emergency_type] ?? 'Darurat').toUpperCase()} · {a.reporterName}
                    {a.house?.nomor_rumah ? ` · Rumah ${a.house.nomor_rumah}` : ''}
                    <span className="ml-1.5 text-[11.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {a.status === 'ditangani' ? '(sedang ditangani)' : '(menunggu respon)'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>Lihat detail →</div>
            </Link>
          ) : null}

          <FamilyRequestList requests={familyRequests} houseLabel={houseLabel ?? null} canConfirm={accountStatus === 'aktif'} />

          {isLocked ? (
            <div
              className="mb-6 rounded-2xl px-5 py-4"
              style={{
                background: accountStatus === 'ditolak' ? 'rgba(179,57,47,0.08)' : 'rgba(212,175,106,0.14)',
                border: accountStatus === 'ditolak' ? '1px solid rgba(179,57,47,0.3)' : '1px solid rgba(212,175,106,0.4)',
              }}
            >
              {accountStatus === 'ditolak' ? (
                <>
                  <p className="text-sm font-bold" style={{ color: '#b3392f' }}>
                    Pendaftaran kamu belum bisa disetujui.
                  </p>
                  <p className="mt-1 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                    {profile?.deactivated_reason
                      ? `Alasan: ${profile.deactivated_reason}`
                      : 'Hubungi Pengurus Paguyuban untuk informasi lebih lanjut atau daftar ulang.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold" style={{ color: familyStatus === 'ditolak_kepala' ? '#b3392f' : '#9c7a3f' }}>
                    {familyStatus === 'menunggu_kepala'
                      ? `Menunggu konfirmasi Kepala Keluarga${houseLabel ? ` Rumah ${houseLabel}` : ''}, lalu verifikasi Pengurus.`
                      : familyStatus === 'ditolak_kepala'
                        ? 'Kepala Keluarga belum mengonfirmasi kamu sebagai penghuni rumah ini.'
                        : 'Akun kamu sedang menunggu verifikasi Pengurus.'}
                  </p>
                  <p className="mt-1 text-[13px] font-medium" style={{ color: '#5b543f' }}>
                    {familyStatus === 'ditolak_kepala'
                      ? 'Hubungi Pengurus Paguyuban untuk memperbaiki data rumahmu. Tombol Darurat dan Profil Saya tetap bisa dipakai.'
                      : 'Semua fitur akan terbuka otomatis setelah disetujui. Tombol Darurat dan Profil Saya tetap bisa dipakai sekarang.'}
                  </p>
                </>
              )}
            </div>
          ) : null}

          <div className="mb-4 text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
            Menu Cepat
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {menu.filter((m) => !isItSupportRole || UNLOCKED_WHEN_PENDING.includes(m.title)).map((m) => {
              const tileLocked = isLocked && !UNLOCKED_WHEN_PENDING.includes(m.title)

              if (tileLocked) {
                return (
                  <div
                    key={m.title}
                    className="relative flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center opacity-45"
                    style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={m.path} />
                      </svg>
                    </div>
                    <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{m.title}</div>
                    <div className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full" style={{ background: '#1a1305' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="10" width="16" height="10" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                  </div>
                )
              }

              return (
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
              )
            })}

            {isSecurity ? (
              <Link
                href="/security"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Security</div>
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
                href="/paguyuban"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Paguyuban</div>
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
                href="/manajemen"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Dashboard Manajemen</div>
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

            {canVerifyAccounts ? (
              <Link
                href="/verifikasi-akun"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Verifikasi Akun</div>
              </Link>
            ) : null}

            {canManageEmergencyContacts ? (
              <Link
                href="/kelola-nomor-darurat"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Nomor Darurat</div>
              </Link>
            ) : null}

            {isPaguyuban ? (
              <Link
                href="/paguyuban/kelola-staff"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Staff</div>
              </Link>
            ) : null}

            {isItSupport ? (
              <Link
                href="/it-support"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Error Logs</div>
              </Link>
            ) : null}

            {isSuperadmin ? (
              <Link
                href="/superadmin"
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.35)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#1a1305' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>
                <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Kelola Admin</div>
              </Link>
            ) : null}
          </div>

          {openPolls.length > 0 && !isLocked && !isItSupportRole ? (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
                  Polling Warga
                </span>
                <Link href="/polling" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
                  Lihat Semua
                </Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {openPolls.map((p) => {
                  const voted = votedPollIds.has(p.id)
                  return (
                    <Link
                      key={p.id}
                      href="/polling"
                      className="flex items-center justify-between gap-3 rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
                      style={{ background: '#ffffff', border: voted ? '1px solid rgba(26,19,5,0.08)' : '1px solid rgba(212,175,106,0.45)' }}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.title}</div>
                        {p.closes_at ? (
                          <div className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
                            Ditutup {new Date(p.closes_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </div>
                        ) : null}
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-3 py-1 text-[11.5px] font-bold"
                        style={voted ? { background: 'rgba(47,138,79,0.12)', color: '#2f8a4f' } : { background: '#1a1305', color: '#e6c98a' }}
                      >
                        {voted ? 'Sudah memilih' : 'Pilih sekarang'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}

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