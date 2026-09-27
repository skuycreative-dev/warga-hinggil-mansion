// Nama yang tampil ke warga lain: Nama Panggilan kalau ada, kalau belum diisi pakai Nama Lengkap.
export function displayName(
  person: { nickname?: string | null; full_name?: string | null } | null | undefined,
  fallback = 'Warga'
): string {
  const nickname = person?.nickname?.trim()
  if (nickname) return nickname
  const fullName = person?.full_name?.trim()
  if (fullName) return fullName
  return fallback
}