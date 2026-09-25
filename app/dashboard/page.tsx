import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, family_role, account_status, house_id')
    .eq('id', user.id)
    .single()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Selamat datang, {profile?.full_name}</h1>
      <p className="mt-2 text-muted-foreground">Role sistem: {profile?.role}</p>
      <p className="text-muted-foreground">Peran keluarga: {profile?.family_role}</p>
      <p className="text-muted-foreground">Status akun: {profile?.account_status}</p>
      <p className="text-muted-foreground">House ID: {profile?.house_id}</p>
    </main>
  )
}
