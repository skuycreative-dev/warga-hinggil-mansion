import { strToU8, zipSync } from 'fflate'

// Penulis file Excel (.xlsx) sederhana tanpa library berat.
// Mendukung beberapa sheet, baris judul tebal, angka, teks, dan lebar kolom otomatis.
export type Cell = string | number | boolean | null | undefined | Date
export type Sheet = { name: string; rows: Cell[][]; header?: boolean; money?: number[] }

function esc(s: string) {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function colName(i: number) {
  let n = i + 1
  let s = ''
  while (n > 0) {
    const m = (n - 1) % 26
    s = String.fromCharCode(65 + m) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

function sheetName(name: string, used: Set<string>) {
  let base = name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'Sheet'
  let n = 2
  let out = base
  while (used.has(out.toLowerCase())) {
    const suffix = ` (${n++})`
    out = base.slice(0, 31 - suffix.length) + suffix
  }
  used.add(out.toLowerCase())
  return out
}

// Teks yang diawali = + - @ diberi tanda kutip supaya tidak dibaca Excel sebagai rumus (keamanan)
function safeText(v: string) {
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
}

function cellXml(ref: string, v: Cell, style: number) {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number' && Number.isFinite(v)) return `<c r="${ref}" s="${style}"><v>${v}</v></c>`
  if (typeof v === 'boolean') return `<c r="${ref}" t="b" s="${style}"><v>${v ? 1 : 0}</v></c>`
  const text = v instanceof Date ? v.toISOString().slice(0, 19).replace('T', ' ') : typeof v === 'object' ? JSON.stringify(v) : String(v)
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${esc(safeText(text).slice(0, 32000))}</t></is></c>`
}

export function buildXlsx(sheets: Sheet[]): Uint8Array {
  const used = new Set<string>()
  const names = sheets.map((s) => sheetName(s.name, used))
  const files: Record<string, Uint8Array> = {}

  files['[Content_Types].xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets
      .map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
      .join('')}</Types>`
  )
  files['_rels/.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`
  )
  files['xl/workbook.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names
      .map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
      .join('')}</sheets></workbook>`
  )
  files['xl/_rels/workbook.xml.rels'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`)
      .join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  )
  // Gaya: 0 biasa, 1 judul tebal berlatar, 2 angka rupiah (#,##0)
  files['xl/styles.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3EAD6"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
  )

  sheets.forEach((s, si) => {
    const money = new Set(s.money ?? [])
    const widths: number[] = []
    s.rows.forEach((row) =>
      row.forEach((v, ci) => {
        const len = v === null || v === undefined ? 0 : String(v instanceof Date ? v.toISOString() : v).length
        widths[ci] = Math.min(60, Math.max(widths[ci] ?? 8, len + 2))
      })
    )
    const cols = widths.length ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''
    const rowsXml = s.rows
      .map((row, ri) => {
        const isHeader = s.header !== false && ri === 0
        const cells = row
          .map((v, ci) => cellXml(`${colName(ci)}${ri + 1}`, v, isHeader ? 1 : typeof v === 'number' && money.has(ci) ? 2 : 0))
          .join('')
        return `<row r="${ri + 1}">${cells}</row>`
      })
      .join('')
    const freeze = s.header !== false && s.rows.length > 1 ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : ''
    files[`xl/worksheets/sheet${si + 1}.xml`] = strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${freeze}${cols}<sheetData>${rowsXml}</sheetData></worksheet>`
    )
  })

  return zipSync(files, { level: 6 })
}

export const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'