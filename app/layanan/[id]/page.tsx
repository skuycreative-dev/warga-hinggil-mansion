import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { displayName } from '@/lib/display-name'
import ServiceThread, { type ThreadMessage } from '@/components/layanan/ServiceThread'
import { LAYANAN_STATUS, categoryLabel } from '@/lib/layanan'

export const dynamic = 'force-dynamic'

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

export default async function LayananThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const access = await getMyAccess()
  const supabase = await createClient()

  const { data: req } = await supabase
    .from('service_requests')
    .select('id, requester_id, category, subject, status, created_at, handled_by, house:houses(nomor_rumah)')
    .eq('id', id)
    .maybeSingle()
  if (!req) notFound()

  const { data: msgs } = await supabase
    .from('service_messages')
    .select('id, sender_id, body, file_path, file_name, file_type, file_size, created_at')
    .eq('request_id', id)
    .order('created_at')
    .limit(500)

  const peopleIds = Array.from(new Set([req.requester_id, req.handled_by, ...(msgs ?? []).map((m: any) => m.sender_id)].filter(Boolean) as string[]))
  const { data: people } = await supabase.from('profiles').select('id, full_name, nickname, role, staff_position, phone').in('id', peopleIds)
  const personMap = new Map((people ?? []).map((p: any) => [p.id as string, p]))
  const isStaffProfile = (p: any) => !!p && (['paguyuban', 'superadmin'].includes(p.role) || (p.role === 'staff_paguyuban' && p.staff_position === 'sekretaris'))

  // Pratinjau foto (link sementara 1 jam)
  const imagePaths = (msgs ?? []).filter((m: any) => m.file_path && String(m.file_type).startsWith('image/')).map((m: any) => m.file_path as string)
  const previews = new Map<string, string>()
  if (imagePaths.length) {
    const { data: signed } = await supabase.storage.from('service-files').createSignedUrls(imagePaths, 60 * 60)
    ;(signed ?? []).forEach((s) => {
      if (s.path && s.signedUrl) previews.set(s.path, s.signedUrl)
    })
  }

  const messages: ThreadMessage[] = (msgs ?? []).map((m: any) => {
    const p = personMap.get(m.sender_id)
    return {
      id: m.id,
      sender_id: m.sender_id,
      sender_name: displayName(p, 'Pengguna'),
      sender_is_staff: isStaffProfile(p),
      body: m.body,
      file_name: m.file_name,
      file_type: m.file_type,
      file_size: m.file_size,
      preview_url: m.file_path ? previews.get(m.file_path) ?? null : null,
      created_at: m.created_at,
    }
  })

  const requester = personMap.get(req.requester_id)
  const handler = req.handled_by ? personMap.get(req.handled_by) : null
  const st = LAYANAN_STATUS[req.status] ?? LAYANAN_STATUS.baru
  const house = one<any>(req.house)?.nomor_rumah

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 md:py-12">
        <Link href="/layanan" className="text-sm font-bold" style={{ color: '#9c7a3f' }}>‹ Layanan Surat</Link>

        <div className="mb-4 mt-3 rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{categoryLabel(req.category)}</span>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: st.bg, color: st.color === '#6b6552' ? '#d8cfb8' : st.color }}>{st.label}</span>
          </div>
          <h1 className="mt-1 text-[20px] font-bold leading-snug" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f5f3ee' }}>{req.subject}</h1>
          <div className="mt-1 text-[12px]" style={{ color: '#d8cfb8' }}>
            {access.isServiceStaff ? (
              <>
                Dari {displayName(requester, 'Warga')}
                {house ? ` · Rumah ${house}` : ''}
                {requester?.phone ? ` · ${requester.phone}` : ''}
              </>
            ) : (
              <>Ke Pengurus Paguyuban{handler ? ` · ditangani ${displayName(handler)}` : ''}</>
            )}
            {' · '}
            {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <ServiceThread
          requestId={req.id}
          status={req.status}
          messages={messages}
          myId={access.userId}
          isStaff={access.isServiceStaff}
          isRequester={req.requester_id === access.userId}
        />
      </div>
    </main>
  )
}