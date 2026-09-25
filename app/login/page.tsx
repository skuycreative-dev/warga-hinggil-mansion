'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { loginUser } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState = { error: null as string | null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={72}
            height={72}
            className="rounded-md"
          />
          <h1 className="text-xl font-semibold">Masuk</h1>
        </div>

        {state?.error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{state.error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Memproses...' : 'Masuk'}
        </Button>

        <p className="text-center text-sm">
          Belum punya akun?{' '}
          <a href="/register" className="underline">
            Daftar
          </a>
        </p>
      </form>
    </main>
  )
}
