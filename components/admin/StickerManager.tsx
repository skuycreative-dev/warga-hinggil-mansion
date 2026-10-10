'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { prepareSticker } from '@/lib/sticker-image'
import { stickerUrl, type StickerPack } from '@/lib/stickers'
import { useConfirm } from '@/components/ModalProvider'
import { addStickers, createPack, deletePack, deleteSticker, renamePack, setPackActive, setStickerActive } from '@/app/superadmin/stiker/actions'

type AdminSticker = StickerPack['stickers'][number] & { is_active: boolean }
export type AdminPack = { id: string; name: string; is_active: boolean; stickers: AdminSticker[] }

const field: React.CSSProperties = { background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', borderRadius: 11, padding: '10px 13px', color: '#1f1a10', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }
const smallBtn: React.CSSProperties = { background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 700 }

export default function StickerManager({ packs }: { packs: AdminPack[] }) {
  const router = useRouter()
  const confirmModal = useConfirm()
  const [isPending, startTransition] = useTransition()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [busyPack, setBusyPack] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function run(fn: () => Promise<{ error: string | null }>) {
    setError('')
    startTransition(async () => {
      const r = await fn()
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  async function upload(packId: string, files: FileList | null) {
    const list = Array.from(files ?? [])
    if (!list.length) return
    setError('')
    setBusyPack(packId)
    const supabase = createClient()
    const done: { path: string; label: string }[] = []
    try {
      for (const f of list) {
        const { blob, ext } = await prepareSticker(f)
        const path = `${packId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
        const { error: upErr } = await supabase.storage.from('stickers').upload(path, blob, { contentType: blob.type, upsert: false })
        if (upErr) throw new Error('Gagal mengunggah. Periksa internet lalu coba lagi.')
        done.push({ path, label: f.name.replace(/\.[^.]+$/, '').slice(0, 40) })
      }
      const r = await addStickers(packId, done)
      if (r.error) setError(r.error)
    } catch (err) {
      if (done.length) await supabase.storage.from('stickers').remove(done.map((d) => d.path))
      setError(err instanceof Error ? err.message : 'Gagal mengunggah stiker.')
    } finally {
      setBusyPack(null)
      const el = fileRefs.current[packId]
      if (el) el.value = ''
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
        <label className="text-[12px] font-bold" style={{ color: '#5b543f' }}>Buat paket stiker baru</label>
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} placeholder="Contoh: Salam Warga" className="min-w-0 flex-1" style={field} />
          <button
            type="button"
            disabled={isPending || newName.trim().length < 2}
            onClick={() => run(async () => { const r = await createPack(newName); if (!r.error) setNewName(''); return r })}
            className="rounded-xl px-5 text-sm font-bold"
            style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending || newName.trim().length < 2 ? 0.6 : 1 }}
          >
            Buat
          </button>
        </div>
        <p className="text-[11.5px]" style={{ color: '#9c7a3f' }}>
          Gambar stiker otomatis dikecilkan (maks 384 px, 500 KB). Pakai PNG/WEBP berlatar transparan supaya tampil rapi.
        </p>
      </div>

      {error ? <p className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}

      {packs.length === 0 ? (
        <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>Belum ada paket stiker. Buat satu di atas.</p>
      ) : null}

      {packs.map((pack) => (
        <section key={pack.id} className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', opacity: pack.is_active ? 1 : 0.7 }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold" style={{ color: '#1f1a10' }}>{pack.name}</h2>
              {!pack.is_active ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'rgba(26,19,5,0.08)', color: '#5b543f' }}>Disembunyikan</span> : null}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                style={smallBtn}
                onClick={() => {
                  const n = window.prompt('Nama paket baru:', pack.name)
                  if (n !== null) run(() => renamePack(pack.id, n))
                }}
              >
                Ganti Nama
              </button>
              <button type="button" style={smallBtn} onClick={() => run(() => setPackActive(pack.id, !pack.is_active))}>
                {pack.is_active ? 'Sembunyikan' : 'Tampilkan'}
              </button>
              <button
                type="button"
                style={{ ...smallBtn, color: '#b3392f' }}
                onClick={async () => {
                  if (await confirmModal(`Hapus paket "${pack.name}" beserta ${pack.stickers.length} stikernya? Stiker yang sudah terkirim di chat/forum akan menjadi "Stiker dihapus".`, { danger: true })) run(() => deletePack(pack.id))
                }}
              >
                Hapus Paket
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
            {pack.stickers.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className="flex aspect-square w-full items-center justify-center rounded-xl p-1" style={{ background: '#faf7f0', opacity: s.is_active ? 1 : 0.4 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stickerUrl(s.path)} alt={s.label ?? 'Stiker'} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                <div className="flex gap-2 text-[10.5px] font-bold">
                  <button type="button" onClick={() => run(() => setStickerActive(s.id, !s.is_active))} style={{ color: '#9c7a3f' }}>{s.is_active ? 'Sembunyi' : 'Tampil'}</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (await confirmModal('Hapus stiker ini?', { danger: true })) run(() => deleteSticker(s.id))
                    }}
                    style={{ color: '#b3392f' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={busyPack === pack.id}
              onClick={() => fileRefs.current[pack.id]?.click()}
              className="rounded-xl px-4 py-2.5 text-[13px] font-bold"
              style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: busyPack === pack.id ? 0.6 : 1 }}
            >
              {busyPack === pack.id ? 'Mengunggah...' : '+ Tambah Stiker (bisa banyak sekaligus)'}
            </button>
            <input
              ref={(el) => { fileRefs.current[pack.id] = el }}
              type="file"
              accept="image/png,image/webp,image/jpeg,image/gif"
              multiple
              hidden
              onChange={(e) => upload(pack.id, e.target.files)}
            />
          </div>
        </section>
      ))}
    </div>
  )
}