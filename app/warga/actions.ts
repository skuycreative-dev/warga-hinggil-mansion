'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

export async function sendFriendRequest(addresseeId: string) {
  const { supabase, user } = await currentUser()
  if (user.id === addresseeId) return

  await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
  revalidatePath('/warga')
  revalidatePath(`/warga/${addresseeId}`)
}

export async function acceptFriendRequest(friendshipId: string) {
  const { supabase, user } = await currentUser()

  await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  revalidatePath('/warga')
  revalidatePath('/chat')
}

export async function rejectFriendRequest(friendshipId: string) {
  const { supabase, user } = await currentUser()

  await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  revalidatePath('/warga')
  revalidatePath('/chat')
}
