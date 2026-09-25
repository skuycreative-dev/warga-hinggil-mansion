import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AvatarUploader from '@/components/AvatarUploader'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, family_role, account_status, avatar_url, house_id')
    .eq('id', user.id)
    .single()

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-semibold">Profil Saya</h1>

      <AvatarUploader userId={user.id} currentAvatarUrl={profile?.avatar_url ?? null} />

      <div className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Nama:</span> {profile?.full_name}
        </p>
        <p>
          <span className="text-muted-foreground">No. HP:</span> {profile?.phone}
        </p>
        <p>
          <span className="text-muted-foreground">Peran Keluarga:</span> {profile?.family_role}
        </p>
        <p>
          <span className="text-muted-foreground">Status Akun:</span> {profile?.account_status}
        </p>
      </div>
    </main>
  )
}
