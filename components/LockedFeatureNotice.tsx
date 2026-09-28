'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FeatureLockedModal from '@/components/FeatureLockedModal'
import { featureLabel, LOCKED_BY_SUPERADMIN } from '@/lib/features'

// Muncul saat pengguna diarahkan ke Beranda karena membuka fitur yang dinonaktifkan Superadmin.
export default function LockedFeatureNotice({ featureKey }: { featureKey: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(!!featureKey)

  useEffect(() => {
    setOpen(!!featureKey)
  }, [featureKey])

  if (!featureKey) return null
  const modal = LOCKED_BY_SUPERADMIN(featureLabel(featureKey))

  return (
    <FeatureLockedModal
      open={open}
      onClose={() => {
        setOpen(false)
        router.replace('/dashboard')
      }}
      title={modal.title}
      message={modal.message}
    />
  )
}