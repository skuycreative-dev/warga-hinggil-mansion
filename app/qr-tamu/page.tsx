import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GuestInviteForm from '@/components/GuestInviteForm'
import GuestVisitItem from '@/components/GuestVisitItem'

export default async function QrTamuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: visits } = await supabase
    .from('guest_visits')
    .select('id, guest_name, purpose, visit_code, status, created_at, checked_in_at')
    .eq('invited_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Keamanan</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              QR Tamu
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              Buat kode tamu, berikan ke tamu, lalu tunjukkan ke Security saat tiba.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        <div className="mb-6">
          <GuestInviteForm />
        </div>

        <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
          Riwayat Tamu Saya
        </div>

        {visits && visits.length > 0 ? (
          <div className="flex flex-col gap-3">
            {visits.map((v) => (
              <GuestVisitItem key={v.id} item={v} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada tamu yang kamu undang.
          </p>
        )}
      </div>
    </main>
  )
}
