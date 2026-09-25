'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike, addComment, reportPost } from '@/app/forum/actions'

type Comment = {
  id: string
  content: string
  created_at: string
  author_name: string
}

type Post = {
  id: string
  content: string
  created_at: string
  author_name: string
  likeCount: number
  likedByMe: boolean
  comments: Comment[]
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}j`
  const days = Math.floor(hours / 24)
  return `${days}h`
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  function handleLike() {
    startTransition(async () => {
      await toggleLike(post.id)
      router.refresh()
    })
  }

  function handleReport() {
    if (!confirm('Laporkan postingan ini sebagai tidak pantas?')) return
    startTransition(async () => {
      await reportPost(post.id)
      router.refresh()
    })
  }

  function handleComment() {
    if (!commentText.trim()) return
    startTransition(async () => {
      await addComment(post.id, commentText)
      setCommentText('')
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
      style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: '#1a1305', color: '#e6c98a' }}
          >
            {post.author_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>{post.author_name}</div>
            <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(post.created_at)}</div>
          </div>
        </div>
        <button type="button" onClick={handleReport} title="Laporkan" style={{ color: '#c7c2b3' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </button>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#3a3424' }}>
        {post.content}
      </p>

      <div className="mt-3.5 flex items-center gap-5 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: post.likedByMe ? '#b3392f' : '#8a8c96' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.likedByMe ? '#b3392f' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          {post.likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-bold"
          style={{ color: '#8a8c96' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
          </svg>
          {post.comments.length}
        </button>
      </div>

      {showComments ? (
        <div className="mt-3 flex flex-col gap-2.5 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-xl px-3.5 py-2.5" style={{ background: '#faf7f0' }}>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold" style={{ color: '#1f1a10' }}>{c.author_name}</span>
                <span className="text-[10.5px] font-semibold" style={{ color: '#9c7a3f' }}>{timeAgo(c.created_at)}</span>
              </div>
              <p className="mt-0.5 text-[12.5px] font-medium" style={{ color: '#3a3424' }}>{c.content}</p>
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 rounded-full px-4 py-2 text-[13px]"
              style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.1)', color: '#1f1a10' }}
            />
            <button
              type="button"
              onClick={handleComment}
              disabled={isPending}
              className="rounded-full px-4 py-2 text-[13px] font-bold"
              style={{ background: '#1a1305', color: '#f5f3ee' }}
            >
              Kirim
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function ForumFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
        Belum ada postingan. Jadilah yang pertama menulis!
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
