import Image from 'next/image'
import Link from 'next/link'

export default function AppHeader() {
  return (
    <header
      className="w-full"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0b0f' }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span
            className="text-sm font-bold tracking-wide md:text-base"
            style={{ fontFamily: 'var(--font-fraunces), serif', color: '#efe4c8' }}
          >
            HINGGIL MANSION
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-semibold md:gap-7 md:text-base">
          <Link href="/faq" style={{ color: '#c7c9d2' }}>
            FAQ
          </Link>
          <Link href="/syarat-ketentuan" style={{ color: '#c7c9d2' }}>
            Syarat &amp; Ketentuan
          </Link>
        </nav>
      </div>
    </header>
  )
}
