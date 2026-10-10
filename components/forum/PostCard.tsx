'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteForumPost, editForumPost, reportPost, toggleLike } from '@/app/forum/actions'
import { FORUM_LEVELS } from '@/lib/forum-level'
import { FORUM_CATEGORIES, findCategory } from '@/lib/categories'
import type { ForumPost } from '@/lib/forum-data'
import Avatar from '@/components/Avatar'
import { useConfirm, useAlertModal } from '@/components/ModalProvider'

export function LevelBadge({ name }: { name?: string }) {
  if (!name) return null
  const level = FORUM_LEVELS.find((l) => l.name === name)
  return (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: level?.background ?? '#f2f1ec', color: level?.color ?? '#5b543f' }}>
      {name}
    </span>
  )
}

export function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} mnt`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hr`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function PhotoGrid({ images, onOpen }: { images: string[]; onOpen: (i: number) => void }) {
  if (!images.length) return null
  const cols = images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
  return (
    <div className={`mt-3 grid ${cols} gap-1.5 overflow-hidden rounded-xl`}>
      {images.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => onOpen(i)}
          className={`relative overflow-hidden ${images.length === 1 ? 'aspect-[4/3]' : images.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
          style={{ background: '#faf7f0' }}
          aria-label={`Lihat foto ${i + 1}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  )
}

export default function PostCard({ post, myId, canModerate, detail = false }: { post: ForumPost; myId: string; canModerate: boolean; detail?: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [viewer, setViewer] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editCategory, setEditCategory] = useState(post.category)
  const [editError, setEditError] = useState('')
  const cat = findCategory(FORUM_CATEGORIES, post.category)
  const mine = post.author_id === myId
  const confirmModal = useConfirm()
  const alertModal = useAlertModal()

  function startEdit() {
    setEditContent(post.content)
    setEditCategory(post.category)
    setEditError('')
    setEditing(true)
  }

  function saveEdit() {
    const text = editContent.trim()
    if (!text) {
      setEditError('Tulisan tidak boleh kosong.')
      return
    }
    startTransition(async () => {
      const r = await editForumPost(post.id, text, editCategory)
      if (r.error) {
        setEditError(r.error)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  function like() {
    startTransition(async () => {
      await toggleLike(post.id)
      router.refresh()
    })
  }
  async function report() {
    if (!(await confirmModal('Laporkan postingan ini sebagai tidak pantas?'))) return
    startTransition(async () => {
      await reportPost(post.id)
      await alertModal('Terima kasih, laporan dikirim ke Pengurus.')
    })
  }
  async function remove() {
    if (!(await confirmModal('Hapus postingan ini beserta fotonya?', { danger: true }))) return
    startTransition(async () => {
      const r = await deleteForumPost(post.id)
      if (r.error) {
        await alertModal(r.error)
        return
      }
      if (detail) router.push('/forum')
      else router.refresh()
    })
  }

  return (
    <article className="rounded-2xl px-5 py-4 md:px-6 md:py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.author_name} url={post.author_avatar} size={36} />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>{post.author_name}</span>
              <LevelBadge name={post.author_level} />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
              {timeAgo(post.created_at)}
              {post.updated_at ? <span title={new Date(post.updated_at).toLocaleString('id-ID')}>· diedit</span> : null}
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mine ? (
            <button type="button" onClick={startEdit} disabled={isPending} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>
              Ubah
            </button>
          ) : null}
          {mine || canModerate ? (
            <button type="button" onClick={remove} disabled={isPending} className="text-[11.5px] font-bold" style={{ color: '#b3392f' }}>
              Hapus
            </button>
          ) : null}
          {!mine ? (
            <button type="button" onClick={report} disabled={isPending} title="Laporkan" aria-label="Laporkan postingan" style={{ color: '#c7c2b3' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {editing ? (
        <div className="mt-3 flex flex-col gap-2.5">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={3000}
            rows={4}
            className="w-full rounded-xl px-3.5 py-3 text-sm"
            style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', outline: 'none' }}
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="rounded-xl px-3 py-2 text-[13px]"
            style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10' }}
          >
            {FORUM_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          {editError ? <p className="text-[12px] font-semibold" style={{ color: '#b3392f' }}>{editError}</p> : null}
          <div className="flex gap-2.5">
            <button type="button" onClick={() => setEditing(false)} disabled={isPending} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#efe9db', color: '#5b543f' }}>
              Batal
            </button>
            <button type="button" onClick={saveEdit} disabled={isPending} className="flex-1 rounded-xl py-2.5 text-[13px] font-bold" style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)', opacity: isPending ? 0.7 : 1 }}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : detail ? (
        <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#3a3424' }}>{post.content}</p>
      ) : (
        <Link href={`/forum/${post.id}`} className="mt-3 block">
          <p className="line-clamp-6 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#3a3424' }}>{post.content}</p>
        </Link>
      )}

      {!editing && post.sticker_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.sticker_url} alt="Stiker" className="mt-3" style={{ width: 144, height: 144, objectFit: 'contain' }} loading="lazy" />
      ) : null}

      {!editing ? <PhotoGrid images={post.images} onOpen={setViewer} /> : null}

      <div className="mt-3.5 flex items-center gap-5 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
        <button
          type="button"
          onClick={like}
          disabled={isPending}
          aria-pressed={post.likedByMe}
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: post.likedByMe ? '#b3392f' : '#8a8c96' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? '#b3392f' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          {post.likeCount}
        </button>
        {detail ? (
          <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#8a8c96' }}>
            {post.commentCount} komentar
          </span>
        ) : (
          <Link href={`/forum/${post.id}`} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#8a8c96' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
            </svg>
            {post.commentCount} {post.commentCount ? '' : '· Balas'}
          </Link>
        )}
      </div>

      {viewer !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto"
          onClick={() => setViewer(null)}
          className="fixed inset-0 z-[90] flex items-center justify-center px-3"
          style={{ background: 'rgba(10,11,15,0.92)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.images[viewer]} alt={`Foto ${viewer + 1}`} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
          {post.images.length > 1 ? (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              {post.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setViewer(i)}
                  aria-label={`Foto ${i + 1}`}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: i === viewer ? 'var(--brand-accent)' : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}