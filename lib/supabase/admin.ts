import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client ini pakai Service Role Key: bisa membuat/menghapus akun login (auth.users) dan
// melewati semua RLS. HANYA dipakai di server actions ('use server'), tidak pernah
// diimpor ke komponen client, dan SUPABASE_SERVICE_ROLE_KEY tidak boleh punya prefix
// NEXT_PUBLIC_ (kalau ada prefix itu, kuncinya akan ikut terkirim ke browser).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
