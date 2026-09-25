import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ForumPostForm from '@/components/ForumPostForm'

export default async function ForumPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, content, created_at, author:profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <main className="w-full" style={{ background: '#faf7f0' }}>
      <div className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest md:text-sm"
              style={{ color: '#9c7a3f' }}
            >
              Komunitas
            </span>
            <h1
              className="mt-1 text-2xl font-bold md:text-3xl"
              style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}
            >
              Forum Warga
            </h1>
          </div>
          <Link href="/dashboard" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>
            Beranda
          </Link>
        </div>

        <ForumPostForm />

        {posts && posts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {posts.map((post: any) => (
              <div
                key={post.id}
                className="rounded-2xl px-5 py-4 md:px-6 md:py-5"
                style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                    {post.author?.full_name ?? 'Warga'}
                  </span>
                  <span className="text-[11.5px] font-semibold" style={{ color: '#9c7a3f' }}>
                    {new Date(post.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed md:text-base" style={{ color: '#3a3424' }}>
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm font-medium" style={{ color: '#5b543f' }}>
            Belum ada postingan. Jadilah yang pertama menulis!
          </p>
        )}
      </div>
    </main>
  )
}
