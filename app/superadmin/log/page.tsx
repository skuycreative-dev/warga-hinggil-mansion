import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

const PAGE = 100
const ACTION_STYLE: Record<string, { bg: string; color: string }> = {
  tambah: { bg: 'rgba(47,107,79,0.12)', color: '#2f6b4f' },
  ubah: { bg: 'rgba(59,91,138,0.12)', color: '#3b5b8a' },
  hapus: { bg: 'rgba(179,57,47,0.1)', color: '#b3392f' },
  lihat: { bg: 'rgba(212,175,106,0.22)', color: '#7a5a1f' },
}

function when(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function detailText(d: unknown): string {
  if (!d || typeof d !== 'object') return ''
  return Object.entries(d as Record<string, unknown>)
    .slice(0, 8)
    .map(([k, v]) => {
      if (v && typeof v === 'object' && 'dari' in (v as object) && 'jadi' in (v as object)) {
        const x = v as { dari: unknown; jadi: unknown }
        return `${k}: ${String(x.dari)} → ${String(x.jadi)}`
      }
      return `${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v).slice(0, 80)}`
    })
    .join(' · ')
}

export default async function LogAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; jenis?: string; hal?: string }> }) {
  const access = await getMyAccess()
  if (!access.isSuperadmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold" style={{ color: '#1f1a10' }}>Akses Ditolak</h1>
          <p className="mt-2 text-sm" style={{ color: '#5b543f' }}>Halaman ini khusus Superadmin.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const sp = await searchParams
  const q = (sp.q ?? '').trim().slice(0, 60)
  const jenis = ['tambah', 'ubah', 'hapus', 'lihat', 'akun', 'backup', 'keamanan'].includes(sp.jenis ?? '') ? sp.jenis! : ''
  const hal = Math.max(1, Math.min(50, Number(sp.hal) || 1))

  const supabase = await createClient()
  let query = supabase
    .from('admin_audit_logs')
    .select('id, created_at, actor_name, actor_role, action, entity, summary, details', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((hal - 1) * PAGE, hal * PAGE - 1)
  if (jenis) query = ['tambah', 'ubah', 'hapus', 'lihat'].includes(jenis) ? query.eq('action', jenis) : query.eq('entity', jenis)
  if (q) {
    const safe = q.replace(/[%,()]/g, ' ')
    query = query.or(`summary.ilike.%${safe}%,actor_name.ilike.%${safe}%,entity.ilike.%${safe}%`)
  }
  const { data: rows, count } = await query
  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE))
  const qs = (h: number) => `/superadmin/log?${new URLSearchParams({ ...(q ? { q } : {}), ...(jenis ? { jenis } : {}), hal: String(h) }).toString()}`

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Log Aktivitas Admin
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Siapa mengubah apa dan kapan. Log disimpan 2 tahun dan tidak bisa diubah atau dihapus dari aplikasi. Total {total.toLocaleString('id-ID')} catatan.
        </p>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" action="/superadmin/log">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama admin / isi aktivitas"
          aria-label="Cari"
          className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[16px]"
          style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}
        />
        <select name="jenis" defaultValue={jenis} aria-label="Jenis" className="rounded-xl px-3 py-2.5 text-[14px]" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}>
          <option value="">Semua jenis</option>
          <option value="tambah">Tambah</option>
          <option value="ubah">Ubah</option>
          <option value="hapus">Hapus</option>
          <option value="lihat">Lihat data pribadi</option>
          <option value="akun">Akun</option>
          <option value="keamanan">Keamanan</option>
          <option value="backup">Backup</option>
        </select>
        <button type="submit" className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
          Cari
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {(rows ?? []).length === 0 ? (
          <p className="rounded-2xl px-5 py-8 text-center text-sm" style={{ background: '#ffffff', color: '#5b543f' }}>Belum ada catatan.</p>
        ) : null}
        {(rows ?? []).map((r: any) => {
          const st = ACTION_STYLE[r.action] ?? { bg: '#faf7f0', color: '#5b543f' }
          return (
            <div key={r.id} className="rounded-2xl px-4 py-3" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase" style={{ background: st.bg, color: st.color }}>{r.action}</span>
                <b style={{ color: '#1f1a10' }}>{r.actor_name ?? 'Sistem'}</b>
                <span style={{ color: '#9c7a3f' }}>{r.actor_role ?? ''}</span>
                <span className="ml-auto tabular-nums" style={{ color: '#5b543f' }}>{when(r.created_at)}</span>
              </div>
              <div className="mt-1 text-[13px] font-semibold" style={{ color: '#1f1a10' }}>{r.summary ?? r.entity}</div>
              {r.details ? <div className="mt-0.5 break-words text-[11.5px]" style={{ color: '#5b543f' }}>{detailText(r.details)}</div> : null}
            </div>
          )
        })}
      </div>

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-[13px] font-bold">
          {hal > 1 ? <Link href={qs(hal - 1)} style={{ color: '#9c7a3f' }}>← Lebih baru</Link> : <span />}
          <span style={{ color: '#5b543f' }}>Halaman {hal} / {pages}</span>
          {hal < pages ? <Link href={qs(hal + 1)} style={{ color: '#9c7a3f' }}>Lebih lama →</Link> : <span />}
        </div>
      ) : null}
    </AdminLayout>
  )
}