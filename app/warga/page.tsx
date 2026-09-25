import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function WargaDirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  const [{ data: allProfiles }, { data: myFriendships }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, family_role, house:houses(nomor_rumah)')
      .neq('id', userId)
      .order('full_name', { ascending: true }),
    supabase
      .from('friendships')
      .select('id, requester_id, addressee_id, status')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
  ])

  const pendingReceived = (myFriendships ?? []).filter((f) => f.status === 'pending' && f.addressee_id === userId)

  function friendLabel(profileId: string): string | null {
    const f = (myFriendships ?? []).find((fr) => fr.requester_id === profileId || fr.addressee_id === profileId)
    if (!f) return null
    if (f.status === 'accepted') return 'Berteman'
    if (f.requester_id === userId) return 'Menunggu'
    return 'Minta Berteman'
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Komunitas</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Warga Hinggil Mansion
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {pendingReceived.length > 0 ? (
          <div
            className="mb-6 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(212,175,106,0.12)', border: '1px solid rgba(212,175,106,0.35)' }}
          >
            <span className="text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>
              {pendingReceived.length} permintaan pertemanan menunggu konfirmasi kamu
            </span>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5">
          {(allProfiles ?? []).map((p: any) => {
            const label = friendLabel(p.id)
            return (
              <Link
                key={p.id}
                href={`/warga/${p.id}`}
                className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition hover:-translate-y-0.5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: '#e8e2d0' }}
                >
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatar_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: '#9c7a3f' }}>{(p.full_name ?? '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{p.full_name ?? 'Warga'}</div>
                  <div className="text-[11.5px] font-medium" style={{ color: '#9c7a3f' }}>
                    {p.house?.nomor_rumah ? `Rumah ${p.house.nomor_rumah}` : 'Belum ada rumah'}
                  </div>
                </div>
                {label ? (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: label === 'Berteman' ? 'rgba(47,138,79,0.12)' : 'rgba(212,175,106,0.18)',
                      color: label === 'Berteman' ? '#2f8a4f' : '#9c7a3f',
                    }}
                  >
                    {label}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
