import { unstable_cache } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_BRANDING, brandingLogoUrl, type Branding } from '@/lib/branding-types'

export { DEFAULT_BRANDING, brandingLogoUrl, type Branding }

// Identitas perumahan (white label). Diatur Superadmin di menu Identitas Perumahan (Step 353).
async function fetchBranding(): Promise<Branding> {
  try {
    // Data publik: dibaca tanpa sesi login supaya bisa disimpan di cache server
    const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data } = await supabase.from('app_branding').select('*').eq('id', 1).maybeSingle()
    if (!data) return DEFAULT_BRANDING
    return {
      community_name: data.community_name ?? DEFAULT_BRANDING.community_name,
      app_name: data.app_name ?? DEFAULT_BRANDING.app_name,
      short_name: data.short_name ?? DEFAULT_BRANDING.short_name,
      tagline: data.tagline ?? null,
      logo_url: brandingLogoUrl(data.logo_path),
      theme_color: data.theme_color ?? DEFAULT_BRANDING.theme_color,
      accent_color: data.accent_color ?? DEFAULT_BRANDING.accent_color,
      contact_whatsapp: data.contact_whatsapp ?? null,
      contact_email: data.contact_email ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      version: data.updated_at ? String(new Date(data.updated_at).getTime()) : '0',
    }
  } catch {
    return DEFAULT_BRANDING
  }
}

// Disimpan 5 menit di server; langsung diperbarui saat Superadmin menyimpan perubahan
export const getBranding = unstable_cache(fetchBranding, ['app-branding-v1'], { tags: ['branding'], revalidate: 300 })