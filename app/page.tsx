'use client'

import { useState } from 'react'
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
  const [showDetail, setShowDetail] = useState(false)

  return (
    <main className="flex w-full flex-col">
      <section
        className="w-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(212,175,106,0.16) 0%, rgba(10,11,15,0) 60%), #0a0b0f',
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-14 pt-8 text-center md:px-10 md:pb-20 md:pt-12">
          <div className="mb-8 flex items-center gap-3 self-start md:self-center">
            <Image
              src="/logo-hinggil-mansion.jpg"
              alt="Hinggil Mansion"
              width={40}
              height={40}
              className="rounded-lg object-cover md:h-11 md:w-11"
            />
            <span
              className="text-base font-bold tracking-wide md:text-lg"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
            >
              HINGGIL MANSION
            </span>
          </div>

          <h1
            className="max-w-3xl text-[34px] font-bold leading-[1.15] md:text-[56px]"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#ffffff' }}
          >
            Komunitas Hinggil Mansion, dalam satu genggaman.
          </h1>
          <p
            className="mt-5 max-w-xl text-base font-medium leading-relaxed md:text-lg"
            style={{ color: '#c7c9d2' }}
          >
            Keamanan, komunikasi, dan kenyamanan seluruh warga menyatu dalam satu aplikasi.
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl px-10 py-4 text-center text-base font-bold sm:min-w-[168px]"
              style={{
                background: 'linear-gradient(180deg, #e6c98a 0%, #cda15a 100%)',
                color: '#1a1305',
                boxShadow: '0 10px 26px -10px rgba(205,161,90,0.6)',
              }}
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl px-10 py-4 text-center text-base font-bold sm:min-w-[168px]"
              style={{ border: '2px solid rgba(230,201,138,0.5)', color: '#f2e8d0' }}
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0' }}>
        <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-20">
          <div className="mb-7 flex flex-col items-center gap-3 text-center md:mb-9">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Fitur Warga
            </span>
            <h2
              className="text-2xl font-bold md:text-4xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Semua kebutuhan warga, satu aplikasi
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6 text-center md:py-8"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14"
                  style={{ background: '#1a1305' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.path} />
                  </svg>
                </div>
                <div className="text-[15px] font-bold md:text-base" style={{ color: '#1f1a10' }}>
                  {f.title}
                </div>
                {showDetail ? (
                  <div className="text-[13px] font-medium leading-snug md:text-sm" style={{ color: '#5b543f' }}>
                    {f.desc}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center md:mt-8">
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              className="rounded-full px-7 py-3 text-sm font-bold md:text-base"
              style={{ border: '2px solid #1a1305', color: '#1a1305', background: 'transparent' }}
            >
              {showDetail ? 'Sembunyikan Detail' : 'Lihat Detail Semua Fitur'}
            </button>
          </div>
        </div>
      </section>

      <section className="w-full" style={{ background: '#faf7f0', borderTop: '1px solid rgba(26,19,5,0.06)' }}>
        <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-2 md:px-10 md:pb-24">
          <div className="mb-5 text-center">
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Fasilitas
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 md:gap-3">
            {facilities.map((f) => (
              <span
                key={f}
                className="rounded-full px-5 py-2.5 text-sm font-bold md:text-base"
                style={{ border: '2px solid #1a1305', color: '#1a1305' }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
