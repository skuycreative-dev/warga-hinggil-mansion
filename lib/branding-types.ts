// Tipe & nilai bawaan identitas perumahan (white label, Step 353).
// Aman dipakai di komponen browser maupun server.
export type Branding = {
  community_name: string
  app_name: string
  short_name: string
  tagline: string | null
  logo_url: string
  theme_color: string
  accent_color: string
  contact_whatsapp: string | null
  contact_email: string | null
  address: string | null
  city: string | null
  version: string
}

export const DEFAULT_BRANDING: Branding = {
  community_name: 'Hinggil Mansion',
  app_name: 'Warga Hinggil Mansion',
  short_name: 'Hinggil Mansion',
  tagline: 'Komunitas warga, dalam satu genggaman.',
  logo_url: '/logo-hinggil-mansion.jpg',
  theme_color: '#0a0b0f',
  accent_color: '#e6c98a',
  contact_whatsapp: null,
  contact_email: null,
  address: null,
  city: null,
  version: '0',
}

export function brandingLogoUrl(logoPath: string | null | undefined) {
  if (!logoPath) return DEFAULT_BRANDING.logo_url
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
  return `${base}/storage/v1/object/public/branding/${encodeURIComponent(logoPath)}`
}