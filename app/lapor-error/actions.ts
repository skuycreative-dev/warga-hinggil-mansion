'use server'

import { createClient } from '@/lib/supabase/server'

// Dipanggil halaman error (app/error.tsx) saat tampilan crash di browser pengguna.
// Hanya untuk pengguna yang sudah login (dicek juga oleh aturan database error_logs).
export async function reportClientError(input: { message: string; digest?: string; path?: string }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('error_logs').insert({
      level: 'error',
      severity: 'error',
      module: 'tampilan',
      source: 'client',
      message: (input.message || 'Error tampilan').slice(0, 1000),
      context: JSON.stringify({ path: input.path ?? null, digest: input.digest ?? null, user_id: user.id }).slice(0, 2000),
      resolved: false,
    })
  } catch (err) {
    console.error('reportClientError gagal:', err)
  }
}