'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { logError } from '@/lib/log-error'
import { DOC_TYPES, LAYANAN_CATEGORIES, MAX_DOC_BYTES } from '@/lib/layanan'

// Layanan Surat: database memeriksa ulang siapa boleh membaca / mengirim (RLS Step 327)

export type LayananState = { error: string; success: boolean; id?: string }

async function ctx() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, userId: user.id }
}

function refresh(id?: string) {
  revalidatePath('/layanan')
  if (id) revalidatePath(`/layanan/${id}`)
}

export async function createServiceRequest(prevState: LayananState, formData: FormData): Promise<LayananState> {
  const category = String(formData.get('category') ?? '')
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!LAYANAN_CATEGORIES.some((c) => c.key === category)) return { error: 'Pilih jenis keperluan.', success: false }
  if (subject.length < 3 || subject.length > 120) return { error: 'Judul 3-120 karakter, mis. "Surat domisili untuk buka rekening".', success: false }
  if (message.length > 2000) return { error: 'Pesan maksimal 2000 karakter.', success: false }

  const { supabase, userId } = await ctx()
  const { data: me } = await supabase.from('profiles').select('house_id').eq('id', userId).maybeSingle()

  const { data, error } = await supabase
    .from('service_requests')
    .insert({ requester_id: userId, house_id: me?.house_id ?? null, category, subject, status: 'baru' })
    .select('id')
    .single()

  if (error || !data) {
    await logError('layanan: buat', error?.message ?? 'gagal', { userId })
    return {
      error: error?.message?.includes('row-level security') ? 'Akunmu perlu diverifikasi Pengurus dulu.' : error?.message ?? 'Gagal membuat permintaan.',
      success: false,
    }
  }

  if (message) {
    await supabase.from('service_messages').insert({ request_id: data.id, sender_id: userId, body: message })
  }

  refresh(data.id)
  return { error: '', success: true, id: data.id }
}

export type AttachmentInput = { path: string; name: string; type: string; size: number } | null

export async function sendServiceMessage(requestId: string, body: string, attachment: AttachmentInput) {
  const { supabase, userId } = await ctx()
  const text = body.trim()
  if (!text && !attachment) return { error: 'Tulis pesan atau lampirkan file.' }
  if (text.length > 2000) return { error: 'Pesan maksimal 2000 karakter.' }

  if (attachment) {
    if (!attachment.path.startsWith(`${requestId}/`)) return { error: 'Lokasi file tidak valid.' }
    if (!DOC_TYPES[attachment.type]) return { error: 'Jenis file tidak didukung (PDF, Word, JPG, PNG).' }
    if (!(attachment.size > 0) || attachment.size > MAX_DOC_BYTES) return { error: 'Ukuran file maksimal 10 MB.' }
  }

  const { error } = await supabase.from('service_messages').insert({
    request_id: requestId,
    sender_id: userId,
    body: text || null,
    file_path: attachment?.path ?? null,
    file_name: attachment?.name.slice(0, 150) ?? null,
    file_type: attachment?.type ?? null,
    file_size: attachment?.size ?? null,
  })

  if (error) {
    await logError('layanan: kirim pesan', error.message, { requestId })
    if (attachment) await supabase.storage.from('service-files').remove([attachment.path])
    return { error: error.message.includes('row-level security') ? 'Permintaan ini sudah dibatalkan atau kamu tidak punya akses.' : error.message }
  }

  await supabase.from('service_request_reads').upsert({ request_id: requestId, user_id: userId, read_at: new Date().toISOString() })
  refresh(requestId)
  return { error: null }
}

export async function setServiceStatus(requestId: string, status: string) {
  const access = await getMyAccess()
  const { supabase } = await ctx()
  if (status === 'dibatalkan') {
    // Warga membatalkan permintaannya sendiri (Pengurus juga boleh)
  } else if (!access.isServiceStaff) {
    return { error: 'Hanya Pengurus yang bisa mengubah status.' }
  }
  if (!['baru', 'diproses', 'selesai', 'dibatalkan'].includes(status)) return { error: 'Status tidak valid.' }

  const { data, error } = await supabase.from('service_requests').update({ status }).eq('id', requestId).select('id')
  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Permintaan tidak ditemukan.' }
  refresh(requestId)
  return { error: null }
}

export async function markServiceRead(requestId: string) {
  const { supabase, userId } = await ctx()
  await supabase.from('service_request_reads').upsert({ request_id: requestId, user_id: userId, read_at: new Date().toISOString() })
}

// Link unduh sementara (1 jam). Database menentukan siapa yang boleh.
export async function getServiceFileUrl(messageId: string, download: boolean) {
  const { supabase } = await ctx()
  const { data: msg } = await supabase.from('service_messages').select('file_path, file_name').eq('id', messageId).maybeSingle()
  if (!msg?.file_path) return { url: null, error: 'File tidak ditemukan.' }
  const { data, error } = await supabase.storage
    .from('service-files')
    .createSignedUrl(msg.file_path, 60 * 60, download ? { download: msg.file_name ?? true } : undefined)
  if (error || !data) return { url: null, error: 'File tidak bisa dibuka.' }
  return { url: data.signedUrl, error: null }
}