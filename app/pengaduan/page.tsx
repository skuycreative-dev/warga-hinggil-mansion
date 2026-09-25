import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ComplaintForm from '@/components/ComplaintForm'
import ComplaintItem from '@/components/ComplaintItem'

export default async function PengaduanPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: complaints } = await supabase
    .from('complaints')
    .select('id, title, description, category, status, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Layanan Warga</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Pengaduan
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Laporkan keluhan seputar kebersihan, keamanan, atau fasilitas perumahan.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <ComplaintForm />
        </div>

        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Pengaduan Saya
        </div>

        {complaints && complaints.length > 0 ? (
          <div className="flex flex-col gap-3">
            {complaints.map((c) => (
              <ComplaintItem key={c.id} item={c} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada pengaduan yang kamu buat.
          </p>
        )}
      </div>
    </main>
  )
}
