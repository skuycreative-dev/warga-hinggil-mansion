import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listHousesWithKepala } from '@/lib/household'
import LengkapiProfilForm from '@/components/LengkapiProfilForm'

export const dynamic = 'force-dynamic'

export default async function LengkapiProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const houses = await listHousesWithKepala(supabase)
  return <LengkapiProfilForm houses={houses} />
}