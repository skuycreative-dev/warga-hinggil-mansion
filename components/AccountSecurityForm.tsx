'use client'

import { useState, useTransition } from 'react'
import { changeEmail, changePassword } from '@/app/profile/actions'

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid rgba(26,19,5,0.12)',
  borderRadius: '11px',
  padding: '11px 13px',
  color: '#1f1a10',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}
const labelStyle: React.CSSProperties = { fontSize: '11.5px', fontWeight: 700, color: '#5b543f' }
const hintStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: '#9c7a3f' }

// Ubah Email & Kata Sandi langsung dari Profil Saya -- sebelumnya tidak ada sama sekali (warga cuma
// bisa lewat "Lupa Password" kalau lupa). Password saat ini selalu diminta dulu (Kebutuhan #1, 29 Sep 2026).
export default function AccountSecurityForm({ email }: { email: string }) {
  const [openEmail, setOpenEmail] = useState(false)
  const [openPassword, setOpenPassword] = useState(false)

  const [emailPw, setEmailPw] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [emailPending, startEmail] = useTransition()

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwPending, startPw] = useTransition()

  function submitEmail() {
    setEmailMsg(null)
    startEmail(async () => {
      const r = await changeEmail(emailPw, newEmail)
      setEmailMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'Berhasil.') : r.error ?? 'Gagal.' })
      if (r.ok) {
        setEmailPw('')
        setNewEmail('')
      }
    })
  }

  function submitPassword() {
    setPwMsg(null)
    startPw(async () => {
      const r = await changePassword(curPw, newPw, confirmPw)
      setPwMsg({ ok: r.ok, text: r.ok ? (r.message ?? 'Berhasil.') : r.error ?? 'Gagal.' })
      if (r.ok) {
        setCurPw('')
        setNewPw('')
        setConfirmPw('')
      }
    })
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(26,19,5,0.08)' }}>
      <div className="text-[13.5px] font-bold" style={{ color: '#1f1a10' }}>Keamanan Akun</div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[12.5px] font-bold" style={{ color: '#3a3424' }}>Email</div>
          <div className="text-[12px] font-medium" style={{ color: '#5b543f' }}>{email}</div>
        </div>
        <button
          type="button"
          onClick={() => setOpenEmail((v) => !v)}
          className="text-[12px] font-bold"
          style={{ color: '#9c7a3f' }}
        >
          {openEmail ? 'Tutup' : 'Ubah Email'}
        </button>
      </div>

      {openEmail ? (
        <div className="flex flex-col gap-2.5 rounded-xl px-4 py-4" style={{ background: '#faf7f0' }}>
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Password Saat Ini</label>
            <input type="password" value={emailPw} onChange={(e) => setEmailPw(e.target.value)} style={inputStyle} autoComplete="current-password" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Email Baru</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} style={inputStyle} autoComplete="email" />
          </div>
          <span style={hintStyle}>Link konfirmasi akan dikirim ke email lama dan email baru. Email belum berubah sampai link itu dibuka.</span>
          {emailMsg ? <p className="text-[12px] font-semibold" style={{ color: emailMsg.ok ? '#2f8a4f' : '#b3392f' }}>{emailMsg.text}</p> : null}
          <button
            type="button"
            disabled={emailPending || !emailPw || !newEmail}
            onClick={submitEmail}
            className="mt-1 rounded-xl py-2.5 text-[13px] font-bold"
            style={{ background: 'var(--brand-theme)', color: '#f5f3ee', opacity: emailPending ? 0.7 : 1 }}
          >
            {emailPending ? 'Mengirim...' : 'Kirim Konfirmasi'}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(26,19,5,0.08)', paddingTop: 12 }}>
        <div className="text-[12.5px] font-bold" style={{ color: '#3a3424' }}>Kata Sandi</div>
        <button
          type="button"
          onClick={() => setOpenPassword((v) => !v)}
          className="text-[12px] font-bold"
          style={{ color: '#9c7a3f' }}
        >
          {openPassword ? 'Tutup' : 'Ubah Kata Sandi'}
        </button>
      </div>

      {openPassword ? (
        <div className="flex flex-col gap-2.5 rounded-xl px-4 py-4" style={{ background: '#faf7f0' }}>
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Password Saat Ini</label>
            <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} style={inputStyle} autoComplete="current-password" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Password Baru</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} autoComplete="new-password" />
            <span style={hintStyle}>Minimal 8 karakter, berisi huruf dan angka.</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={labelStyle}>Ulangi Password Baru</label>
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} autoComplete="new-password" />
          </div>
          {pwMsg ? <p className="text-[12px] font-semibold" style={{ color: pwMsg.ok ? '#2f8a4f' : '#b3392f' }}>{pwMsg.text}</p> : null}
          <button
            type="button"
            disabled={pwPending || !curPw || !newPw || !confirmPw}
            onClick={submitPassword}
            className="mt-1 rounded-xl py-2.5 text-[13px] font-bold"
            style={{ background: 'var(--brand-theme)', color: '#f5f3ee', opacity: pwPending ? 0.7 : 1 }}
          >
            {pwPending ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </div>
      ) : null}
    </div>
  )
}