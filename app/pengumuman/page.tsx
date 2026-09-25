import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NotificationBell from '@/components/NotificationBell'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) {
    return `Hari ini, ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function PengumumanPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between md:mb-9">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
              Info Resmi
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Pengumuman
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
              Beranda
            </Link>
          </div>
        </div>

        {announcements && announcements.length > 0 ? (
          <div className="relative flex flex-col gap-5">
            {announcements.map((item, idx) => {
              const isFirst = idx === 0
              const isNew = Date.now() - new Date(item.created_at).getTime() < 1000 * 60 * 60 * 48
              return (
                <div key={item.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ background: isFirst ? '#d4af6a' : 'rgba(26,19,5,0.15)' }}
                    />
                    {idx < announcements.length - 1 ? (
                      <div style={{ width: 2, flex: 1, background: 'rgba(26,19,5,0.08)', marginTop: 4 }} />
                    ) : null}
                  </div>

                  <div
                    className="mb-1 flex-1 rounded-2xl px-5 py-4 md:px-6 md:py-5"
                    style={{
                      background: '#ffffff',
                      border: isFirst ? '1px solid rgba(212,175,106,0.4)' : '1px solid rgba(26,19,5,0.08)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9c7a3f' }}>
                        {formatDate(item.created_at)}
                      </span>
                      {isNew ? (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
                        >
                          Baru
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1.5 text-base font-bold md:text-lg" style={{ color: '#1f1a10' }}>
                      {item.title}
                    </div>
                    <div className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#5b543f' }}>
                      {item.content}
                    </div>
                  </div>
                </div>
              )
            })}
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
