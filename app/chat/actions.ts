'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function sendMessage(receiverId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed) return { error: 'Pesan tidak boleh kosong.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('chat_messages').insert({
    sender_id: user.id,
    receiver_id: receiverId,
    content: trimmed,
  })

  if (error) {
    return { error: 'Pesan gagal dikirim. Pastikan kalian sudah berteman.' }
  }

  return { error: null }
}

export async function markMessagesRead(senderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', user.id)
    .eq('is_read', false)
}
