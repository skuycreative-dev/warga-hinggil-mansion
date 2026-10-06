'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { clientIp, hashKey } from '@/lib/security'

// Dipanggil halaman error (app/error.tsx) saat tampilan crash di browser pengguna.
// Pengguna yang sudah login dicatat atas namanya. Pengunjung yang BELUM login (mis. halaman login
// crash di laptop) juga dicatat lewat jalur khusus -- dibatasi 10 laporan/jam per jaringan supaya
// tidak bisa dipakai membanjiri log IT Support.
export async function reportClientError(input: { message: string; digest?: string; path?: string; ua?: string }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const message = (input.message || 'Error tampilan').slice(0, 1000)
    const ua = typeof input.ua === 'string' ? input.ua.slice(0, 200) : null

    if (user) {
      await supabase.from('error_logs').insert({
        level: 'error',
        severity: 'error',
        module: 'tampilan',
        source: 'client',
        message,
        context: JSON.stringify({ path: input.path ?? null, digest: input.digest ?? null, user_id: user.id, ua }).slice(0, 2000),
        resolved: false,
      })
      return
    }

    const admin = createAdminClient()
    const ip = await clientIp()
    const { data: allowed } = await admin.rpc('hit_rate_limit', {
      p_key: `clienterr:${hashKey('ip', ip || 'tanpa-ip')}`,
      p_max: 10,
      p_window_seconds: 3600,
    })
    if (allowed === false) return

    await admin.from('error_logs').insert({
      level: 'error',
      severity: 'error',
      module: 'tampilan',
      source: 'client',
      message: `[belum login] ${message}`.slice(0, 1000),
      context: JSON.stringify({ path: input.path ?? null, digest: input.digest ?? null, user_id: null, ua }).slice(0, 2000),
      resolved: false,
    })
  } catch (err) {
    console.error('reportClientError gagal:', err)
  }
}