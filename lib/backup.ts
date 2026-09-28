import { createAdminClient } from '@/lib/supabase/admin'
import { buildXlsx, type Cell, type Sheet } from '@/lib/xlsx'
import { getBranding } from '@/lib/branding'

// Tabel yang di-backup. Tabel teknis/rahasia server (kunci, batas percobaan, langganan push) sengaja tidak ikut.
const TABLES = [
  'profiles', 'houses', 'house_occupancy_history', 'house_absences', 'absence_patrol_plans', 'patrol_checks',
  'iuran_transactions', 'iuran_payment_status', 'ipl_settings', 'ipl_house_rates', 'ipl_disbursements',
  'announcements', 'announcement_comments', 'announcement_reactions', 'polls', 'poll_options', 'poll_votes',
  'complaints', 'service_requests', 'service_messages', 'emergency_alerts', 'emergency_events', 'emergency_contacts',
  'guest_visits', 'security_shifts', 'tukang_catalog', 'tukang_reviews', 'tukang_photos',
  'forum_posts', 'forum_comments', 'forum_likes', 'forum_reports', 'friendships', 'chat_messages',
  'family_items', 'household_accounts', 'household_transactions', 'household_debts', 'household_goals', 'household_goal_entries',
  'profile_change_requests', 'password_reset_requests', 'app_features', 'app_branding', 'site_plan', 'map_facilities',
  'faq_items', 'app_pages', 'admin_audit_logs', 'error_logs', 'backup_runs',
]
const MAX_ROWS = 50000

export async function buildBackup(): Promise<{ bytes: Uint8Array; rowCount: number; tables: number }> {
  const admin = createAdminClient()
  const brand = await getBranding()
  const sheets: Sheet[] = []
  const summary: Cell[][] = [['Tabel', 'Jumlah baris']]
  let rowCount = 0

  // Akun login (email) dari sistem Auth
  const users: Cell[][] = [['id', 'email', 'dibuat', 'login_terakhir', 'email_terkonfirmasi']]
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error || !data?.users?.length) break
    for (const u of data.users) users.push([u.id, u.email ?? '', u.created_at ?? '', u.last_sign_in_at ?? '', u.email_confirmed_at ? 'ya' : 'tidak'])
    if (data.users.length < 1000) break
  }
  sheets.push({ name: 'akun_login', rows: users })
  summary.push(['akun_login', users.length - 1])
  rowCount += users.length - 1

  for (const table of TABLES) {
    const rows: Record<string, unknown>[] = []
    let failed = false
    for (let from = 0; from < MAX_ROWS; from += 1000) {
      const { data, error } = await admin.from(table).select('*').range(from, from + 999)
      if (error) {
        failed = true
        break
      }
      rows.push(...((data ?? []) as Record<string, unknown>[]))
      if (!data || data.length < 1000) break
    }
    if (failed) continue
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
    const out: Cell[][] = [cols.length ? cols : ['(kosong)']]
    for (const r of rows) out.push(cols.map((c) => r[c] as Cell))
    sheets.push({ name: table, rows: out })
    summary.push([table, rows.length])
    rowCount += rows.length
  }

  const info: Sheet = {
    name: 'INFO',
    header: false,
    rows: [
      [`Backup data ${brand.app_name}`],
      ['Dibuat', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'],
      ['Isi', 'Satu sheet per tabel. Berisi data pribadi (NIK, nomor HP). Simpan di tempat aman, jangan dibagikan.'],
      [],
      ...summary,
    ],
  }
  return { bytes: buildXlsx([info, ...sheets]), rowCount, tables: sheets.length }
}

export function backupFileName(date = new Date()) {
  const d = new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 16).replace('T', '-').replace(':', '')
  return `backup-${d}.xlsx`
}