import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GuestInviteForm from '@/components/GuestInviteForm'

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  checked_in: 'Sudah Masuk',
  checked_out: 'Sudah Keluar',
}

const statusColor: Record<string, string> = {
  pending: '#9c7a3f',
  checked_in: '#2f8a4f',
  checked_out: '#6d6f7a',
}

export default async function QrTamuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('house_id')
    .eq('id', user.id)
    .maybeSingle()

  const { data: guests } = await supabase
    .from('guest_visits')
    .select('id, guest_name, visit_date, purpose, status, qr_code, created_at')
    .eq('house_id', profile?.house_id ?? '')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-lg px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest md:text-sm" style={{ color: '#9c7a3f' }}>
              Akses Kawasan
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              QR Tamu
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Beranda
          </Link>
        </div>

        <GuestInviteForm />

        <div className="mt-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Riwayat Undangan
          </div>

          {guests && guests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {guests.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center gap-4 rounded-2xl px-5 py-4"
                  style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${g.qr_code}`}
                    alt={`QR ${g.guest_name}`}
                    width={72}
                    height={72}
                    style={{ borderRadius: 8, flexShrink: 0 }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                      {g.guest_name}
                    </div>
                    <div className="text-[11.5px] font-medium" style={{ color: '#8a8c96' }}>
                      {new Date(g.visit_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {g.purpose ? ` · ${g.purpose}` : ''}
                    </div>
                    <div className="mt-1 text-[11.5px] font-mono font-bold" style={{ color: '#5b543f' }}>
                      Kode: {g.qr_code}
                    </div>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.04)', color: statusColor[g.status] ?? '#5b543f' }}
                  >
                    {statusLabel[g.status] ?? g.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium" style={{ color: '#5b543f' }}>
              Belum ada undangan tamu.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
