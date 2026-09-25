'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import { registerUser } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const initialState = { error: null as string | null }

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState)

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo-hinggil-mansion.jpg"
            alt="Hinggil Mansion"
            width={72}
            height={72}
            className="rounded-md"
          />
          <h1 className="text-xl font-semibold">Daftar Warga Hinggil Mansion</h1>
        </div>

        {state?.error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">{state.error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name">Nama Lengkap</Label>
          <Input id="full_name" name="full_name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" minLength={6} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor HP</Label>
          <Input id="phone" name="phone" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nomor_rumah">Nomor Rumah</Label>
          <Input id="nomor_rumah" name="nomor_rumah" placeholder="Contoh: D6" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="family_role">Peran dalam Keluarga</Label>
          <Select name="family_role" defaultValue="anggota_keluarga">
            <SelectTrigger id="family_role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kepala_keluarga">Kepala Keluarga</SelectItem>
              <SelectItem value="anggota_keluarga">Anggota Keluarga</SelectItem>
              <SelectItem value="asisten_rumah_tangga">Asisten Rumah Tangga</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Memproses...' : 'Daftar'}
        </Button>

        <p className="text-center text-sm">
          Sudah punya akun?{' '}
          <a href="/login" className="underline">
            Masuk
          </a>
        </p>
      </form>
    </main>
  )
}
