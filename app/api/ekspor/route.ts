import { NextResponse } from 'next/server'
import { getMyAccess } from '@/lib/access'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBranding } from '@/lib/branding'
import { siteOrigin } from '@/lib/security'
import { anggaranReport, cleanRange, iplReport, tunggakanReport, type Report } from '@/lib/report-data'
import { buildReportPdf } from '@/lib/pdf-report'
import { buildXlsx, XLSX_TYPE, type Cell } from '@/lib/xlsx'
import { logAdminAction } from '@/lib/audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Unduh laporan keuangan (Excel / PDF). Data diambil dengan akun pengguna sendiri,
// jadi aturan database tetap berlaku (warga hanya mendapat data yang boleh dilihatnya).
export async function GET(request: Request) {
  const url = new URL(request.url)
  const jenis = url.searchParams.get('jenis') ?? ''
  const format = url.searchParams.get('format') === 'pdf' ? 'pdf' : 'xlsx'
  const { from, to } = cleanRange(url.searchParams.get('dari'), url.searchParams.get('sampai'))

  const access = await getMyAccess()
  const allowed = jenis === 'anggaran' ? access.canViewFinance : jenis === 'ipl' || jenis === 'tunggakan' ? access.canViewIpl : false
  if (!allowed) return NextResponse.json({ error: 'Tidak punya akses ke laporan ini.' }, { status: 403 })

  const { data: ok } = await createAdminClient().rpc('hit_rate_limit', { p_key: `ekspor:${access.userId}`, p_max: 30, p_window_seconds: 3600 })
  if (ok === false) return NextResponse.json({ error: 'Terlalu banyak unduhan. Coba lagi nanti.' }, { status: 429 })

  const supabase = await createClient()
  const report: Report =
    jenis === 'anggaran' ? await anggaranReport(supabase, from, to) : jenis === 'ipl' ? await iplReport(supabase, from, to) : await tunggakanReport(supabase, to)

  const brand = await getBranding()
  const isStaff = access.role !== 'warga'
  if (isStaff) await logAdminAction(access.userId, 'lihat', 'laporan', null, `Mengunduh ${report.title} (${report.subtitle}) format ${format.toUpperCase()}`)

  if (format === 'pdf') {
    const bytes = await buildReportPdf(report, brand, await siteOrigin(), access.fullName)
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.fileBase}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const money = report.columns.map((c, i) => (c.money ? i : -1)).filter((i) => i >= 0)
  const rows: Cell[][] = [report.columns.map((c) => c.label), ...report.rows]
  const info: Cell[][] = [
    [brand.community_name],
    [report.title],
    [report.subtitle],
    [`Dicetak ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB oleh ${access.fullName}`],
    [],
    ...report.summary.map(([k, v]) => [k, v] as Cell[]),
  ]
  const bytes = buildXlsx([
    { name: 'Laporan', rows, money },
    { name: 'Ringkasan', rows: info, header: false, money: [1] },
  ])
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': XLSX_TYPE,
      'Content-Disposition': `attachment; filename="${report.fileBase}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}