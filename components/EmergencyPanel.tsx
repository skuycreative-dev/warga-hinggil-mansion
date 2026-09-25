'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { triggerEmergency, resolveEmergency } from '@/app/darurat/actions'

type Alert = {
  id: string
  message: string | null
  status: string
  created_at: string
  created_by: string
  house?: { nomor_rumah: string } | null
  creator?: { full_name: string } | null
}

export default function EmergencyPanel({
  alerts,
  canResolve,
  currentUserId,
}: {
  alerts: Alert[]
  canResolve: boolean
  currentUserId: string
}) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const activeAlerts = alerts.filter((a) => a.status === 'aktif')
  const myActiveAlert = activeAlerts.find((a) => a.created_by === currentUserId)

  function handleTrigger() {
    const formData = new FormData()
    formData.set('message', message)
    startTransition(async () => {
      const result = await triggerEmergency({ error: '', success: false }, formData)
      if (result.success) {
        setSent(true)
        setConfirmOpen(false)
        setMessage('')
        router.refresh()
      }
    })
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveEmergency(id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {myActiveAlert ? (
        <div className="rounded-2xl px-5 py-5 text-center" style={{ background: 'rgba(179,57,47,0.1)', border: '1px solid rgba(179,57,47,0.3)' }}>
          <span className="text-sm font-bold" style={{ color: '#b3392f' }}>
            Alert darurat kamu sedang aktif. Security & Pengurus sudah diberitahu.
          </span>
        </div>
      ) : !confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl transition hover:opacity-90"
          style={{ background: '#b3392f' }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-lg font-bold text-white">TEKAN JIKA DARURAT</span>
        </button>
      ) : (
        <div className="rounded-2xl px-5 py-5" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.3)' }}>
          <p className="mb-3 text-sm font-bold" style={{ color: '#b3392f' }}>
            Yakin ingin mengirim alert darurat? Security dan Pengurus akan langsung diberitahu.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Jelaskan situasi singkat (opsional)"
            rows={3}
            className="mb-3 w-full"
            style={{
              background: '#faf7f0',
              border: '1px solid rgba(26,19,5,0.12)',
              borderRadius: '11px',
              padding: '11px 13px',
              color: '#1f1a10',
              fontSize: '13.5px',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#faf7f0', color: '#1f1a10', border: '1px solid rgba(26,19,5,0.12)' }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleTrigger}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: '#b3392f', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Mengirim...' : 'Kirim Alert Darurat'}
            </button>
          </div>
        </div>
      )}

      {canResolve ? (
        <div>
          <div className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: '#9c7a3f' }}>
            Alert Aktif ({activeAlerts.length})
          </div>
          {activeAlerts.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {activeAlerts.map((a) => (
                <div key={a.id} className="rounded-2xl px-5 py-4" style={{ background: '#ffffff', border: '1px solid rgba(179,57,47,0.25)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#1f1a10' }}>
                        {a.creator?.full_name ?? 'Warga'} {a.house?.nomor_rumah ? `· Rumah ${a.house.nomor_rumah}` : ''}
                      </div>
                      {a.message ? <p className="mt-1 text-[13px]" style={{ color: '#5b543f' }}>{a.message}</p> : null}
                      <span className="mt-1 block text-[11px] font-semibold" style={{ color: '#9c7a3f' }}>
                        {new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleResolve(a.id)}
                      className="rounded-lg px-3 py-1.5 text-[12px] font-bold"
                      style={{ background: '#1a1305', color: '#e6c98a' }}
                    >
                      Tandai Selesai
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium" style={{ color: '#5b543f' }}>Tidak ada alert darurat aktif saat ini.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
