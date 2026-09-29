import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib'
import type { Branding } from '@/lib/branding-types'
import type { Report } from '@/lib/report-data'

// Laporan PDF berkop perumahan (A4). Font standar PDF, jadi karakter di luar huruf Latin diganti "?".
const WINANSI_EXTRA = new Set('–—‘’“”•…€'.split(''))
function clean(s: string) {
  return Array.from(s)
    .map((ch) => (ch.charCodeAt(0) <= 0xff || WINANSI_EXTRA.has(ch) ? ch : '?'))
    .join('')
    .replace(/[\u0000-\u001f]/g, ' ')
}

function rupiahPlain(n: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n || 0)
}

function fit(text: string, font: PDFFont, size: number, max: number) {
  let t = clean(text)
  if (font.widthOfTextAtSize(t, size) <= max) return t
  while (t.length > 1 && font.widthOfTextAtSize(t + '...', size) > max) t = t.slice(0, -1)
  return t + '...'
}

async function loadLogo(pdf: PDFDocument, url: string, origin: string): Promise<PDFImage | null> {
  try {
    const abs = url.startsWith('http') ? url : `${origin}${url}`
    const res = await fetch(abs, { cache: 'no-store' })
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length > 3 * 1024 * 1024) return null
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await pdf.embedPng(bytes)
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await pdf.embedJpg(bytes)
    return null
  } catch {
    return null
  }
}

// Kop surat gambar utuh (logo+nama+alamat+dekorasi sudah didesain lengkap) -- kalau diunggah Superadmin,
// dipakai apa adanya sebagai banner selebar halaman menggantikan kop otomatis (Kebutuhan #3, 29 Sep 2026).
async function loadLetterhead(pdf: PDFDocument, url: string): Promise<PDFImage | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length > 8 * 1024 * 1024) return null
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await pdf.embedPng(bytes)
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await pdf.embedJpg(bytes)
    return null
  } catch {
    return null
  }
}

