'use server'

import { publicError } from '@/lib/safe-error'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/log-error'

export type EmergencyState = { error: string; success: boolean }

const EMERGENCY_TYPES = ['kebakaran', 'maling', 'perampokan', 'kekerasan', 'medis', 'bencana', 'lainnya']

// Tombol darurat sengaja TIDAK mengecek status verifikasi akun: warga baru pun boleh memakainya.
export async function triggerEmergency(prevState: EmergencyState, formData: FormData): Promise<EmergencyState> {
  const message = (formData.get('message') as string)?.trim()
  const emergencyType = (formData.get('emergency_type') as string) || 'lainnya'

  if (!EMERGENCY_TYPES.includes(emergencyType)) {
    return { error: 'Jenis darurat tidak valid.', success: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Boleh mengirim beberapa alert sekaligus (mis. kebakaran + medis). Yang dicegah hanya
  // jenis yang SAMA dalam 60 detik terakhir, supaya tidak terkirim dobel karena tertekan 2x.
  const { data: duplicate } = await supabase
    .from('emergency_alerts')
    .select('id')
    .eq('reporter_id', user.id)
    .eq('emergency_type', emergencyType)
    .eq('status', 'aktif')
    .gte('created_at', new Date(Date.now() - 60 * 1000).toISOString())
    .limit(1)
    .maybeSingle()

  if (duplicate) {
    return { error: 'Alert jenis ini baru saja terkirim. Security & Pengurus sudah diberi tahu.', success: false }
  }

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()

  const { error } = await supabase.from('emergency_alerts').insert({
    reporter_id: user.id,
    created_by: user.id,
    emergency_type: emergencyType,
    house_id: profile?.house_id ?? null,
    message: message || null,
    status: 'aktif',
  })

  if (error) {
    await logError('darurat: kirim alert', error.message, { emergencyType, userId: user.id })
    return { error: publicError(error), success: false }
  }

  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

// Menangani & menutup alert oleh petugas sekarang lewat Pusat Alert (app/keamanan/darurat/actions.ts)
// supaya setiap penutupan wajib memilih kategori dan tercatat di log respons.

// Pelapor me-reset alert miliknya sendiri ("saya sudah aman" / tidak sengaja terkirim)
export async function resolveOwnEmergency(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('emergency_alerts')
    .update({ status: 'selesai', resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('reporter_id', user.id)
    .in('status', ['aktif', 'ditangani'])
    .select('id')

  if (error) return { error: publicError(error) }
  if (!data || data.length === 0) return { error: 'Alert tidak ditemukan atau sudah selesai.' }

  revalidatePath('/darurat')
  revalidatePath('/dashboard')
  return { error: null }
}

// Pelapor menambah info (mis. ciri pelaku, kondisi terbaru). Terkirim ke petugas yang menangani.
export async function addReporterInfo(id: string, body: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const text = body.trim()
  if (!text) return { error: 'Isi info tambahan dulu.' }
  if (text.length > 500) return { error: 'Maksimal 500 karakter.' }

  const { error } = await supabase.from('emergency_events').insert({ alert_id: id, actor_id: user.id, kind: 'info_pelapor', body: text, is_internal: false })
  if (error) return { error: publicError(error) }

  revalidatePath('/darurat')
  revalidatePath(`/keamanan/darurat/${id}`)
  return { error: null }
}