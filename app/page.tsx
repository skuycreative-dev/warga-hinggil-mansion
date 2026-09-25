import Image from 'next/image'
import Link from 'next/link'

const features = [
  {
    title: 'Tombol Darurat',
    desc: 'Laporan darurat sekali tekan, langsung ke warga & security.',
    path: 'M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z',
  },
  {
    title: 'Forum Warga',
    desc: 'Diskusi dan info antar warga, satu komunitas satu forum.',
    path: 'M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z',
  },
  {
    title: 'Pengumuman',
    desc: 'Info resmi dari pengurus langsung ke beranda kamu.',
    path: 'M3 11h18M3 15h18M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z',
  },
  {
    title: 'QR Tamu',
    desc: 'Undang tamu, security scan di pos, tercatat rapi.',
    path: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 19h2v2h-2z',
  },
]

const facilities = ['Masjid', 'Club House', 'Jogging Track', 'Keamanan 24 Jam']

export default function LandingPage() {
  return (
    <main
      className="mx-auto flex w-full max-w-md flex-col"
      style={{
        background:
          'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.14) 0%, rgba(10,11,15,0) 60%)',
      }}
    >
      <div className="flex items-center gap-2.5 px-6 pb-2 pt-7">
        <Image
          src="/logo-hinggil-mansion.jpg"
          alt="Hinggil Mansion"
          width={34}
          height={34}
          className="rounded-lg object-cover"
        />
        <span
          className="text-[15px] tracking-wide"
          style={{ fontFamily: 'var(--font-fraunces), serif', color: '#e7ddc7' }}
        >
          HINGGIL MANSION
        </span>
      </div>

      <div className="flex flex-col gap-3.5 px-6 pb-2 pt-9">
        <h1
          className="text-[32px] font-medium leading-tight"
          style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}
        >
          Komunitas Hinggil Mansion,
          <br />
          dalam satu genggaman.
        </h1>
        <p className="max-w-[320px] text-[14.5px] leading-relaxed" style={{ color: '#9a9ca8' }}>
          Keamanan, komunikasi, dan kenyamanan seluruh warga menyatu dalam satu aplikasi.
        </p>
      </div>

      <div className="flex gap-2.5 px-6 pt-5">
        <Link
          href="/login"
          className="flex-1 rounded-xl py-3.5 text-center text-sm font-semibold"
          style={{
            background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
            color: '#1a1305',
            boxShadow: '0 8px 20px -8px rgba(205,161,90,0.55)',
          }}
        >
          Masuk
        </Link>
        <Link
          href="/register"
          className="flex-1 rounded-xl py-3.5 text-center text-sm font-semibold"
          style={{ border: '1px solid rgba(212,175,106,0.4)', color: '#e7ddc7' }}
        >
          Daftar Akun
        </Link>
      </div>

      <div className="px-6 pt-9">
        <div
          className="mb-3 text-[11.5px] uppercase tracking-widest"
          style={{ color: '#6d6f7a' }}
        >
          Fitur Warga
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2.5 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                style={{ background: 'rgba(212,175,106,0.12)' }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d4af6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.path} />
                </svg>
              </div>
              <div className="text-[13px] font-semibold" style={{ color: '#f0ede4' }}>
                {f.title}
              </div>
              <div className="text-[11.5px] leading-snug" style={{ color: '#8a8c96' }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pt-8">
        <div
          className="mb-2.5 text-[11.5px] uppercase tracking-widest"
          style={{ color: '#6d6f7a' }}
        >
          Fasilitas
        </div>
        <div className="flex flex-wrap gap-2">
          {facilities.map((f) => (
            <span
              key={f}
              className="rounded-full px-3 py-1.5 text-[11.5px]"
              style={{ border: '1px solid rgba(212,175,106,0.25)', color: '#d8cfb4' }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="pb-10" />
    </main>
  )
}
