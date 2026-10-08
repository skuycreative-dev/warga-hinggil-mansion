'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import TukangForm, { type TukangFormValues } from '@/components/TukangForm'
import { deleteTukang } from '@/app/tukang/actions'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'

// Pemosting: ubah & hapus. Admin (Manajemen/Paguyuban/Superadmin): hapus postingan bermasalah.
export default function TukangOwnerBar({ values, isOwner, isAdmin }: { values: TukangFormValues; isOwner: boolean; isAdmin: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()

  async function remove() {
    const msg = isOwner
      ? `Hapus ${values.name} dari katalog? Ulasan & foto ikut terhapus.`
      : `Hapus postingan ${values.name} karena bermasalah? Ulasan & foto ikut terhapus.`
    if (!(await confirmModal(msg, { danger: true }))) return
    startTransition(async () => {
      const result = await deleteTukang(values.id)
      if (result.error) {
        await alertModal(result.error)
        return
      }
      router.push('/tukang')
      router.refresh()
    })
  }

  if (editing) return <TukangForm initial={values} onDone={() => setEditing(false)} />

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3" style={{ background: isOwner ? '#fff8e8' : '#fdf1ef', border: `1px solid ${isOwner ? 'rgba(212,175,106,0.45)' : 'rgba(179,57,47,0.2)'}` }}>
      <span className="text-[12.5px] font-semibold" style={{ color: '#5b543f' }}>
        {isOwner ? 'Ini postinganmu.' : 'Mode admin: hapus jika postingan bermasalah.'}
      </span>
      <div className="flex gap-2">
        {isOwner ? (
          <button type="button" onClick={() => setEditing(true)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}>
            Ubah
          </button>
        ) : null}
        {isOwner || isAdmin ? (
          <button type="button" disabled={isPending} onClick={remove} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#ffffff', color: '#b3392f', border: '1px solid rgba(179,57,47,0.25)' }}>
            {isPending ? 'Menghapus...' : 'Hapus'}
          </button>
        ) : null}
      </div>
    </div>
  )
}