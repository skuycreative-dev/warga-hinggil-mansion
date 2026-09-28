'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useBranding } from '@/components/BrandingProvider'
import { createResetLink, resetAdmin2fa, setResetStatus, unlockLogin } from '@/app/superadmin/keamanan/actions'
import { useConfirm } from '@/components/ModalProvider'

export type ResetRow = {
  id: string
  status: string
  identifier: string
  note: string | null
  request_count: number
  created_at: string
  updated_at: string
  user_id: string | null
  full_name: string | null
  nickname: string | null
  phone: string | null
  email: string | null
  nomor_rumah: string | null
  role: string | null
  account_status: string | null
  handled_name: string | null
  sent_via: string | null
}
export type LockRow = { key: string; kind: string; label: string | null; fail_count: number; last_fail_at: string | null; locked_until: string | null; lock_count: number }
export type AdminFactorRow = { id: string; name: string; role: string; factors: number; isMe: boolean }

const card: React.CSSProperties = { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', borderRadius: 18, padding: '16px 18px' }
const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  baru: { label: 'Baru', color: '#b3392f', bg: 'rgba(179,57,47,0.1)' },
  dikirim: { label: 'Link dikirim', color: '#3b5b8a', bg: 'rgba(59,91,138,0.12)' },
  selesai: { label: 'Selesai', color: '#2f6b4f', bg: 'rgba(47,107,79,0.12)' },
  ditolak: { label: 'Ditolak', color: '#6b6552', bg: 'rgba(107,101,82,0.14)' },
}

function when(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function waNumber(phone: string | null) {
  const d = (phone ?? '').replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('62')) return d
  if (d.startsWith('0')) return '62' + d.slice(1)
  return d
}

function template(name: string | null, link: string, appName: string) {
  return [
    `Halo ${name || 'Warga'},`,
    '',
    `Ini Superadmin aplikasi ${appName}. Kami menerima permintaan atur ulang password akunmu.`,
    '',
    'Buka link berikut, tekan "Lanjutkan", lalu buat password baru:',
    link,
    '',
    'Link hanya bisa dipakai 1 kali dan berlaku 1 jam. Jangan teruskan link ini ke siapa pun.',
    'Kalau kamu tidak merasa meminta, abaikan pesan ini dan kabari Superadmin.',
  ].join('\n')
}

