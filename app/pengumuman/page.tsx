import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function PengumumanPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Info Resmi
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Pengumuman
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-bold"
            style={{ color: '#9c7a3f' }}
          >
            Beranda
          </Link>
        </div>

        {announcements && announcements.length > 0 ? (
          <div className="flex flex-col gap-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl px-5 py-5 md:px-6 md:py-6"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="mt-1.5 text-base font-bold md:text-lg" style={{ color: '#1f1a10' }}>
                  {item.title}
                </div>
                <div className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#5b543f' }}>
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada pengumuman saat ini.
          </p>
        )}
      </div>
    </main>
  )
}
