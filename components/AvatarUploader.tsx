'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage, extFor, isImage } from '@/lib/image-upload'
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

    if (!isImage(file)) {
      setError('File harus berupa foto.')
      return
    }
    setError(null)

    const supabase = createClient()

    startTransition(async () => {
      // Foto profil dikompres otomatis (maks 2 MB, 800 px) supaya aplikasi tetap ringan
      let blob: Blob
      try {
        blob = await compressImage(file, { maxSize: 800 })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Foto tidak bisa diproses.')
        return
      }
      const path = `${userId}/avatar.${extFor(blob.type)}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, blob, { upsert: true, contentType: blob.type })

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
        <Label htmlFor="avatar">Ganti Foto Profil (dikompres otomatis)</Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isPending}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isPending && <p className="text-sm text-muted-foreground">Mengunggah...</p>}
    </div>
  )
}