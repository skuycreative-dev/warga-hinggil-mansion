// Kategori & tipe Katalog Tukang (wireframe screen 19-20)

export const TUKANG_CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'bangunan', label: 'Bangunan', icon: 'M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6' },
  { key: 'listrik', label: 'Listrik', icon: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z' },
  { key: 'ac', label: 'AC', icon: 'M3 6h18v7H3zM7 17v2M12 17v3M17 17v2' },
  { key: 'ledeng', label: 'Ledeng', icon: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z' },
  { key: 'kebun', label: 'Kebun', icon: 'M12 22V12M12 12C12 7 8 4 3 4c0 5 4 8 9 8ZM12 12c0-4 3-7 8-7 0 4-3 7-8 7Z' },
  { key: 'bersih', label: 'Bersih-bersih', icon: 'M3 21h18M6 21l1-8h10l1 8M9 13V5a3 3 0 0 1 6 0v8' },
  { key: 'laundry', label: 'Laundry', icon: 'M4 3h16v18H4zM8 6h.01M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
  { key: 'katering', label: 'Katering', icon: 'M3 11h18M5 11a7 7 0 0 1 14 0M12 4V2M4 15h16l-1 4H5Z' },
  { key: 'elektronik', label: 'Elektronik', icon: 'M4 5h16v11H4zM8 20h8M12 16v4' },
  { key: 'lainnya', label: 'Lainnya', icon: 'M12 8v8M8 12h8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
]

export function categoryLabel(key: string | null | undefined) {
  return TUKANG_CATEGORIES.find((c) => c.key === key)?.label ?? 'Lainnya'
}

export function categoryIcon(key: string | null | undefined) {
  return TUKANG_CATEGORIES.find((c) => c.key === key)?.icon ?? TUKANG_CATEGORIES[TUKANG_CATEGORIES.length - 1].icon
}

export type TukangService = { name: string; price: string }

export type TukangSummary = {
  id: string
  name: string
  specialty: string
  category: string
  phone: string | null
  experience_years: number | null
  price_range: string | null
  area: string | null
  description: string | null
  avg_rating: number | null
  review_count: number
  submitted_by: string
  created_at: string
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

// 0812-3456-7890 / +62812... -> 62812... (untuk wa.me dan tel:)
export function waNumber(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/[^0-9]/g, '')
  if (!digits) return null
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return `62${digits}`
}

export function parseServices(raw: unknown): TukangService[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((s: any) => ({ name: String(s?.name ?? '').slice(0, 60), price: String(s?.price ?? '').slice(0, 40) }))
    .filter((s) => s.name)
    .slice(0, 15)
}