'use client'

import { useState } from 'react'

// Kolom password dengan tombol "lihat" supaya pengguna bisa memeriksa ketikannya.
// Otomatis tersembunyi lagi setelah 15 detik (aman kalau HP ditinggal di meja).
export default function PasswordInput({
  name,
  id,
  placeholder = '••••••••',
  required = true,
  minLength,
  autoComplete = 'current-password',
  style,
  value,
  onChange,
  tone = 'dark',
}: {
  name: string
  id?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  style?: React.CSSProperties
  value?: string
  onChange?: (value: string) => void
  tone?: 'dark' | 'light'
}) {
  const [visible, setVisible] = useState(false)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  function toggle() {
    if (timer) clearTimeout(timer)
    const next = !visible
    setVisible(next)
    setTimer(next ? setTimeout(() => setVisible(false), 15000) : null)
  }

  const iconColor = tone === 'dark' ? '#b9b2a0' : '#6b6552'
  const controlled = value !== undefined

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        name={name}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        {...(controlled ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) } : {})}
        style={{ ...style, paddingRight: 48 }}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        aria-pressed={visible}
        title={visible ? 'Sembunyikan password' : 'Tampilkan password'}
        style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: iconColor,
        }}
      >
        {visible ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <path d="M1 1l22 22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}