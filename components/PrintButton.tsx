'use client'

// Buka dialog cetak browser (pilih "Simpan sebagai PDF" untuk arsip digital)
export default function PrintButton({ label = 'Cetak / Simpan PDF' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-lg px-4 py-2 text-[13px] font-bold print:hidden" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
      {'\u{1F5A8}'} {label}
    </button>
  )
}