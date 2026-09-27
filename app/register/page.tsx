import { createClient } from '@/lib/supabase/server'
import { listHousesWithKepala } from '@/lib/household'
import RegisterForm from '@/components/RegisterForm'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const supabase = await createClient()
  const houses = await listHousesWithKepala(supabase)
  return <RegisterForm houses={houses} />
}