import { createAdminClient } from '@/lib/supabase/admin'

// Catat aksi admin yang dijalankan lewat server (service role), mis. buat/hapus akun, reset 2FA, backup.
// Perubahan lewat akun pengguna biasa sudah dicatat otomatis oleh database (Step 353).
// Tidak pernah menggagalkan aksi utama kalau pencatatan bermasalah.
export async function logAdminAction(
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  summary: string,
  details?: Record<string, unknown>
) {
  try {
    await createAdminClient().rpc('log_admin_action', {
      p_actor: actorId,
      p_action: action.slice(0, 60),
      p_entity: entity.slice(0, 60),
      p_entity_id: entityId ? entityId.slice(0, 80) : null,
      p_summary: summary.slice(0, 300),
      p_details: details ?? null,
    })
  } catch (err) {
    console.error('[audit] gagal mencatat', err)
  }
}