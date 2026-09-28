import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBackup, backupFileName } from '@/lib/backup'
import { XLSX_TYPE } from '@/lib/xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const KEEP = 8

function sameSecret(a: string, b: string) {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

// Backup otomatis mingguan: dipanggil jadwal database (pg_cron) dengan kunci rahasia yang dibuat database sendiri
export async function POST(request: Request) {
  const secret = request.headers.get('x-backup-secret') ?? ''
  if (!secret || secret.length > 200) return NextResponse.json({ ok: false }, { status: 401 })

  const admin = createAdminClient()
  const { data: cfg } = await admin.from('private_config').select('value').eq('key', 'backup_secret').maybeSingle()
  if (!cfg?.value || !sameSecret(secret, cfg.value as string)) return NextResponse.json({ ok: false }, { status: 401 })

  // Cegah dobel: maksimal 1 backup otomatis per 6 jam
  const since = new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  const { data: recent } = await admin.from('backup_runs').select('id').eq('kind', 'otomatis').gte('created_at', since).limit(1)
  if (recent?.length) return NextResponse.json({ ok: true, skipped: true })

  try {
    const { bytes, rowCount, tables } = await buildBackup()
    const path = `otomatis/${backupFileName()}`
    const { error } = await admin.storage.from('backups').upload(path, bytes, { contentType: XLSX_TYPE, upsert: true })
    if (error) throw new Error('upload')
    await admin.from('backup_runs').insert({ kind: 'otomatis', path, size_bytes: bytes.length, row_count: rowCount, status: 'selesai', note: `${tables} tabel` })
    await admin.rpc('log_admin_action', {
      p_actor: null,
      p_action: 'tambah',
      p_entity: 'backup',
      p_entity_id: null,
      p_summary: `Backup otomatis mingguan (${tables} tabel, ${rowCount} baris)`,
      p_details: null,
    })

    // Simpan 8 backup otomatis terakhir saja
    const { data: old } = await admin.from('backup_runs').select('id, path').eq('kind', 'otomatis').order('created_at', { ascending: false }).range(KEEP, KEEP + 50)
    if (old?.length) {
      const paths = old.map((o) => o.path as string).filter(Boolean)
      if (paths.length) await admin.storage.from('backups').remove(paths)
      await admin.from('backup_runs').delete().in('id', old.map((o) => o.id as string))
    }
    return NextResponse.json({ ok: true, rows: rowCount })
  } catch {
    await admin.from('backup_runs').insert({ kind: 'otomatis', status: 'gagal', note: 'Backup otomatis gagal dibuat' })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}