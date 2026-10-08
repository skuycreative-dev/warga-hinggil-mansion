'use client'

import { createContext, useCallback, useContext, useState } from 'react'

// Pengganti window.confirm() / window.alert() / window.prompt() bawaan browser dengan modal
// yang serasi dengan tampilan aplikasi. Dipasang sekali di app/layout.tsx, dipakai lewat
// useConfirm() / useAlertModal() / usePromptModal() di komponen mana pun. Dipakai seperti versi bawaan:
//   if (!(await confirmModal('Hapus data ini?'))) return
//   await alertModal('Berhasil disimpan.')
//   const alasan = await promptModal('Alasan menolak (opsional):')   // null kalau dibatalkan
type ConfirmOpts = { title?: string; confirmText?: string; cancelText?: string; danger?: boolean }
type AlertOpts = { title?: string; okText?: string }
type PromptOpts = { title?: string; confirmText?: string; cancelText?: string; placeholder?: string; defaultValue?: string }

type ModalState =
  | { kind: 'confirm'; message: string; opts?: ConfirmOpts; resolve: (v: boolean) => void }
  | { kind: 'alert'; message: string; opts?: AlertOpts; resolve: () => void }
  | { kind: 'prompt'; message: string; opts?: PromptOpts; value: string; resolve: (v: string | null) => void }
  | null

type Ctx = {
  confirmModal: (message: string, opts?: ConfirmOpts) => Promise<boolean>
  alertModal: (message: string, opts?: AlertOpts) => Promise<void>
  promptModal: (message: string, opts?: PromptOpts) => Promise<string | null>
}

const ModalCtx = createContext<Ctx | null>(null)

export function useConfirm() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useConfirm() harus dipakai di dalam ModalProvider')
  return ctx.confirmModal
}

export function useAlertModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('useAlertModal() harus dipakai di dalam ModalProvider')
  return ctx.alertModal
}

export function usePromptModal() {
  const ctx = useContext(ModalCtx)
  if (!ctx) throw new Error('usePromptModal() harus dipakai di dalam ModalProvider')
  return ctx.promptModal
}

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>(null)

  const confirmModal = useCallback((message: string, opts?: ConfirmOpts) => {
    return new Promise<boolean>((resolve) => setState({ kind: 'confirm', message, opts, resolve }))
  }, [])

  const alertModal = useCallback((message: string, opts?: AlertOpts) => {
    return new Promise<void>((resolve) => setState({ kind: 'alert', message, opts, resolve: () => resolve() }))
  }, [])

  const promptModal = useCallback((message: string, opts?: PromptOpts) => {
    return new Promise<string | null>((resolve) => setState({ kind: 'prompt', message, opts, value: opts?.defaultValue ?? '', resolve }))
  }, [])

  function close(result: boolean) {
    setState((s) => {
      if (!s) return null
      if (s.kind === 'confirm') s.resolve(result)
      else if (s.kind === 'prompt') s.resolve(result ? s.value : null)
      else s.resolve()
      return null
    })
  }

  const danger = state?.kind === 'confirm' && !!state.opts?.danger

  return (
    <ModalCtx.Provider value={{ confirmModal, alertModal, promptModal }}>
      {children}
      {state ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => close(false)}
          className="flex items-center justify-center px-5"
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,11,15,0.6)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl px-6 py-7 text-center"
            style={{ background: '#ffffff', boxShadow: '0 20px 50px rgba(10,11,15,0.35)' }}
          >
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: danger ? '#b3392f' : '#1a1305' }}
            >
              {danger ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
              ) : state.kind === 'confirm' || state.kind === 'prompt' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e6c98a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
            {state.opts?.title ? (
              <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-fraunces), serif', color: '#1f1a10' }}>
                {state.opts.title}
              </div>
            ) : null}
            <p className="mt-2 whitespace-pre-line text-sm font-medium" style={{ color: '#5b543f' }}>
              {state.message}
            </p>
            {state.kind === 'prompt' ? (
              <input
                autoFocus
                value={state.value}
                onChange={(e) => setState((s) => (s?.kind === 'prompt' ? { ...s, value: e.target.value } : s))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') close(true)
                }}
                placeholder={state.opts?.placeholder}
                className="mt-3.5 w-full rounded-xl px-3.5 py-2.5 text-sm"
                style={{ background: '#faf7f0', border: '1px solid rgba(26,19,5,0.12)', color: '#1f1a10', textAlign: 'left' }}
              />
            ) : null}
            {state.kind === 'confirm' || state.kind === 'prompt' ? (
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="flex-1 rounded-xl py-3 text-sm font-bold"
                  style={{ background: '#f2f1ec', color: '#3a3424' }}
                >
                  {state.opts?.cancelText ?? 'Batal'}
                </button>
                <button
                  type="button"
                  onClick={() => close(true)}
                  autoFocus={state.kind === 'confirm'}
                  className="flex-1 rounded-xl py-3 text-sm font-bold"
                  style={{
                    background: state.kind === 'confirm' && danger ? '#b3392f' : '#1a1305',
                    color: state.kind === 'confirm' && danger ? '#ffffff' : 'var(--brand-accent)',
                  }}
                >
                  {state.opts?.confirmText ?? 'Ya'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => close(true)}
                autoFocus
                className="mt-5 w-full rounded-xl py-3 text-sm font-bold"
                style={{ background: 'var(--brand-theme)', color: 'var(--brand-accent)' }}
              >
                {state.opts?.okText ?? 'Mengerti'}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </ModalCtx.Provider>
  )
}