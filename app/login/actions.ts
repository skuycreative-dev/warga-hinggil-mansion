'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LoginState = { error: string | null }

export async function loginUser(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email atau password salah.' }
  }

  redirect('/dashboard')
}
