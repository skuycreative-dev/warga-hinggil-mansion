'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AvatarUploader({
  userId,
  currentAvatarUrl,
}: {
  userId: string
  currentAvatarUrl: string | null
}) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('File harus berformat JPG atau PNG.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file maksimal 2MB.')
      return
    }
    setError(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    startTransition(async () => {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError(`Gagal upload: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)

      if (updateError) {
        setError(`Gagal simpan ke profil: ${updateError.message}`)
        return
      }

      setPreview(avatarUrl)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Foto profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-xs text-muted-foreground">
            Belum ada foto
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Ganti Foto Profil (JPG/PNG, maks 2MB)</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={isPending}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isPending && <p className="text-sm text-muted-foreground">Mengunggah...</p>}
    </div>
  )
}
