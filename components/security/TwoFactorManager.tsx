'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useBranding } from '@/components/BrandingProvider'

type Factor = { id: string; friendly_name?: string | null; status: string; created_at?: string }

const box: React.CSSProperties = { background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)', borderRadius: 18, padding: '18px 20px' }
const input: React.CSSProperties = {
  background: '#faf7f0',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#1f1a10',
  fontSize: 16,
  width: '100%',
  outline: 'none',
}

export default function TwoFactorManager({ required, forced }: { required: boolean; forced: boolean }) {
  const brand = useBranding()
  const [factors, setFactors] = useState<Factor[] | null>(null)
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [deviceName, setDeviceName] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors(((data?.all ?? []) as Factor[]).filter((f) => (f as { factor_type?: string }).factor_type !== 'phone'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const verified = (factors ?? []).filter((f) => f.status === 'verified')

  async function startEnroll() {
    setBusy(true)
    setMsg(null)
    const supabase = createClient()
    // Bersihkan pendaftaran lama yang belum selesai
    for (const f of (factors ?? []).filter((x) => x.status !== 'verified')) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
    const name = (deviceName.trim() || `HP ${verified.length + 1}`).slice(0, 40) + ` (${new Date().toLocaleDateString('id-ID')})`
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: name, issuer: brand.short_name })
    setBusy(false)
    if (error || !data) {
      setMsg({ ok: false, text: 'Gagal memulai. Tunggu sebentar lalu coba lagi. Kalau terus gagal, hubungi Superadmin.' })
      return
    }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret })
    setCode('')
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enroll) return
    const clean = code.replace(/\D/g, '')
    if (clean.length !== 6) {
      setMsg({ ok: false, text: 'Masukkan 6 digit kode yang tampil di aplikasi Authenticator.' })
      return
    }
    setBusy(true)
    setMsg(null)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enroll.id, code: clean })
    setBusy(false)
    if (error) {
      setMsg({ ok: false, text: 'Kode salah. Pastikan jam HP otomatis (tanggal & waktu jaringan), lalu coba kode terbaru.' })
      return
    }
    setEnroll(null)
    setDeviceName('')
    setMsg({ ok: true, text: '2FA aktif. Mulai sekarang setiap login akan diminta kode 6 digit.' })
    load()
  }

  async function cancelEnroll() {
    if (enroll) {
      const supabase = createClient()
      await supabase.auth.mfa.unenroll({ factorId: enroll.id })
    }
    setEnroll(null)
    load()
  }

  async function remove(f: Factor) {
    if (required && verified.length <= 1) {
      setMsg({ ok: false, text: 'Akun admin wajib punya minimal 1 perangkat 2FA. Tambahkan perangkat baru dulu, baru hapus yang lama.' })
      return
    }
    if (!confirm(`Hapus perangkat "${f.friendly_name ?? 'tanpa nama'}"? Kode dari perangkat itu tidak bisa dipakai lagi.`)) return
    setBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id })
    setBusy(false)
    setMsg(error ? { ok: false, text: 'Gagal menghapus. Masukkan kode 2FA dulu (login ulang) lalu coba lagi.' } : { ok: true, text: 'Perangkat dihapus.' })
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      {forced && verified.length === 0 ? (
        <div className="rounded-2xl px-5 py-4 text-[13px]" style={{ background: 'rgba(179,57,47,0.08)', border: '1px solid rgba(179,57,47,0.3)', color: '#7a2a22' }}>
          <b>Wajib untuk akun admin.</b> Pasang 2FA dulu sebelum membuka menu lain. Tombol Darurat tetap bisa dipakai kapan saja.
        </div>
      ) : null}

      <section style={box}>
        <div className="mb-1 text-[15px] font-bold" style={{ color: '#1f1a10' }}>
          Status: {factors === null ? 'memeriksa...' : verified.length ? `AKTIF (${verified.length} perangkat)` : 'BELUM AKTIF'}
        </div>
        <p className="text-[12.5px] leading-relaxed" style={{ color: '#5b543f' }}>
          2FA (verifikasi 2 langkah) membuat akunmu tetap aman walau password bocor: selain password, login butuh kode 6 digit yang
          berganti tiap 30 detik di HP-mu. {required ? 'Wajib untuk akun admin.' : 'Tidak wajib untuk akunmu, tapi sangat disarankan.'}
        </p>

        {verified.length ? (
          <ul className="mt-3 flex flex-col gap-2">
            {verified.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5" style={{ background: '#faf7f0' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#1f1a10' }}>{f.friendly_name || 'Perangkat'}</span>
                <button type="button" disabled={busy} onClick={() => remove(f)} className="text-[12px] font-bold" style={{ color: '#b3392f' }}>
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!enroll ? (
        <section style={box}>
          <div className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>
            {verified.length ? 'Tambah perangkat cadangan (disarankan)' : 'Pasang 2FA'}
          </div>
          <ol className="mb-3 list-decimal pl-5 text-[12.5px] leading-relaxed" style={{ color: '#5b543f' }}>
            <li>Pasang aplikasi <b>Google Authenticator</b> atau <b>Microsoft Authenticator</b> dari Play Store / App Store.</li>
            <li>Tekan tombol di bawah, lalu scan QR yang muncul dengan aplikasi tersebut.</li>
            <li>Ketik 6 digit kode yang tampil di aplikasi untuk menyelesaikan.</li>
          </ol>
          {verified.length ? (
            <p className="mb-3 text-[12px]" style={{ color: '#7a5a1f' }}>
              Perangkat cadangan (mis. HP kedua atau tablet) mencegah akun terkunci kalau HP utama hilang.
            </p>
          ) : null}
          <input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} maxLength={30} placeholder="Nama perangkat, mis. HP Samsung" aria-label="Nama perangkat" style={input} />
          <button
            type="button"
            disabled={busy || factors === null}
            onClick={startEnroll}
            className="mt-3 w-full rounded-xl py-3 text-[13.5px] font-bold"
            style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Menyiapkan...' : 'Tampilkan QR'}
          </button>
        </section>
      ) : (
        <section style={box}>
          <div className="mb-2 text-[14px] font-bold" style={{ color: '#1f1a10' }}>Scan QR ini dengan aplikasi Authenticator</div>
          <div className="mx-auto my-2 w-fit rounded-2xl bg-white p-3" style={{ border: '1px solid rgba(26,19,5,0.1)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qr} alt="QR kode 2FA" width={200} height={200} />
          </div>
          <button type="button" onClick={() => setShowSecret(!showSecret)} className="text-[12px] font-bold" style={{ color: '#9c7a3f' }}>
            {showSecret ? 'Sembunyikan kode manual' : 'Tidak bisa scan? Tampilkan kode manual'}
          </button>
          {showSecret ? (
            <p className="mt-1 break-all rounded-lg px-3 py-2 font-mono text-[13px]" style={{ background: '#faf7f0', color: '#1f1a10' }}>
              {enroll.secret}
            </p>
          ) : null}
          <form onSubmit={confirmEnroll} className="mt-3 flex flex-col gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Kode 6 digit"
              aria-label="Kode 6 digit"
              className="text-center tabular-nums"
              style={{ ...input, fontSize: 22, letterSpacing: '0.35em' }}
            />
            <div className="flex gap-2">
              <button type="button" onClick={cancelEnroll} className="flex-1 rounded-xl py-3 text-[13px] font-bold" style={{ background: '#faf7f0', color: '#5b543f' }}>
                Batal
              </button>
              <button type="submit" disabled={busy || code.length !== 6} className="flex-[2] rounded-xl py-3 text-[13px] font-bold" style={{ background: '#1a1305', color: 'var(--brand-accent)', opacity: busy || code.length !== 6 ? 0.6 : 1 }}>
                {busy ? 'Memeriksa...' : 'Aktifkan 2FA'}
              </button>
            </div>
          </form>
        </section>
      )}

      {msg ? (
        <p role="status" className="text-[13px] font-bold" style={{ color: msg.ok ? '#2f6b4f' : '#b3392f' }}>
          {msg.text}
        </p>
      ) : null}

      {forced && verified.length > 0 ? (
        <a href="/dashboard" className="rounded-xl py-3 text-center text-[13.5px] font-bold" style={{ background: '#2f6b4f', color: '#ffffff' }}>
          Lanjut ke Beranda
        </a>
      ) : null}

      {forced ? (
        <div className="flex items-center justify-center gap-5">
          <a href="/darurat" className="text-[12.5px] font-bold" style={{ color: '#b3392f' }}>Tombol Darurat</a>
          <button
            type="button"
            onClick={async () => {
              await createClient().auth.signOut()
              window.location.href = '/login'
            }}
            className="text-[12.5px] font-bold"
            style={{ color: '#9c7a3f' }}
          >
            Keluar
          </button>
        </div>
      ) : null}

      <section className="text-[12px] leading-relaxed" style={{ color: '#5b543f' }}>
        <b style={{ color: '#1f1a10' }}>Kalau HP hilang:</b> login dengan perangkat cadangan. Kalau tidak punya cadangan, minta Superadmin
        mereset 2FA di menu Keamanan, lalu pasang ulang. Jangan membagikan QR atau kode manual ke siapa pun.
      </section>
    </div>
  )
}