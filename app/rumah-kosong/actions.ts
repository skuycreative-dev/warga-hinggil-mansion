'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/log-error'

export type AbsenceState = { error: string; success: boolean }

function isoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

// Warga mengaktifkan Mode Rumah Kosong (minimal 2 hari). Hanya Security, Paguyuban,
// Superadmin, dan penghuni rumah itu sendiri yang bisa melihatnya (dijaga database).
export async function activateAbsence(prevState: AbsenceState, formData: FormData): Promise<AbsenceState> {
  const start = isoDate(((formData.get('start_date') as string) ?? '').trim())
  const end = isoDate(((formData.get('end_date') as string) ?? '').trim())
  const note = ((formData.get('note') as string) ?? '').trim()
  const contactPhone = ((formData.get('contact_phone') as string) ?? '').trim()

  if (!start || !end) return { error: 'Tanggal berangkat dan tanggal kembali wajib diisi.', success: false }

  // Bandingkan sebagai teks YYYY-MM-DD dengan tanggal hari ini di WIB
  const todayWib = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const dayMs = 24 * 60 * 60 * 1000
  const lengthDays = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / dayMs

  if (start < todayWib) return { error: 'Tanggal berangkat tidak boleh sebelum hari ini.', success: false }
  if (lengthDays < 2) {
    return { error: 'Mode Rumah Kosong untuk kepergian minimal 2 hari.', success: false }
  }
  if (note.length > 200) return { error: 'Catatan maksimal 200 karakter.', success: false }
  if (contactPhone && !/^[0-9+\-\s()]{6,20}$/.test(contactPhone)) return { error: 'Nomor yang bisa dihubungi tidak valid.', success: false }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('house_id').eq('id', user.id).maybeSingle()
  if (!profile?.house_id) return { error: 'Akun kamu belum terhubung ke nomor rumah.', success: false }

  const { error } = await supabase.from('house_absences').insert({
    house_id: profile.house_id,
    created_by: user.id,
    start_date: start,
    end_date: end,
    note: note || null,
    contact_phone: contactPhone || null,
    status: 'aktif',
  })

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return { error: 'Mode Rumah Kosong untuk rumah ini sudah aktif.', success: false }
    }
    await logError('rumah-kosong: aktifkan', error.message, { userId: user.id })
    return { error: 'Gagal menyimpan. Pastikan akunmu sudah diverifikasi Pengurus.', success: false }
  }

  revalidatePath('/rumah-kosong')
  revalidatePath('/dashboard')
  return { error: '', success: true }
}

export async function endAbsence(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('house_absences')
    .update({ status: 'selesai', ended_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'aktif')
    .select('id')

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: 'Tidak bisa mengakhiri: data tidak ditemukan atau bukan rumahmu.' }

  revalidatePath('/rumah-kosong')
  revalidatePath('/dashboard')
  return { error: null }
}