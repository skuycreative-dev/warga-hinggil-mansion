import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { displayName } from '@/lib/display-name'
import NewRequestForm from '@/components/layanan/NewRequestForm'
import LetterheadCard from '@/components/layanan/LetterheadCard'
import { LAYANAN_STATUS, categoryLabel } from '@/lib/layanan'

export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'aktif', label: 'Perlu dilayani' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'semua', label: 'Semua' },
]

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

function ago(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'baru saja'
  if (min < 60) return `${min} mnt`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} jam`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default async function LayananPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const access = await getMyAccess()
  const { f } = await searchParams
  const filter = FILTERS.some((x) => x.key === f) ? (f as string) : 'aktif'
  const supabase = await createClient()
  const staff = access.isServiceStaff

  // Database: warga hanya menerima permintaannya sendiri; Pengurus menerima semua
  let q = supabase
    .from('service_requests')
    .select('id, requester_id, category, subject, status, last_message_at, last_message_by, created_at, house:houses(nomor_rumah)')
    .order('last_message_at', { ascending: false })
    .limit(300)
  if (staff && filter === 'aktif') q = q.in('status', ['baru', 'diproses'])
  if (staff && filter === 'selesai') q = q.in('status', ['selesai', 'dibatalkan'])
  if (!staff) q = q.eq('requester_id', access.userId)

  const [{ data: rows }, { data: reads }] = await Promise.all([
    q,
    supabase.from('service_request_reads').select('request_id, read_at').eq('user_id', access.userId),
  ])

  const readMap = new Map((reads ?? []).map((r: any) => [r.request_id as string, r.read_at as string]))
  const requesterIds = Array.from(new Set((rows ?? []).map((r: any) => r.requester_id as string)))
  const { data: people } = staff && requesterIds.length ? await supabase.from('profiles').select('id, full_name, nickname').in('id', requesterIds) : { data: [] as any[] }
  const nameMap = new Map((people ?? []).map((p: any) => [p.id as string, displayName(p)]))

  const items = (rows ?? []).map((r: any) => {
    const readAt = readMap.get(r.id)
    const unread = r.last_message_by && r.last_message_by !== access.userId && (!readAt || new Date(readAt) < new Date(r.last_message_at))
    return { ...r, house: one<any>(r.house)?.nomor_rumah ?? null, unread: !!unread }
  })

  let counts: Record<string, number> = {}
  if (staff) {
    const { data: all } = await supabase.from('service_requests').select('status').limit(5000)
    counts = (all ?? []).reduce((acc: Record<string, number>, r: any) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})
  }

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:py-14">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{staff ? 'Kotak Masuk Pengurus' : 'Pengurus Paguyuban'}</span>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
              Layanan Surat
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
              {staff
                ? 'Permintaan surat & pertanyaan warga. Balas, lalu kirim surat yang sudah ditandatangani (PDF/foto) langsung di percakapan.'
                : 'Ajukan surat domisili, pengantar, dan keperluan lain langsung ke Ketua & Sekretaris Paguyuban, tanpa perlu bertemu.'}
            </p>
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Beranda</Link>
        </div>

        {staff ? (
          <div className="mb-5 grid grid-cols-3 gap-2">
            {(['baru', 'diproses', 'selesai'] as const).map((s) => (
              <div key={s} className="rounded-xl px-3 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
                <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: LAYANAN_STATUS[s].color }}>{LAYANAN_STATUS[s].label}</div>
                <div className="text-xl font-bold" style={{ color: '#1f1a10' }}>{counts[s] ?? 0}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <NewRequestForm />
          </div>
        )}

        {staff ? <LetterheadCard /> : null}

        {staff ? (
          <nav className="mb-4 flex gap-1.5" aria-label="Filter">
            {FILTERS.map((x) => (
              <Link
                key={x.key}
                href={`/layanan?f=${x.key}`}
                className="rounded-full px-3.5 py-1.5 text-[12.5px] font-bold"
                style={filter === x.key ? { background: 'var(--brand-theme)', color: 'var(--brand-accent)' } : { background: '#ffffff', color: '#5b543f', border: '1px solid rgba(26,19,5,0.1)' }}
              >
                {x.label}
              </Link>
            ))}
          </nav>
        ) : null}

        {items.length === 0 ? (
          <div className="rounded-2xl px-5 py-8 text-center text-sm" style={{ background: '#ffffff', color: '#5b543f' }}>
            {staff ? 'Tidak ada permintaan di sini.' : 'Belum ada permintaan. Tekan tombol di atas untuk mulai.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((r: any) => {
              const st = LAYANAN_STATUS[r.status] ?? LAYANAN_STATUS.baru
              return (
                <Link
                  key={r.id}
                  href={`/layanan/${r.id}`}
                  className="flex items-start justify-between gap-3 rounded-2xl px-4 py-3.5 transition hover:-translate-y-0.5"
                  style={{ background: '#ffffff', border: r.unread ? '1.5px solid #d4a53a' : '1px solid rgba(26,19,5,0.08)' }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <span className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{categoryLabel(r.category)}</span>
                    </div>
                    <div className="mt-1 truncate text-[14px] font-bold" style={{ color: '#1f1a10' }}>{r.subject}</div>
                    {staff ? (
                      <div className="text-[12px]" style={{ color: '#5b543f' }}>
                        {nameMap.get(r.requester_id) ?? 'Warga'}
                        {r.house ? ` · Rumah ${r.house}` : ''}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px]" style={{ color: '#9c7a3f' }}>{ago(r.last_message_at)}</span>
                    {r.unread ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: '#b3392f' }}>BARU</span> : null}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}