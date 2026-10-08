import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { adminNavFor } from '@/lib/admin-nav'
import AdminLayout from '@/components/admin/AdminLayout'

export const dynamic = 'force-dynamic'

function when(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function size(n: number | null) {
  if (!n) return '-'
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`
}

export default async function BackupPage() {
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

  const supabase = await createClient()
  const { data: runs } = await supabase.from('backup_runs').select('id, created_at, kind, path, size_bytes, row_count, status, note').order('created_at', { ascending: false }).limit(20)
  const paths = (runs ?? []).map((r: any) => r.path as string | null).filter(Boolean) as string[]
  const { data: signed } = paths.length ? await supabase.storage.from('backups').createSignedUrls(paths, 10 * 60, { download: true }) : { data: [] as any[] }
  const urlMap = new Map(((signed ?? []) as any[]).filter((s) => s?.path && s?.signedUrl).map((s) => [s.path as string, s.signedUrl as string]))
  const lastOk = (runs ?? []).find((r: any) => r.kind === 'otomatis' && r.status === 'selesai')

  return (
    <AdminLayout portalLabel="Portal Admin" roleLabel={access.roleLabel} userName={access.fullName} navItems={adminNavFor(access)}>
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Superadmin</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Backup Data
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>
          Seluruh data aplikasi dalam satu file Excel (satu sheet per tabel). File berisi data pribadi warga (NIK, nomor HP): simpan di tempat aman
          dan jangan dibagikan.
        </p>
      </div>

      <section className="mb-6 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Unduh backup sekarang</div>
        <p className="mt-1 text-[12.5px]" style={{ color: '#5b543f' }}>Butuh beberapa detik. Setiap unduhan tercatat di Log Aktivitas Admin.</p>
        <a href="/api/backup/unduh" className="mt-3 inline-block rounded-xl px-5 py-3 text-[13.5px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
          Unduh Backup (.xlsx)
        </a>
      </section>

      <section className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Backup otomatis mingguan</div>
        <p className="mt-1 text-[12.5px]" style={{ color: '#5b543f' }}>
          Dibuat otomatis setiap Minggu pukul 02.00 WIB, 8 backup terakhir disimpan.{' '}
          {lastOk ? `Terakhir berhasil: ${when(lastOk.created_at as string)}.` : 'Belum ada backup otomatis (akan dibuat Minggu ini).'}
        </p>
        <div className="mt-3 flex flex-col">
          {(runs ?? []).length === 0 ? <p className="text-[12.5px]" style={{ color: '#9c7a3f' }}>Belum ada riwayat backup.</p> : null}
          {(runs ?? []).map((r: any) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
              <div className="text-[12.5px]" style={{ color: '#1f1a10' }}>
                <b>{when(r.created_at)}</b> · {r.kind === 'otomatis' ? 'Otomatis' : 'Manual'}
                <div style={{ color: r.status === 'gagal' ? '#b3392f' : '#5b543f' }}>
                  {r.status === 'gagal' ? r.note ?? 'Gagal' : `${r.row_count ?? 0} baris · ${size(r.size_bytes)}${r.note ? ` · ${r.note}` : ''}`}
                </div>
              </div>
              {r.path && urlMap.get(r.path) ? (
                <a href={urlMap.get(r.path)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}>
                  Unduh
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  )
}