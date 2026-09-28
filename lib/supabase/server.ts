import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // aman diabaikan kalau dipanggil dari Server Component
          }
        },
      },
    }
  )

  // Lebih cepat: identitas pengguna diverifikasi dari tanda tangan token login (getClaims)
  // sehingga tidak perlu bertanya ke server Auth Supabase di setiap halaman.
  // Kalau proyek masih memakai kunci lama (HS256), getClaims otomatis kembali bertanya ke server.
  const originalGetUser = client.auth.getUser.bind(client.auth)
  client.auth.getUser = (async (jwt?: string) => {
    if (jwt) return originalGetUser(jwt)
    try {
      const { data, error } = await client.auth.getClaims()
      const c = data?.claims as Record<string, any> | undefined
      if (error || !c?.sub) return { data: { user: null }, error: error ?? null }
      return {
        data: {
          user: {
            id: c.sub as string,
            email: (c.email as string | undefined) ?? undefined,
            phone: (c.phone as string | undefined) ?? undefined,
            role: c.role as string | undefined,
            aud: (c.aud as string) ?? 'authenticated',
            app_metadata: (c.app_metadata as Record<string, any>) ?? {},
            user_metadata: (c.user_metadata as Record<string, any>) ?? {},
            is_anonymous: !!c.is_anonymous,
            created_at: '',
          },
        },
        error: null,
      }
    } catch {
      return originalGetUser()
    }
  }) as typeof client.auth.getUser

  return client
}