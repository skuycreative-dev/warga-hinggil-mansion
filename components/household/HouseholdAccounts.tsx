'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  addGoalEntry,
  deleteAccount,
  deleteGoal,
  deleteGoalEntry,
  saveAccount,
  saveGoal,
  setAccountArchived,
  setGoalDone,
  type HhFormState,
} from '@/app/keuangan-rumah/actions'
import { ACCOUNT_KIND_LABEL, GOAL_CATEGORY_LABEL, type HhAccount, type HhGoal } from '@/lib/household-finance'
import { cardStyle, dateLabel, formatAmountInput, inputStyle, labelStyle, monthsBetween, parseAmount, rupiah, todayWib } from '@/lib/format'

const initialState: HhFormState = { error: '', success: false }

const GOAL_COLOR: Record<string, string> = {
  pendidikan: '#3b5b8a',
  tabungan: '#2f6b4f',
  dana_darurat: '#b3392f',
  ibadah: '#6b4f8a',
  rumah: '#9c7a3f',
  kendaraan: '#4f6b6b',
  kesehatan: '#8a3b5b',
  liburan: '#2f7a8a',
  lainnya: '#5b543f',
}

function signedAmountInput(raw: string) {
  const neg = raw.trim().startsWith('-')
  const formatted = formatAmountInput(raw)
  return neg ? `-${formatted}` : formatted
}

