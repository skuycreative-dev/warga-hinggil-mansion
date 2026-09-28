import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMyAccess } from '@/lib/access'
import { displayName } from '@/lib/display-name'
import TabNav from '@/components/TabNav'
import IplBillsPanel from '@/components/ipl/IplBillsPanel'
import IplArrears from '@/components/ipl/IplArrears'
import IplSettingsPanel from '@/components/ipl/IplSettingsPanel'
import IplDisbursementPanel from '@/components/ipl/IplDisbursementPanel'
import { IplProofButton, IplStatusBadge } from '@/components/ipl/IplBits'
import { billOutstanding, billTotal, IPL_METHOD_LABEL, isOverdue, sortHouse, type IplBill, type IplDisbursement, type IplHouseRate } from '@/lib/ipl'
import { cardStyle, dateLabel, periodLabel, rupiah, todayWib } from '@/lib/format'

export const dynamic = 'force-dynamic'

function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null
}

export default async function IuranIplPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const access = await getMyAccess()
  const { tab: tabParam } = await searchParams

  if (!access.canViewIpl) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-6" style={{ background: '#faf7f0' }}>
        <div className="max-w-sm text-center">
          <p className="text-lg font-bold" style={{ color: '#1f1a10' }}>Belum bisa dibuka</p>
          <p className="mt-2 text-sm font-medium" style={{ color: '#5b543f' }}>
            Iuran IPL bisa dibuka warga yang sudah terverifikasi, Admin Manajemen, dan pengurus Paguyuban.
          </p>
          <Link href="/dashboard" className="mt-4 inline-block text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali ke Beranda</Link>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  const isWarga = access.role === 'warga'
  const canManage = access.canManageIpl
  const today = todayWib()

  // Database: warga hanya menerima tagihan rumahnya sendiri, Manajemen & pengurus menerima semua rumah
  const { data: billsRaw } = await supabase
    .from('iuran_payment_status')
    .select('id, house_id, period, amount_due, late_fee, amount_paid, status, due_date, paid_at, payment_method, note, proof_path, house:houses(nomor_rumah)')
    .order('period', { ascending: false })
    .limit(5000)

  const bills: IplBill[] = (billsRaw ?? []).map((r: any) => ({
    id: r.id,
    house_id: r.house_id,
    nomor_rumah: one<any>(r.house)?.nomor_rumah ?? '-',
    period: r.period,
    amount_due: Number(r.amount_due),
    late_fee: Number(r.late_fee ?? 0),
    amount_paid: Number(r.amount_paid ?? 0),
    status: (r.status ?? 'belum') as IplBill['status'],
    due_date: r.due_date,
    paid_at: r.paid_at,
    payment_method: r.payment_method,
    note: r.note,
    has_proof: !!r.proof_path,
  }))

  const totalOutstanding = bills.reduce((s, b) => s + billOutstanding(b), 0)
  const unpaidCount = bills.filter((b) => b.status !== 'lunas').length

  // ------------------------------------------------------------------
  // Tampilan WARGA: tagihan rumahnya sendiri
  // ------------------------------------------------------------------
  if (isWarga) {
    const { data: me } = await supabase.from('profiles').select('house:houses(nomor_rumah)').eq('id', access.userId).maybeSingle()
    const houseLabel = one<any>((me as any)?.house)?.nomor_rumah ?? null
    const recent = bills.slice().sort((a, b) => b.period.localeCompare(a.period)).slice(0, 12)

    return (
      <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
          <Header eyebrow={houseLabel ? `Rumah ${houseLabel}` : 'Rumah Saya'} subtitle="Iuran Pengelolaan Lingkungan, dibayarkan ke Manajemen Perumahan." />

          <div className="mb-6 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Belum Lunas</div>
              <div className="mt-1 text-xl font-bold" style={{ color: '#e6c98a' }}>{unpaidCount} bulan</div>
            </div>
            <div className="rounded-2xl px-5 py-4" style={cardStyle}>
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Tunggakan</div>
              <div className="mt-1 text-xl font-bold" style={{ color: totalOutstanding > 0 ? '#b3392f' : '#2f6b4f' }}>{rupiah(totalOutstanding)}</div>
            </div>
          </div>

          <div className="rounded-2xl px-5 py-5" style={cardStyle}>
            <div className="mb-3 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Riwayat Tagihan</div>
            {recent.length === 0 ? (
              <p className="text-[13px]" style={{ color: '#5b543f' }}>Belum ada tagihan IPL untuk rumahmu.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recent.map((b) => (
                  <div key={b.id} className="rounded-xl px-3.5 py-3" style={{ background: '#faf7f0' }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[13px] font-bold" style={{ color: '#1f1a10' }}>{periodLabel(b.period)}</div>
                      <IplStatusBadge status={b.status} overdue={isOverdue(b, today)} />
                    </div>
                    <div className="mt-1 text-[11.5px]" style={{ color: '#5b543f' }}>
                      {rupiah(billTotal(b))}
                      {b.late_fee > 0 ? ` (denda ${rupiah(b.late_fee)})` : ''}
                      {b.status === 'sebagian' ? ` · sudah dibayar ${rupiah(b.amount_paid)}, sisa ${rupiah(billOutstanding(b))}` : ''}
                      {b.status !== 'lunas' && b.due_date ? ` · jatuh tempo ${dateLabel(b.due_date)}` : ''}
                      {b.status !== 'belum' && b.paid_at ? ` · dibayar ${dateLabel(b.paid_at)}` : ''}
                      {b.payment_method ? ` · ${IPL_METHOD_LABEL[b.payment_method] ?? b.payment_method}` : ''}
                    </div>
                    {b.note ? <div className="mt-0.5 text-[11.5px] italic" style={{ color: '#7a6f55' }}>Catatan Manajemen: {b.note}</div> : null}
                    {b.has_proof ? <div className="mt-1"><IplProofButton billId={b.id} label="Lihat bukti bayar" /></div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-[11.5px]" style={{ color: '#9c7a3f' }}>
            Ada yang tidak sesuai? Hubungi Admin Manajemen Perumahan.
          </p>
        </div>
      </main>
    )
  }

  // ------------------------------------------------------------------
  // Tampilan Manajemen / Superadmin / pengurus Paguyuban
  // ------------------------------------------------------------------
  const { data: disbRaw } = await supabase
    .from('ipl_disbursements')
    .select('id, period, amount, note, status, reject_reason, created_at, confirmed_at, creator:profiles!ipl_disbursements_created_by_fkey(full_name, nickname), confirmer:profiles!ipl_disbursements_confirmed_by_fkey(full_name, nickname)')
    .order('created_at', { ascending: false })
    .limit(200)

  const disbursements: IplDisbursement[] = (disbRaw ?? []).map((d: any) => {
    const creator = one<any>(d.creator)
    const confirmer = one<any>(d.confirmer)
    return {
      id: d.id,
      period: d.period,
      amount: Number(d.amount),
      note: d.note,
      status: d.status,
      reject_reason: d.reject_reason,
      created_at: d.created_at,
      confirmed_at: d.confirmed_at,
      created_by_name: creator ? displayName(creator) : null,
      confirmed_by_name: confirmer ? displayName(confirmer) : null,
    }
  })
  const waitingDisb = disbursements.filter((d) => d.status === 'dikirim').length

  const tabs = [
    { key: 'tagihan', label: 'Tagihan' },
    { key: 'tunggakan', label: 'Tunggakan' },
    { key: 'setoran', label: 'Setoran ke Paguyuban', badge: access.canConfirmIplDisbursement ? waitingDisb : undefined },
    ...(canManage ? [{ key: 'pengaturan', label: 'Pengaturan & Tarif' }] : []),
  ]
  const tab = tabs.some((t) => t.key === tabParam) ? (tabParam as string) : 'tagihan'

  let settingsPanel = null
  let defaultAmount = 0
  if (canManage) {
    const [{ data: settings }, { data: houses }, { data: rates }] = await Promise.all([
      supabase.from('ipl_settings').select('default_amount, due_day, late_fee').eq('id', 1).maybeSingle(),
      tab === 'pengaturan' ? supabase.from('houses').select('id, nomor_rumah') : Promise.resolve({ data: [] as any[] }),
      tab === 'pengaturan' ? supabase.from('ipl_house_rates').select('house_id, amount, note') : Promise.resolve({ data: [] as any[] }),
    ])
    const s = {
      default_amount: Number(settings?.default_amount ?? 0),
      due_day: Number(settings?.due_day ?? 10),
      late_fee: Number(settings?.late_fee ?? 0),
    }
    defaultAmount = s.default_amount
    if (tab === 'pengaturan') {
      const rateMap = new Map((rates ?? []).map((r: any) => [r.house_id as string, r]))
      const rows: IplHouseRate[] = (houses ?? [])
        .map((h: any) => ({
          house_id: h.id as string,
          nomor_rumah: h.nomor_rumah as string,
          amount: rateMap.has(h.id) ? Number(rateMap.get(h.id).amount) : null,
          note: rateMap.get(h.id)?.note ?? null,
        }))
        .sort((a, b) => sortHouse(a.nomor_rumah, b.nomor_rumah))
      settingsPanel = <IplSettingsPanel settings={s} rates={rows} />
    }
  }

  const totalCollected = bills.reduce((s, b) => s + Number(b.amount_paid || 0), 0)
  const backHref = access.role === 'manajemen' ? '/manajemen' : access.isSuperadmin ? '/superadmin' : access.isKetuaPaguyuban ? '/paguyuban' : '/dashboard'

  return (
    <main className="w-full" style={{ background: '#faf7f0', minHeight: '100vh' }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:px-10 md:py-14">
        <Header
          eyebrow={canManage ? 'Admin Manajemen' : access.roleLabel}
          subtitle={
            canManage
              ? 'Kelola tagihan, status bayar, denda, bukti bayar, dan setoran ke Paguyuban.'
              : 'Dikelola Admin Manajemen. Pengurus Paguyuban melihat status & mengonfirmasi setoran.'
          }
          backHref={backHref}
        />

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Tagihan Belum Lunas</div>
            <div className="mt-1 text-xl font-bold" style={{ color: '#e6c98a' }}>{unpaidCount}</div>
          </div>
          <div className="rounded-2xl px-5 py-4" style={cardStyle}>
            <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Tunggakan</div>
            <div className="mt-1 text-xl font-bold" style={{ color: '#b3392f' }}>{rupiah(totalOutstanding)}</div>
          </div>
        </div>

        <TabNav basePath="/iuran-ipl" tabs={tabs} active={tab} />

        {tab === 'tagihan' ? <IplBillsPanel bills={bills} canManage={canManage} defaultAmount={defaultAmount} /> : null}
        {tab === 'tunggakan' ? <IplArrears bills={bills} /> : null}
        {tab === 'setoran' ? (
          <IplDisbursementPanel items={disbursements} canSend={canManage} canConfirm={access.canConfirmIplDisbursement} totalCollected={totalCollected} />
        ) : null}
        {tab === 'pengaturan' ? settingsPanel : null}
      </div>
    </main>
  )
}

function Header({ eyebrow, subtitle, backHref = '/dashboard' }: { eyebrow: string; subtitle: string; backHref?: string }) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>{eyebrow}</span>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
          Iuran IPL
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#5b543f' }}>{subtitle}</p>
      </div>
      <Link href={backHref} className="flex-shrink-0 text-sm font-bold" style={{ color: '#9c7a3f' }}>Kembali</Link>
    </div>
  )
}