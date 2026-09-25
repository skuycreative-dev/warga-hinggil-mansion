import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TukangForm from '@/components/TukangForm'

export default async function TukangPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isManajemen = !!profile && ['manajemen', 'superadmin'].includes(profile.role)

  const { data: tukangList } = await supabase
    .from('tukang_catalog')
    .select('id, name, specialty, phone, description')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rekomendasi Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Katalog Tukang
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isManajemen ? (
              <Link href="/tukang/kelola" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Kelola</Link>
            ) : null}
            <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
          </div>
        </div>

        <div className="mb-6">
          <TukangForm />
        </div>

        {tukangList && tukangList.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {tukangList.map((t) => (
              <div key={t.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{t.name}</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: 'rgba(212,175,106,0.18)', color: '#9c7a3f' }}
                  >
                    {t.specialty}
                  </span>
                </div>
                {t.description ? (
                  <p className="mt-1.5 text-[12.5px] font-medium" style={{ color: '#5b543f' }}>{t.description}</p>
                ) : null}
                <a
                  href={`https://wa.me/62${t.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold"
                  style={{ color: '#2f8a4f' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
                  </svg>
                  {t.phone}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada tukang direkomendasikan.
          </p>
        )}
      </div>
    </main>
  )
}
