// Level warga di forum berdasarkan poin keaktifan (forum_points).
// Poin bertambah otomatis +5 tiap membuat post atau komentar (trigger database add_forum_points).
export type ForumLevel = { name: string; min: number; color: string; background: string }

export const FORUM_LEVELS: ForumLevel[] = [
  { name: 'Warga Baru', min: 0, color: '#5b543f', background: '#f2f1ec' },
  { name: 'Warga Aktif', min: 25, color: '#2f6b4f', background: 'rgba(47,107,79,0.12)' },
  { name: 'Warga Teladan', min: 100, color: '#1f5a8a', background: 'rgba(31,90,138,0.12)' },
  { name: 'Sesepuh Forum', min: 250, color: '#8a4b1f', background: 'rgba(212,175,106,0.25)' },
  { name: 'Tokoh Warga', min: 500, color: 'var(--brand-accent)', background: '#1a1305' },
]

export function forumLevel(points: number | null | undefined): ForumLevel & { next: ForumLevel | null } {
  const p = Math.max(0, points ?? 0)
  let index = 0
  FORUM_LEVELS.forEach((level, i) => {
    if (p >= level.min) index = i
  })
  return { ...FORUM_LEVELS[index], next: FORUM_LEVELS[index + 1] ?? null }
}