'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isImage } from '@/lib/image-upload'
import { saveBranding, saveLogo, saveLetterhead, type BrandingInput } from '@/app/superadmin/identitas/actions'
import { useBranding } from '@/components/BrandingProvider'

const field: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  color: '#1f1a10',
  fontSize: 16,
  width: '100%',
  outline: 'none',
}
const label = 'flex flex-col gap-1 text-[12px] font-bold'

async function toPng(file: File, max: number, maxBytes = 2 * 1024 * 1024): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('gambar'))
      img.src = url
    })
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob || blob.size > maxBytes) throw new Error('besar')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function BrandingForm({ initial }: { initial: BrandingInput }) {
  const router = useRouter()
  const brand = useBranding()
  const fileRef = useRef<HTMLInputElement>(null)
  const letterheadRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<BrandingInput>(initial)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = (k: keyof BrandingInput) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    startTransition(async () => {
      const r = await saveBranding(form)
      setMsg(r.ok ? { ok: true, text: 'Tersimpan. Nama & warna baru tampil di semua halaman.' } : { ok: false, text: r.error ?? 'Gagal.' })
      if (r.ok) router.refresh()
    })
  }

  function uploadLogo(file: File | undefined) {
    if (!file) return
    if (!isImage(file)) {
      setMsg({ ok: false, text: 'Logo harus gambar JPG, PNG, atau WEBP.' })
      return
    }
    setMsg(null)
    startTransition(async () => {
      try {
        // Logo disimpan sebagai PNG 512px supaya bisa dipakai juga di kop laporan PDF
        const blob = await toPng(file, 512)
        const path = `logo-${Date.now()}.png`
        const { error } = await createClient().storage.from('branding').upload(path, blob, { contentType: blob.type, upsert: false })
        if (error) throw new Error('upload')
        const r = await saveLogo(path)
        setMsg(r.ok ? { ok: true, text: 'Logo diganti.' } : { ok: false, text: r.error ?? 'Gagal.' })
        router.refresh()
      } catch {
        setMsg({ ok: false, text: 'Gagal mengunggah logo. Coba lagi.' })
      }
    })
  }

  function uploadLetterhead(file: File | undefined) {
    if (!file) return
    if (!isImage(file)) {
      setMsg({ ok: false, text: 'Kop surat harus gambar JPG, PNG, atau WEBP.' })
      return
    }
    setMsg(null)
    startTransition(async () => {
      try {
        // Kop surat gambar utuh (lengkap dengan logo/alamat/dekorasi) -- resolusi dijaga lebih tinggi dari logo
        const blob = await toPng(file, 2000, 6 * 1024 * 1024)
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
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="mb-3 text-[15px] font-bold" style={{ color: '#1f1a10' }}>Logo</div>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo_url} alt="Logo saat ini" width={72} height={72} className="rounded-2xl object-cover" style={{ width: 72, height: 72, background: '#faf7f0' }} />
          <div className="flex flex-col gap-2">
            <button type="button" disabled={isPending} onClick={() => fileRef.current?.click()} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
              {isPending ? 'Memproses...' : 'Ganti Logo'}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await saveLogo(null)
                  setMsg(r.ok ? { ok: true, text: 'Kembali ke logo bawaan.' } : { ok: false, text: r.error ?? 'Gagal.' })
                  router.refresh()
                })
              }
              className="text-[12px] font-bold"
              style={{ color: '#9c7a3f' }}
            >
              Pakai logo bawaan
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => uploadLogo(e.target.files?.[0])} />
        </div>
        <p className="mt-2 text-[11.5px]" style={{ color: '#5b543f' }}>Disarankan gambar persegi. Dikompres otomatis ke 512 px.</p>
      </section>

      <section className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="mb-1 text-[15px] font-bold" style={{ color: '#1f1a10' }}>Kop Surat</div>
        <p className="mb-3 text-[11.5px]" style={{ color: '#5b543f' }}>
          Gambar kop surat siap pakai (logo, nama, alamat, dekorasi -- sudah didesain lengkap). Kalau diisi, kop ini dipakai
          otomatis sebagai header semua PDF Ekspor Laporan, menggantikan kop otomatis dari data di atas. Bisa juga diunduh
          kosongan untuk dipakai bikin surat manual di luar aplikasi.
        </p>
        {brand.letterhead_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={brand.letterhead_url} alt="Kop surat saat ini" className="mb-3 w-full rounded-xl object-contain" style={{ maxHeight: 140, background: '#faf7f0', border: '1px solid rgba(26,19,5,0.08)' }} />
        ) : (
          <p className="mb-3 text-[12px] font-medium" style={{ color: '#9c7a3f' }}>Belum ada kop surat. Kop otomatis dari data di atas tetap dipakai.</p>
        )}
        <div className="flex flex-wrap gap-2.5">
          <button type="button" disabled={isPending} onClick={() => letterheadRef.current?.click()} className="rounded-xl px-4 py-2.5 text-[13px] font-bold" style={{ background: '#1a1305', color: '#e6c98a' }}>
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
          <input ref={letterheadRef} type="file" accept="image/*" hidden onChange={(e) => uploadLetterhead(e.target.files?.[0])} />
        </div>
      </section>

      <form onSubmit={save} className="flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <div className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>Nama & Kontak</div>
        <label className={label} style={{ color: '#5b543f' }}>
          Nama perumahan
          <input value={form.community_name} onChange={set('community_name')} maxLength={60} required style={field} placeholder="mis. Hinggil Mansion" />
        </label>
        <label className={label} style={{ color: '#5b543f' }}>
          Nama aplikasi (judul di tab browser & saat dipasang di HP)
          <input value={form.app_name} onChange={set('app_name')} maxLength={60} required style={field} placeholder="mis. Warga Hinggil Mansion" />
        </label>
        <label className={label} style={{ color: '#5b543f' }}>
          Nama pendek (di bawah ikon HP, maks 24 huruf)
          <input value={form.short_name} onChange={set('short_name')} maxLength={24} required style={field} />
        </label>
        <label className={label} style={{ color: '#5b543f' }}>
          Slogan (opsional)
          <input value={form.tagline} onChange={set('tagline')} maxLength={120} style={field} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={label} style={{ color: '#5b543f' }}>
            WhatsApp pengelola
            <input value={form.contact_whatsapp} onChange={set('contact_whatsapp')} maxLength={20} inputMode="tel" style={field} placeholder="08xx" />
          </label>
          <label className={label} style={{ color: '#5b543f' }}>
            Email pengelola
            <input value={form.contact_email} onChange={set('contact_email')} maxLength={120} type="email" style={field} />
          </label>
        </div>
        <label className={label} style={{ color: '#5b543f' }}>
          Alamat perumahan (untuk kop laporan)
          <input value={form.address} onChange={set('address')} maxLength={200} style={field} />
        </label>
        <label className={label} style={{ color: '#5b543f' }}>
          Kota
          <input value={form.city} onChange={set('city')} maxLength={60} style={field} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={label} style={{ color: '#5b543f' }}>
            Warna tema (bar HP)
            <span className="flex items-center gap-2">
              <input type="color" value={form.theme_color} onChange={set('theme_color')} aria-label="Warna tema" style={{ width: 44, height: 40, border: 'none', background: 'none' }} />
              <input value={form.theme_color} onChange={set('theme_color')} maxLength={7} style={{ ...field, fontFamily: 'monospace' }} />
            </span>
          </label>
          <label className={label} style={{ color: '#5b543f' }}>
            Warna aksen
            <span className="flex items-center gap-2">
              <input type="color" value={form.accent_color} onChange={set('accent_color')} aria-label="Warna aksen" style={{ width: 44, height: 40, border: 'none', background: 'none' }} />
              <input value={form.accent_color} onChange={set('accent_color')} maxLength={7} style={{ ...field, fontFamily: 'monospace' }} />
            </span>
          </label>
        </div>
        <button type="submit" disabled={isPending} className="mt-1 rounded-xl py-3 text-[14px] font-bold" style={{ background: '#1a1305', color: '#e6c98a', opacity: isPending ? 0.6 : 1 }}>
          {isPending ? 'Menyimpan...' : 'Simpan Identitas'}
        </button>
      </form>
      {msg ? (
        <p role="status" className="text-[13px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>
          {msg.text}
        </p>
      ) : null}
    </div>
  )
}