function ResetCard({ r }: { r: ResetRow }) {
  const brand = useBranding()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const [link, setLink] = useState<{ url: string; email: string | null; phone: string | null; name: string | null } | null>(null)
  const [msg, setMsg] = useState('')
  const st = STATUS[r.status] ?? STATUS.baru
  const open = r.status === 'baru' || r.status === 'dikirim'

  function makeLink() {
    setMsg('')
    startTransition(async () => {
      const res = await createResetLink(r.id)
      if (!res.ok || !res.link) {
        setMsg(res.error ?? 'Gagal membuat link.')
        return
      }
      setLink({ url: res.link, email: res.email ?? null, phone: res.phone ?? null, name: res.name ?? null })
    })
  }

  function send(via: 'whatsapp' | 'gmail') {
    if (!link) return
    const text = template(link.name, link.url, brand.app_name)
    let url = ''
    if (via === 'whatsapp') {
      const n = waNumber(link.phone)
      url = n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`
    } else {
      url =
        'https://mail.google.com/mail/?view=cm&fs=1' +
        `&to=${encodeURIComponent(link.email ?? '')}` +
        `&su=${encodeURIComponent(`Atur ulang password - ${brand.app_name}`)}` +
        `&body=${encodeURIComponent(text)}`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    startTransition(async () => {
      await setResetStatus(r.id, 'dikirim', via)
      router.refresh()
    })
  }

  async function mark(status: 'selesai' | 'ditolak') {
    if (status === 'ditolak' && !(await confirmModal('Tolak permintaan ini? Gunakan kalau permintaan mencurigakan atau bukan dari pemilik akun.', { danger: true }))) return
    startTransition(async () => {
      await setResetStatus(r.id, status, null)
      router.refresh()
    })
  }

  return (
    <div style={card}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[14px] font-bold" style={{ color: '#1f1a10' }}>
            {r.user_id ? r.nickname || r.full_name || 'Tanpa nama' : 'Tidak cocok dengan akun mana pun'}
            {r.nomor_rumah ? <span className="font-medium" style={{ color: '#5b543f' }}> · Rumah {r.nomor_rumah}</span> : null}
          </div>
          <div className="mt-0.5 break-all text-[12px]" style={{ color: '#5b543f' }}>
            Diminta dengan: <b>{r.identifier}</b>
            {r.request_count > 1 ? ` · ${r.request_count}x` : ''} · {when(r.updated_at)}
          </div>
          {r.user_id ? (
            <div className="mt-0.5 break-all text-[12px]" style={{ color: '#5b543f' }}>
              Email akun: {r.email ?? '-'} · HP: {r.phone ?? '-'} · {r.role ?? '-'} ({r.account_status ?? '-'})
            </div>
          ) : null}
          {r.note ? <div className="mt-1 text-[12px] italic" style={{ color: '#7a5a1f' }}>&ldquo;{r.note}&rdquo;</div> : null}
          {r.handled_name ? (
            <div className="mt-0.5 text-[11.5px]" style={{ color: '#9c7a3f' }}>
              Ditangani {r.handled_name}
              {r.sent_via ? ` lewat ${r.sent_via === 'whatsapp' ? 'WhatsApp' : 'Gmail'}` : ''}
            </div>
          ) : null}
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
      </div>

      {open && r.user_id ? (
        <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: 'rgba(26,19,5,0.06)' }}>
          <p className="text-[11.5px]" style={{ color: '#7a5a1f' }}>
            Cocokkan dulu: pastikan yang meminta memang pemilik akun (mis. telepon balik ke nomor di atas) sebelum mengirim link.
          </p>
          {!link ? (
            <button type="button" disabled={isPending} onClick={makeLink} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Membuat link...' : 'Buat Link Reset (sekali pakai)'}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={isPending} onClick={() => send('whatsapp')} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#1f7a4d', color: '#ffffff' }}>
                Kirim via WhatsApp
              </button>
              <button type="button" disabled={isPending || !link.email} onClick={() => send('gmail')} className="rounded-xl py-2.5 text-[13px] font-bold" style={{ background: '#b3392f', color: '#ffffff', opacity: link.email ? 1 : 0.5 }}>
                Kirim via Gmail
              </button>
            </div>
          )}
          <div className="flex gap-4">
            <button type="button" disabled={isPending} onClick={() => mark('selesai')} className="text-[12px] font-bold" style={{ color: '#2f6b4f' }}>Tandai selesai</button>
            <button type="button" disabled={isPending} onClick={() => mark('ditolak')} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>Tolak</button>
          </div>
        </div>
      ) : null}
      {open && !r.user_id ? (
        <div className="mt-2">
          <button type="button" disabled={isPending} onClick={() => mark('ditolak')} className="text-[12px] font-bold" style={{ color: '#6b6552' }}>Tutup permintaan</button>
        </div>
      ) : null}
      {msg ? <p className="mt-2 text-[12px] font-bold" style={{ color: '#b3392f' }}>{msg}</p> : null}
    </div>
  )
}

export default function SecurityCenter({ resets, locks, admins }: { resets: ResetRow[]; locks: LockRow[]; admins: AdminFactorRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const confirmModal = useConfirm()
  const [msg, setMsg] = useState('')
  const openResets = resets.filter((r) => r.status === 'baru' || r.status === 'dikirim')
  const doneResets = resets.filter((r) => !(r.status === 'baru' || r.status === 'dikirim')).slice(0, 20)
  const now = Date.now()
  const activeLocks = locks.filter((l) => l.locked_until && new Date(l.locked_until).getTime() > now)

  function run(fn: () => Promise<{ ok: boolean; error: string | null }>, okText: string) {
    setMsg('')
    startTransition(async () => {
      const r = await fn()
      setMsg(r.ok ? okText : r.error ?? 'Gagal.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section id="reset" className="scroll-mt-20">
        <h2 className="mb-3 text-[16px] font-bold" style={{ color: '#1f1a10' }}>Permintaan Reset Password ({openResets.length} menunggu)</h2>
        <div className="flex flex-col gap-3">
          {openResets.length === 0 ? <p className="text-[13px]" style={{ color: '#5b543f' }}>Tidak ada permintaan yang menunggu.</p> : null}
          {openResets.map((r) => (
            <ResetCard key={r.id} r={r} />
          ))}
        </div>
        {doneResets.length ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-[12.5px] font-bold" style={{ color: '#9c7a3f' }}>Riwayat ({doneResets.length})</summary>
            <div className="mt-2 flex flex-col gap-2">
              {doneResets.map((r) => (
                <ResetCard key={r.id} r={r} />
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <section>
        <h2 className="mb-1 text-[16px] font-bold" style={{ color: '#1f1a10' }}>Login Terkunci ({activeLocks.length})</h2>
        <p className="mb-3 text-[12px]" style={{ color: '#5b543f' }}>
          Akun terkunci 5 menit setelah salah password 3 kali; satu jaringan terkunci 5 menit setelah 10 kali salah. Kunci terbuka sendiri,
          tapi bisa dibuka lebih cepat di sini kalau pemilik akun sudah dikonfirmasi.
        </p>
        <div className="flex flex-col gap-2">
          {locks.length === 0 ? <p className="text-[13px]" style={{ color: '#5b543f' }}>Tidak ada percobaan gagal dalam 24 jam terakhir.</p> : null}
          {locks.map((l) => {
            const locked = !!l.locked_until && new Date(l.locked_until).getTime() > now
            return (
              <div key={l.key} className="flex flex-wrap items-center justify-between gap-2" style={{ ...card, padding: '12px 14px' }}>
                <div className="min-w-0 text-[12.5px]" style={{ color: '#1f1a10' }}>
                  <b>{l.kind === 'jaringan' ? 'Jaringan / perangkat' : l.label ?? 'Akun'}</b>
                  <div style={{ color: '#5b543f' }}>
                    {locked ? `Terkunci sampai ${when(l.locked_until)}` : `Gagal ${l.fail_count}x, terakhir ${when(l.last_fail_at)}`}
                    {l.lock_count > 1 ? ` · pernah terkunci ${l.lock_count}x` : ''}
                  </div>
                </div>
                {locked ? (
                  <button type="button" disabled={isPending} onClick={() => run(() => unlockLogin(l.key), 'Kunci dibuka.')} className="rounded-lg px-3 py-1.5 text-[12px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)' }}>
                    Buka kunci
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-[16px] font-bold" style={{ color: '#1f1a10' }}>2FA Akun Admin</h2>
        <p className="mb-3 text-[12px]" style={{ color: '#5b543f' }}>
          Reset hanya kalau admin kehilangan HP dan tidak punya perangkat cadangan. Setelah direset, admin itu wajib memasang 2FA lagi saat
          login berikutnya.
        </p>
        <div className="flex flex-col gap-2">
          {admins.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2" style={{ ...card, padding: '12px 14px' }}>
              <div className="text-[12.5px]" style={{ color: '#1f1a10' }}>
                <b>{a.name}</b>
                {a.isMe ? ' (kamu)' : ''} <span style={{ color: '#5b543f' }}>· {a.role}</span>
                <div style={{ color: a.factors ? '#2f6b4f' : '#b3392f' }}>{a.factors ? `2FA aktif (${a.factors} perangkat)` : 'Belum memasang 2FA'}</div>
              </div>
              {a.factors && !a.isMe ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={async () => {
                    if (!(await confirmModal(`Reset 2FA milik ${a.name}? Pastikan kamu sudah menghubungi orangnya langsung.`, { danger: true }))) return
                    run(() => resetAdmin2fa(a.id), `2FA ${a.name} direset.`)
                  }}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                  style={{ background: '#faf7f0', color: '#b3392f', border: '1px solid rgba(179,57,47,0.3)' }}
                >
                  Reset 2FA
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {msg ? <p role="status" className="text-[13px] font-bold" style={{ color: '#2f6b4f' }}>{msg}</p> : null}
    </div>
  )
}