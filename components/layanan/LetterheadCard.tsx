'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isImage, toPngResized } from '@/lib/image-upload'
import { saveLetterhead } from '@/app/superadmin/identitas/actions'
import { useBranding } from '@/components/BrandingProvider'

// Kartu kop surat di halaman Layanan Surat -- supaya Ketua & Sekretaris Paguyuban juga bisa
// unggah/ganti/hapus/unduh kop surat resmi tanpa harus lewat Superadmin (Kebutuhan #4, 29 Sep 2026).
// Satu kop surat dipakai bersama (sama dengan yang ada di Superadmin -> Identitas Perumahan) dan
// otomatis dipakai sebagai header semua PDF Ekspor Laporan.
export default function LetterheadCard() {
  const router = useRouter()
  const brand = useBranding()
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function upload(file: File | undefined) {
    if (!file) return
    if (!isImage(file)) {
      setMsg({ ok: false, text: 'Kop surat harus gambar JPG, PNG, atau WEBP.' })
      return
    }
    setMsg(null)
    startTransition(async () => {
      try {
        const blob = await toPngResized(file, 2000, 6 * 1024 * 1024)
        const path = `letterhead-${Date.now()}.png`
        const { error } = await createClient().storage.from('branding').upload(path, blob, { contentType: blob.type, upsert: false })
        if (error) throw new Error('upload')
        const r = await saveLetterhead(path)
        setMsg(r.ok ? { ok: true, text: 'Kop surat diganti. Dipakai otomatis di PDF Ekspor Laporan.' } : { ok: false, text: r.error ?? 'Gagal.' })
        router.refresh()
      } catch {
        setMsg({ ok: false, text: 'Gagal mengunggah kop surat. Ukuran maksimal 6 MB.' })
      }
    })
  }

  return (
    <div className="mb-6 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="mb-1 text-[15px] font-bold" style={{ color: '#1f1a10' }}>Kop Surat</div>
      <p className="mb-3 text-[11.5px]" style={{ color: '#5b543f' }}>
        Kop surat siap pakai untuk perumahan ini -- dipakai otomatis di semua PDF Ekspor Laporan, dan bisa diunduh
        kosongan untuk dipakai bikin surat manual. Satu kop untuk semua, siapa pun (Superadmin, Ketua, Sekretaris)
        boleh menggantinya.
      </p>
      {brand.letterhead_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={brand.letterhead_url} alt="Kop surat saat ini" className="mb-3 w-full rounded-xl object-contain" style={{ maxHeight: 120, background: '#faf7f0', border: '1px solid rgba(26,19,5,0.08)' }} />
      ) : (
        <p className="mb-3 text-[12px] font-medium" style={{ color: '#9c7a3f' }}>Belum ada kop surat. Kop otomatis dari Identitas Perumahan tetap dipakai.</p>
      )}
      {msg ? (
        <p className="mb-3 text-[12px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>{msg.text}</p>
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        <button type="button" disabled={isPending} onClick={() => fileRef.current?.click()} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: '#e6c98a' }}>
          {isPending ? 'Memproses...' : brand.letterhead_url ? 'Ganti Kop Surat' : 'Unggah Kop Surat'}
        </button>
        {brand.letterhead_url ? (
          <>
            <a href={brand.letterhead_url} download="kop-surat-kosong.png" className="rounded-xl px-4 py-2.5 text-center text-[13px] font-bold" style={{ background: '#efe9db', color: '#1f1a10' }}>
              Unduh Kop Surat Kosong
            </a>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await saveLetterhead(null)
                  setMsg(r.ok ? { ok: true, text: 'Kop surat dihapus. Kop otomatis dipakai lagi.' } : { ok: false, text: r.error ?? 'Gagal.' })
                  router.refresh()
                })
              }
              className="text-[12px] font-bold"
              style={{ color: '#b3392f' }}
            >
              Hapus
            </button>
          </>
        ) : null}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
      </div>
    </div>
  )
}