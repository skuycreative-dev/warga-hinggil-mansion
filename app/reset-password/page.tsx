'use client'

import { useEffect, useState } from 'react'
import { BrandLogo, useBranding } from '@/components/BrandingProvider'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from '@/components/PasswordInput'
import { openRecoveryLink, saveNewPassword } from './actions'

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '12px',
  padding: '13px 14px',
  color: '#f5f3ee',
  fontSize: '16px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  width: '100%',
  outline: 'none',
}

const goldButton: React.CSSProperties = {
  border: 'none',
  background: 'linear-gradient(180deg, var(--brand-accent) 0%, var(--brand-accent-dark) 100%)',
  color: '#1a1305',
  boxShadow: '0 10px 24px -10px rgba(205,161,90,0.6)',
}

type Stage = 'memeriksa' | 'buka-link' | 'form' | 'tidak-valid' | 'selesai'

export default function ResetPasswordPage() {
  const [stage, setStage] = useState<Stage>('memeriksa')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token_hash') ?? ''
    if (t) {
      setToken(t)
      setStage('buka-link')
      return
    }
    // Sudah membuka link sebelumnya (sesi atur ulang aktif)
    createClient()
      .auth.getUser()
      .then(({ data }) => setStage(data.user ? 'form' : 'tidak-valid'))
  }, [])

  async function openLink() {
    setBusy(true)
    setError('')
    const r = await openRecoveryLink(token)
    setBusy(false)
    // Token dihapus dari alamat supaya tidak tersimpan di riwayat browser
    window.history.replaceState(null, '', '/reset-password')
    if (!r.ok) {
      setError(r.error ?? '')
      setStage('tidak-valid')
      return
    }
    setStage('form')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const r = await saveNewPassword(password, confirm)
    setBusy(false)
    if (!r.ok) {
      if (r.needs2fa) {
        window.location.href = '/login/2fa?next=/reset-password'
        return
      }
      setError(r.error ?? 'Gagal menyimpan.')
      return
    }
    setPassword('')
    setConfirm('')
    setStage('selesai')
    setTimeout(() => (window.location.href = '/login'), 3000)
  }

  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-md flex-col"
      style={{ background: 'radial-gradient(120% 50% at 50% 0%, rgba(212,175,106,0.10) 0%, rgba(10,11,15,0) 55%)' }}
    >
      <div className="flex flex-1 flex-col justify-center px-7 pb-16 pt-4">
        <div className="mb-8 flex flex-col items-center gap-3.5">
          <BrandLogo size={52} className="rounded-2xl object-cover" />
          <div className="text-center">
            <h1 className="mb-1.5 text-2xl font-medium" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#f7f4ec' }}>
              Atur Password Baru
            </h1>
            <p className="text-[13px]" style={{ color: '#9a9ca8' }}>Link dari Superadmin hanya bisa dipakai sekali.</p>
          </div>
        </div>

        {stage === 'memeriksa' ? (
          <p className="text-center text-[13px]" style={{ color: '#9a9ca8' }}>Memeriksa link...</p>
        ) : null}

        {stage === 'buka-link' ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-[13px] leading-relaxed" style={{ color: '#b9b2a0' }}>
              Tekan tombol di bawah untuk mulai mengatur password baru akunmu.
            </p>
            <button type="button" disabled={busy} onClick={openLink} className="rounded-xl py-3.5 text-[14.5px] font-bold" style={{ ...goldButton, opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Memeriksa...' : 'Lanjutkan'}
            </button>
          </div>
        ) : null}

        {stage === 'tidak-valid' ? (
          <div className="rounded-2xl px-6 py-7 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-semibold" style={{ color: '#f5f3ee' }}>Link tidak bisa dipakai</p>
            <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: '#9a9ca8' }}>
              {error || 'Link sudah dipakai, kedaluwarsa, atau tidak lengkap.'}
            </p>
            <Link href="/lupa-password" className="mt-5 inline-block text-[13px] font-bold" style={{ color: 'var(--brand-accent)' }}>
              Minta link baru
            </Link>
          </div>
        ) : null}

        {stage === 'form' ? (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="new-password" style={{ fontSize: '12px', color: '#b9b2a0' }}>Password Baru</label>
              <PasswordInput id="new-password" name="password" minLength={8} autoComplete="new-password" value={password} onChange={setPassword} style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm-password" style={{ fontSize: '12px', color: '#b9b2a0' }}>Ulangi Password Baru</label>
              <PasswordInput id="confirm-password" name="confirm" minLength={8} autoComplete="new-password" value={confirm} onChange={setConfirm} style={inputStyle} />
            </div>
            <p className="text-[11.5px]" style={{ color: '#9a9ca8' }}>
              Minimal 8 karakter, berisi huruf dan angka. Tekan ikon mata untuk memeriksa ketikan. Setelah disimpan, semua perangkat yang
              sedang login akan dikeluarkan.
            </p>
            {error ? (
              <p role="alert" className="text-[12.5px]" style={{ color: '#e08a8a' }}>{error}</p>
            ) : null}
            <button type="submit" disabled={busy} className="mt-1.5 rounded-xl py-3.5 text-[14.5px] font-bold" style={{ ...goldButton, opacity: busy ? 0.7 : 1 }}>
              {busy ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        ) : null}

        {stage === 'selesai' ? (
          <div className="rounded-2xl px-6 py-7 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-sm font-semibold" style={{ color: '#f5f3ee' }}>Password berhasil diubah</p>
            <p className="mt-2 text-[12.5px]" style={{ color: '#9a9ca8' }}>Silakan masuk dengan password baru. Mengarahkan ke halaman Masuk...</p>
          </div>
        ) : null}
      </div>
    </main>
  )
}