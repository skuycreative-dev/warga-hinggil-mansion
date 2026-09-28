import { NextResponse } from 'next/server'
import { getMyAccess } from '@/lib/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildBackup, backupFileName } from '@/lib/backup'
import { XLSX_TYPE } from '@/lib/xlsx'
import { logAdminAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Unduh backup seluruh data (khusus Superadmin yang sudah memasukkan kode 2FA)
export async function GET() {
  const access = await getMyAccess()
  if (!access.isSuperadmin) return NextResponse.json({ error: 'Hanya Superadmin.' }, { status: 403 })

  const { data: allowed } = await createAdminClient().rpc('hit_rate_limit', { p_key: `backup:${access.userId}`, p_max: 10, p_window_seconds: 3600 })
  if (allowed === false) return NextResponse.json({ error: 'Maksimal 10 kali unduh backup per jam.' }, { status: 429 })

  const { bytes, rowCount, tables } = await buildBackup()
  const name = backupFileName()
  await logAdminAction(access.userId, 'lihat', 'backup', null, `Mengunduh backup data (${tables} tabel, ${rowCount} baris)`)

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': XLSX_TYPE,
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  })
}