export default function HouseholdAccounts({
  accounts,
  goals,
  unassigned,
  totalBalance,
}: {
  accounts: HhAccount[]
  goals: HhGoal[]
  unassigned: number
  totalBalance: number
}) {
  const router = useRouter()
  const today = todayWib()
  const [isPending, startTransition] = useTransition()
  const [accState, accAction, accSaving] = useActionState(saveAccount, initialState)
  const [goalState, goalAction, goalSaving] = useActionState(saveGoal, initialState)

  const [accForm, setAccForm] = useState<{ open: boolean; account: HhAccount | null }>({ open: false, account: null })
  const [opening, setOpening] = useState('')
  const [goalForm, setGoalForm] = useState<{ open: boolean; goal: HhGoal | null }>({ open: false, goal: null })
  const [goalTarget, setGoalTarget] = useState('')
  const [goalMonthly, setGoalMonthly] = useState('')
  const [entry, setEntry] = useState<{ goalId: string; withdraw: boolean; amount: string; note: string; date: string } | null>(null)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (accState.success) {
      setAccForm({ open: false, account: null })
      router.refresh()
    }
  }, [accState, router])

  useEffect(() => {
    if (goalState.success) {
      setGoalForm({ open: false, goal: null })
      router.refresh()
    }
  }, [goalState, router])

  const activeGoals = goals.filter((g) => !g.is_done)
  const earmarked = activeGoals.reduce((s, g) => s + Math.max(g.saved, 0), 0)
  const free = totalBalance - earmarked
  const visibleAccounts = accounts.filter((a) => showArchived || !a.is_archived)
  const archivedCount = accounts.filter((a) => a.is_archived).length

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    setError('')
    startTransition(async () => {
      const result = await fn()
      if (result.error) {
        setError(result.error)
        return
      }
      after?.()
      router.refresh()
    })
  }

  function openAccount(account: HhAccount | null) {
    setOpening(account ? signedAmountInput(String(account.opening_balance)) : '')
    setAccForm({ open: true, account })
  }

  function openGoal(goal: HhGoal | null) {
    setGoalTarget(goal ? formatAmountInput(String(goal.target_amount)) : '')
    setGoalMonthly(goal?.monthly_plan ? formatAmountInput(String(goal.monthly_plan)) : '')
    setGoalForm({ open: true, goal })
  }

  function submitEntry() {
    if (!entry) return
    const amount = parseAmount(entry.amount)
    run(() => addGoalEntry(entry.goalId, amount, entry.withdraw, entry.note, entry.date), () => setEntry(null))
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------------------------------------ Ringkasan dana */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="rounded-2xl px-5 py-4" style={{ background: '#1a1305' }}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Total Saldo</div>
          <div className="mt-1 text-xl font-bold" style={{ color: totalBalance >= 0 ? 'var(--brand-accent)' : '#f2b8b0' }}>{rupiah(totalBalance)}</div>
          <div className="text-[11px]" style={{ color: '#9c7a3f' }}>Semua rekening</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Disisihkan di Pos</div>
          <div className="mt-1 text-lg font-bold" style={{ color: '#3b5b8a' }}>{rupiah(earmarked)}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>{activeGoals.length} pos tujuan aktif</div>
        </div>
        <div className="rounded-2xl px-5 py-4" style={cardStyle}>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Dana Bebas</div>
          <div className="mt-1 text-lg font-bold" style={{ color: free >= 0 ? '#2f6b4f' : '#b3392f' }}>{rupiah(free)}</div>
          <div className="text-[11px]" style={{ color: '#5b543f' }}>{free >= 0 ? 'Aman dipakai belanja rutin' : 'Pos melebihi saldo, kurangi setoran pos'}</div>
        </div>
      </div>

      {error ? <p className="-mt-4 text-[12.5px] font-bold" style={{ color: '#b3392f' }}>{error}</p> : null}

      {/* ------------------------------------------------------------ Rekening */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Rekening</span>
          <div className="flex items-center gap-3">
            {archivedCount > 0 ? (
              <button type="button" onClick={() => setShowArchived(!showArchived)} className="text-[11.5px] font-bold" style={{ color: '#5b543f' }}>
                {showArchived ? 'Sembunyikan arsip' : `Lihat arsip (${archivedCount})`}
              </button>
            ) : null}
            <button type="button" onClick={() => openAccount(null)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
              + Rekening
            </button>
          </div>
        </div>

        {accForm.open ? (
          <form key={accForm.account?.id ?? 'baru'} action={accAction} className="mb-3 grid grid-cols-1 gap-2.5 rounded-2xl px-4 py-4 sm:grid-cols-3" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
            <input type="hidden" name="id" value={accForm.account?.id ?? ''} />
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="acc-name">Nama</label>
              <input id="acc-name" name="name" required maxLength={40} defaultValue={accForm.account?.name ?? ''} placeholder="mis. BCA Ayah, Dompet, GoPay" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="acc-kind">Jenis</label>
              <select id="acc-kind" name="kind" defaultValue={accForm.account?.kind ?? 'bank'} style={inputStyle}>
                {Object.entries(ACCOUNT_KIND_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="acc-open">Saldo awal (saat mulai dicatat)</label>
              <input id="acc-open" name="opening_balance" inputMode="numeric" value={opening} onChange={(e) => setOpening(signedAmountInput(e.target.value))} placeholder="0" style={inputStyle} />
            </div>
            {accState.error ? <p className="text-[12px] font-bold sm:col-span-3" style={{ color: '#b3392f' }}>{accState.error}</p> : null}
            <div className="flex gap-2 sm:col-span-3">
              <button type="button" onClick={() => setAccForm({ open: false, account: null })} className="rounded-lg px-4 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
                Batal
              </button>
              <button type="submit" disabled={accSaving} className="flex-1 rounded-lg py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                {accSaving ? 'Menyimpan...' : accForm.account ? 'Simpan Rekening' : 'Tambah Rekening'}
              </button>
            </div>
          </form>
        ) : null}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleAccounts.length === 0 && unassigned === 0 ? (
            <div className="rounded-2xl px-5 py-6 text-center text-[13px] sm:col-span-2" style={{ ...cardStyle, color: '#5b543f' }}>
              Belum ada rekening. Tambahkan rekening bank, uang tunai, atau e-wallet supaya saldo tiap tempat terlihat jelas.
            </div>
          ) : null}
          {visibleAccounts.map((a) => (
            <div key={a.id} className="rounded-2xl px-4 py-3.5" style={{ ...cardStyle, opacity: a.is_archived ? 0.6 : 1 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>{a.name}</div>
                  <div className="text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                    {ACCOUNT_KIND_LABEL[a.kind] ?? a.kind}
                    {a.is_archived ? ' · diarsipkan' : ''}
                  </div>
                </div>
                <div className="text-[14px] font-bold" style={{ color: a.balance >= 0 ? '#1f1a10' : '#b3392f' }}>{rupiah(a.balance)}</div>
              </div>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => openAccount(a)} className="text-[11.5px] font-bold" style={{ color: '#9c7a3f' }}>Ubah</button>
                <button type="button" disabled={isPending} onClick={() => run(() => setAccountArchived(a.id, !a.is_archived))} className="text-[11.5px] font-bold" style={{ color: '#5b543f' }}>
                  {a.is_archived ? 'Aktifkan' : 'Arsipkan'}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm(`Hapus rekening ${a.name}? Rekening yang sudah punya transaksi tidak bisa dihapus (arsipkan saja).`)) return
                    run(() => deleteAccount(a.id))
                  }}
                  className="text-[11.5px] font-bold"
                  style={{ color: '#b3392f' }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {unassigned !== 0 ? (
            <div className="rounded-2xl px-4 py-3.5" style={{ background: '#faf7f0', border: '1px dashed rgba(26,19,5,0.18)' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Tanpa rekening</div>
                  <div className="text-[11px]" style={{ color: '#5b543f' }}>Transaksi lama / yang tidak dipilih rekeningnya</div>
                </div>
                <div className="text-[14px] font-bold" style={{ color: unassigned >= 0 ? '#1f1a10' : '#b3392f' }}>{rupiah(unassigned)}</div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------------ Pos tujuan */}
      <section>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>Pos Tujuan</span>
          <button type="button" onClick={() => openGoal(null)} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
            + Pos Tujuan
          </button>
        </div>
        <p className="mb-3 text-[11.5px]" style={{ color: '#5b543f' }}>
          Sisihkan dana untuk pendidikan anak, dana darurat, tabungan, ibadah, dan lainnya. Uangnya tetap di rekening; pos hanya menandai "sudah ada peruntukannya".
        </p>

        {goalForm.open ? (
          <form key={goalForm.goal?.id ?? 'baru'} action={goalAction} className="mb-3 grid grid-cols-1 gap-2.5 rounded-2xl px-4 py-4 sm:grid-cols-2" style={{ background: '#ffffff', border: '1px solid rgba(212,175,106,0.45)' }}>
            <input type="hidden" name="id" value={goalForm.goal?.id ?? ''} />
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-name">Nama pos</label>
              <input id="goal-name" name="name" required maxLength={40} defaultValue={goalForm.goal?.name ?? ''} placeholder="mis. Kuliah Kakak 2032" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-cat">Kategori</label>
              <select id="goal-cat" name="category" defaultValue={goalForm.goal?.category ?? 'pendidikan'} style={inputStyle}>
                {Object.entries(GOAL_CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-target">Target dana (Rp)</label>
              <input id="goal-target" name="target_amount" inputMode="numeric" required value={goalTarget} onChange={(e) => setGoalTarget(formatAmountInput(e.target.value))} placeholder="50.000.000" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-date">Target tercapai (opsional)</label>
              <input id="goal-date" name="target_date" type="date" defaultValue={goalForm.goal?.target_date ?? ''} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-monthly">Rencana setor / bulan (opsional)</label>
              <input id="goal-monthly" name="monthly_plan" inputMode="numeric" value={goalMonthly} onChange={(e) => setGoalMonthly(formatAmountInput(e.target.value))} placeholder="1.000.000" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle} htmlFor="goal-acc">Disimpan di rekening (opsional)</label>
              <select id="goal-acc" name="account_id" defaultValue={goalForm.goal?.account_id ?? ''} style={inputStyle}>
                <option value="">Tidak ditentukan</option>
                {accounts
                  .filter((a) => !a.is_archived)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label style={labelStyle} htmlFor="goal-note">Catatan (opsional)</label>
              <input id="goal-note" name="note" maxLength={200} defaultValue={goalForm.goal?.note ?? ''} style={inputStyle} />
            </div>
            {goalState.error ? <p className="text-[12px] font-bold sm:col-span-2" style={{ color: '#b3392f' }}>{goalState.error}</p> : null}
            <div className="flex gap-2 sm:col-span-2">
              <button type="button" onClick={() => setGoalForm({ open: false, goal: null })} className="rounded-lg px-4 py-2 text-[12.5px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
                Batal
              </button>
              <button type="submit" disabled={goalSaving} className="flex-1 rounded-lg py-2 text-[12.5px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                {goalSaving ? 'Menyimpan...' : goalForm.goal ? 'Simpan Pos' : 'Tambah Pos'}
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-col gap-2.5">
          {goals.length === 0 ? (
            <div className="rounded-2xl px-5 py-6 text-center text-[13px]" style={{ ...cardStyle, color: '#5b543f' }}>
              Belum ada pos tujuan. Mulai dari Dana Darurat (idealnya 3-6x pengeluaran bulanan) lalu Pendidikan.
            </div>
          ) : null}
          {goals.map((g) => {
            const pct = Math.min(Math.max(g.saved / g.target_amount, 0), 1)
            const remaining = Math.max(g.target_amount - g.saved, 0)
            const monthsLeft = g.target_date ? Math.max(monthsBetween(today.slice(0, 7), g.target_date.slice(0, 7)), 1) : null
            const needPerMonth = monthsLeft && remaining > 0 ? Math.ceil(remaining / monthsLeft) : null
            const behind = needPerMonth && g.monthly_plan ? g.monthly_plan < needPerMonth : false
            const color = GOAL_COLOR[g.category] ?? '#5b543f'
            const isEntry = entry?.goalId === g.id

            return (
              <div key={g.id} className="rounded-2xl px-4 py-4" style={{ ...cardStyle, opacity: g.is_done ? 0.65 : 1 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>{g.name}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: `${color}1a`, color }}>
                        {GOAL_CATEGORY_LABEL[g.category] ?? g.category}
                      </span>
                      {g.is_done ? <span className="text-[10.5px] font-bold" style={{ color: '#2f6b4f' }}>Selesai</span> : null}
                    </div>
                    <div className="mt-0.5 text-[11.5px]" style={{ color: '#5b543f' }}>
                      {rupiah(g.saved)} dari {rupiah(g.target_amount)}
                      {g.target_date ? ` · target ${dateLabel(g.target_date)}` : ''}
                      {g.account_id ? ` · di ${accounts.find((a) => a.id === g.account_id)?.name ?? '-'}` : ''}
                    </div>
                  </div>
                  <div className="text-[15px] font-bold" style={{ color }}>{Math.round(pct * 100)}%</div>
                </div>

                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full" style={{ background: '#f1ece0' }} role="progressbar" aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres ${g.name}`}>
                  <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
                </div>

                {!g.is_done && remaining > 0 ? (
                  <div className="mt-2 text-[11.5px]" style={{ color: behind ? '#b3392f' : '#5b543f' }}>
                    Kurang {rupiah(remaining)}
                    {needPerMonth ? ` · perlu ±${rupiah(needPerMonth)}/bulan selama ${monthsLeft} bulan` : ''}
                    {g.monthly_plan ? ` · rencana ${rupiah(g.monthly_plan)}/bulan` : ''}
                    {behind ? ' (rencana belum cukup)' : ''}
                  </div>
                ) : null}
                {g.note ? <div className="mt-1 text-[11.5px] italic" style={{ color: '#7a6f55' }}>{g.note}</div> : null}

                {isEntry && entry ? (
                  <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl px-3 py-3 sm:grid-cols-3" style={{ background: '#faf7f0' }}>
                    <input
                      inputMode="numeric"
                      autoFocus
                      value={entry.amount}
                      placeholder={entry.withdraw ? 'Nominal ditarik' : 'Nominal disetor'}
                      onChange={(e) => setEntry({ ...entry, amount: formatAmountInput(e.target.value) })}
                      style={{ ...inputStyle, background: '#fff' }}
                    />
                    <input type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                    <input value={entry.note} maxLength={120} placeholder="Catatan (opsional)" onChange={(e) => setEntry({ ...entry, note: e.target.value })} style={{ ...inputStyle, background: '#fff' }} />
                    <div className="flex gap-2 sm:col-span-3">
                      <button type="button" onClick={() => setEntry(null)} className="rounded-lg px-3 py-2 text-[12px] font-bold" style={{ background: '#fff', color: '#5b543f' }}>
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isPending || !parseAmount(entry.amount)}
                        onClick={submitEntry}
                        className="flex-1 rounded-lg py-2 text-[12px] font-bold"
                        style={{ background: entry.withdraw ? '#b3392f' : '#1a1305', color: entry.withdraw ? '#fff' : 'var(--brand-accent)' }}
                      >
                        {entry.withdraw ? 'Tarik dari Pos' : 'Setor ke Pos'}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {!g.is_done ? (
                    <>
                      <button type="button" onClick={() => setEntry({ goalId: g.id, withdraw: false, amount: g.monthly_plan ? formatAmountInput(String(g.monthly_plan)) : '', note: '', date: today })} className="text-[12px] font-bold" style={{ color: '#2f6b4f' }}>
                        + Setor
                      </button>
                      <button type="button" onClick={() => setEntry({ goalId: g.id, withdraw: true, amount: '', note: '', date: today })} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
                        − Tarik
                      </button>
                    </>
                  ) : null}
                  <button type="button" onClick={() => setHistoryId(historyId === g.id ? null : g.id)} className="text-[12px] font-bold" style={{ color: '#5b543f' }}>
                    Riwayat ({g.entries.length})
                  </button>
                  <button type="button" onClick={() => openGoal(g)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>Ubah</button>
                  <button type="button" disabled={isPending} onClick={() => run(() => setGoalDone(g.id, !g.is_done))} className="text-[12px] font-bold" style={{ color: '#5b543f' }}>
                    {g.is_done ? 'Aktifkan lagi' : 'Tandai selesai'}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (!confirm(`Hapus pos ${g.name} beserta riwayat setorannya? Saldo rekening tidak berubah.`)) return
                      run(() => deleteGoal(g.id))
                    }}
                    className="text-[12px] font-bold"
                    style={{ color: '#b3392f' }}
                  >
                    Hapus
                  </button>
                </div>

                {historyId === g.id ? (
                  <div className="mt-3 flex flex-col" style={{ borderTop: '1px solid rgba(26,19,5,0.06)' }}>
                    {g.entries.length === 0 ? <p className="pt-2 text-[12px]" style={{ color: '#5b543f' }}>Belum ada setoran.</p> : null}
                    {g.entries.slice(0, 20).map((e) => (
                      <div key={e.id} className="flex items-center justify-between gap-2 py-1.5 text-[12px]">
                        <span style={{ color: '#5b543f' }}>
                          {dateLabel(e.entry_date)}
                          {e.note ? ` · ${e.note}` : ''}
                        </span>
                        <span className="flex items-center gap-2">
                          <b style={{ color: e.amount >= 0 ? '#2f6b4f' : '#b3392f' }}>
                            {e.amount >= 0 ? '+' : '−'}
                            {rupiah(Math.abs(e.amount))}
                          </b>
                          <button
                            type="button"
                            aria-label="Hapus setoran"
                            disabled={isPending}
                            onClick={() => {
                              if (!confirm('Hapus catatan setoran ini?')) return
                              run(() => deleteGoalEntry(e.id))
                            }}
                            className="text-[11px] font-bold"
                            style={{ color: '#b3392f' }}
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}