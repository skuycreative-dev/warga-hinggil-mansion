import { createAdminClient } from '@/lib/supabase/admin'

// Catat error server ke tabel error_logs supaya muncul di dashboard IT Support.
// Tidak pernah melempar error lagi: kalau pencatatan gagal, aplikasi tetap jalan.
export async function logError(module: string, err: unknown, context?: Record<string, unknown>) {
  console.error(`[${module}]`, err)
  try {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err ?? 'Error tidak diketahui')
    const stack = err instanceof Error ? err.stack ?? null : null

    const admin = createAdminClient()
    await admin.from('error_logs').insert({
      level: 'error',
      severity: 'error',
      module,
      source: 'server',
      message: (message || 'Error tanpa pesan').slice(0, 1000),
      stack_trace: stack ? stack.slice(0, 4000) : null,
      context: context ? JSON.stringify(context).slice(0, 2000) : null,
      resolved: false,
    })
  } catch (logErr) {
    console.error('logError gagal mencatat:', logErr)
  }
}