export async function buildReportPdf(report: Report, brand: Branding, origin: string, printedBy: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(clean(`${report.title} - ${brand.community_name}`))
  pdf.setAuthor(clean(brand.app_name))
  pdf.setCreator(clean(brand.app_name))
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const logo = await loadLogo(pdf, brand.logo_url, origin)
  const letterhead = brand.letterhead_url ? await loadLetterhead(pdf, brand.letterhead_url) : null

  const [W, H] = report.landscape ? [841.89, 595.28] : [595.28, 841.89]
  const M = 36
  const tableW = W - M * 2
  const baseW = report.columns.reduce((s, c) => s + c.width, 0)
  const colW = report.columns.map((c) => (c.width / baseW) * tableW)
  const dark = rgb(0.12, 0.1, 0.06)
  const muted = rgb(0.36, 0.33, 0.25)
  const gold = rgb(0.61, 0.48, 0.25)
  const headBg = rgb(0.95, 0.92, 0.84)
  const line = rgb(0.85, 0.82, 0.75)
  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const pages: PDFPage[] = []
  let page!: PDFPage
  let y = 0
  const rowH = 16
  const fs = 8.5

  function kop(first: boolean) {
    page = pdf.addPage([W, H])
    pages.push(page)
    y = H - M
    if (first) {
      if (letterhead) {
        // Kop surat gambar utuh: banner selebar halaman, tinggi mengikuti rasio gambar (dibatasi biar tidak kelewat tinggi)
        const bw = tableW
        const bh = Math.min(110, (letterhead.height / letterhead.width) * bw)
        const bx = M + (bw - (letterhead.width / letterhead.height) * bh) / 2
        page.drawImage(letterhead, { x: bx, y: y - bh, width: (letterhead.width / letterhead.height) * bh, height: bh })
        y -= bh + 14
        page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: gold })
        y -= 24
      } else {
        let x = M
        if (logo) {
          const s = 44 / Math.max(logo.width, logo.height)
          page.drawImage(logo, { x, y: y - 44, width: logo.width * s, height: logo.height * s })
          x += 54
        }
        page.drawText(fit(brand.community_name.toUpperCase(), bold, 15, W - x - M), { x, y: y - 16, size: 15, font: bold, color: dark })
        const addr = [brand.address, brand.city].filter(Boolean).join(', ')
        const contact = [brand.contact_whatsapp ? `WA ${brand.contact_whatsapp}` : '', brand.contact_email ?? ''].filter(Boolean).join('  |  ')
        if (addr) page.drawText(fit(addr, font, 9, W - x - M), { x, y: y - 30, size: 9, font, color: muted })
        if (contact) page.drawText(fit(contact, font, 9, W - x - M), { x, y: y - 42, size: 9, font, color: muted })
        y -= 54
        page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: gold })
        y -= 24
      }
      page.drawText(clean(report.title), { x: M, y, size: 14, font: bold, color: dark })
      y -= 15
      page.drawText(clean(`${report.subtitle}  ·  Dicetak ${now} WIB oleh ${printedBy}`), { x: M, y, size: 9, font, color: muted })
      y -= 18
    } else {
      page.drawText(fit(`${brand.community_name} · ${report.title} (lanjutan)`, font, 9, tableW), { x: M, y: y - 10, size: 9, font, color: muted })
      y -= 24
    }
    header()
  }

  function header() {
    page.drawRectangle({ x: M, y: y - rowH + 4, width: tableW, height: rowH, color: headBg })
    let x = M
    report.columns.forEach((c, i) => {
      const t = fit(c.label, bold, fs, colW[i] - 6)
      const tx = c.align === 'right' ? x + colW[i] - 3 - bold.widthOfTextAtSize(t, fs) : x + 3
      page.drawText(t, { x: tx, y: y - 8, size: fs, font: bold, color: dark })
      x += colW[i]
    })
    y -= rowH
  }

  kop(true)
  if (!report.rows.length) {
    page.drawText('Tidak ada data pada periode ini.', { x: M, y: y - 12, size: 10, font, color: muted })
    y -= 24
  }
  for (const row of report.rows) {
    if (y < M + 40) kop(false)
    let x = M
    row.forEach((v, i) => {
      const c = report.columns[i]
      const text = typeof v === 'number' && c.money ? (v === 0 ? '-' : rupiahPlain(v)) : String(v ?? '')
      const t = fit(text, font, fs, colW[i] - 6)
      const tx = c.align === 'right' ? x + colW[i] - 3 - font.widthOfTextAtSize(t, fs) : x + 3
      page.drawText(t, { x: tx, y: y - 8, size: fs, font, color: dark })
      x += colW[i]
    })
    page.drawLine({ start: { x: M, y: y - rowH + 4 }, end: { x: W - M, y: y - rowH + 4 }, thickness: 0.4, color: line })
    y -= rowH
  }

  // Ringkasan
  const needed = 24 + report.summary.length * 15 + 70
  if (y < M + needed) kop(false)
  y -= 14
  page.drawText('Ringkasan', { x: M, y, size: 11, font: bold, color: dark })
  y -= 6
  for (const [label, value] of report.summary) {
    y -= 15
    page.drawText(clean(label), { x: M, y, size: 9.5, font, color: muted })
    const v = typeof value === 'number' ? rupiahPlain(value) : clean(String(value))
    const valueText = typeof value === 'number' && /total|selisih/i.test(label) ? `Rp ${v}` : v
    page.drawText(valueText, { x: M + 220 - bold.widthOfTextAtSize(valueText, 9.5), y, size: 9.5, font: bold, color: dark })
  }

  // Tempat tanda tangan
  y -= 40
  const signX = W - M - 170
  page.drawText(clean(`${brand.city ?? ''}${brand.city ? ', ' : ''}....................................`), { x: signX, y, size: 9.5, font, color: dark })
  page.drawText('Mengetahui,', { x: signX, y: y - 14, size: 9.5, font, color: dark })
  page.drawLine({ start: { x: signX, y: y - 62 }, end: { x: signX + 160, y: y - 62 }, thickness: 0.6, color: dark })

  pages.forEach((p, i) => {
    const t = `Halaman ${i + 1} dari ${pages.length}`
    p.drawText(t, { x: W - M - font.widthOfTextAtSize(t, 8), y: 18, size: 8, font, color: muted })
    p.drawText(fit(brand.app_name, font, 8, 300), { x: M, y: 18, size: 8, font, color: muted })
  })

  return pdf.save()
}