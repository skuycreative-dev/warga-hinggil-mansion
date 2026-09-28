// NIK & nomor HP tidak bisa dibaca langsung dari tabel profiles (Step 334).
// Data ini diambil lewat fungsi database yang memeriksa hak akses:
//   - pemilik akun: NIK & HP miliknya sendiri
//   - Superadmin, Ketua, Sekretaris (verifikator): NIK & HP
//   - Bendahara, Manajemen, Security: nomor HP saja (untuk menghubungi saat darurat / rumah kosong / layanan)
//   - warga lain: tidak mendapat apa pun
type Rpc = { rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: unknown; error: unknown }> }

export type PrivateFields = { nik: string | null; phone: string | null }

export async function privateFields(supabase: Rpc, ids: (string | null | undefined)[]): Promise<Map<string, PrivateFields>> {
  const unique = Array.from(new Set(ids.filter(Boolean) as string[])).slice(0, 500)
  const map = new Map<string, PrivateFields>()
  if (!unique.length) return map
  const { data } = await supabase.rpc('private_profile_fields', { p_ids: unique })
  for (const row of (data as { id: string; nik: string | null; phone: string | null }[] | null) ?? []) {
    map.set(row.id, { nik: row.nik ?? null, phone: row.phone ?? null })
  }
  return map
}