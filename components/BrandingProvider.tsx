'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_BRANDING, type Branding } from '@/lib/branding-types'

export type { Branding }

const BrandingContext = createContext<Branding>(DEFAULT_BRANDING)

export default function BrandingProvider({ value, children }: { value: Branding; children: React.ReactNode }) {
  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  return useContext(BrandingContext)
}

// Logo perumahan (bisa diganti Superadmin). Memakai <img> biasa supaya logo dari penyimpanan langsung tampil.
export function BrandLogo({ size, className = 'rounded-2xl object-cover', alt }: { size: number; className?: string; alt?: string }) {
  const b = useBranding()
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={b.logo_url} alt={alt ?? b.community_name} width={size} height={size} className={className} style={{ width: size, height: size }} decoding="async" />
  )
}