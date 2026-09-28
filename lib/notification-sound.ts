'use client'

// Suara notifikasi "ding-dong" (2 ketukan, ±1,2 detik) dibuat langsung oleh browser (tanpa file audio).
// Browser HP baru mengizinkan suara setelah pengguna menyentuh layar sekali, jadi audio "dibuka" pada sentuhan pertama.

const STORAGE_KEY = 'notif-suara'
let ctx: AudioContext | null = null
let unlocked = false
const played = new Set<string>()

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

export function initNotificationSound() {
  if (typeof window === 'undefined' || unlocked) return
  const unlock = () => {
    const c = getCtx()
    if (c && c.state === 'suspended') void c.resume()
    unlocked = true
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { once: false })
  window.addEventListener('keydown', unlock, { once: false })
}

export function isSoundEnabled() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'mati'
  } catch {
    return true
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'hidup' : 'mati')
  } catch {
    // penyimpanan browser tidak tersedia: pengaturan hanya berlaku sampai halaman ditutup
  }
}

function tone(c: AudioContext, freq: number, start: number, length: number, volume: number) {
  const osc = c.createOscillator()
  const overtone = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  overtone.type = 'sine'
  osc.frequency.value = freq
  overtone.frequency.value = freq * 2.01
  const g2 = c.createGain()
  g2.gain.value = 0.18
  overtone.connect(g2)
  g2.connect(gain)
  osc.connect(gain)
  gain.connect(c.destination)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.start(start)
  overtone.start(start)
  osc.stop(start + length + 0.05)
  overtone.stop(start + length + 0.05)
}

// Mainkan "ding-dong". `key` mencegah bunyi dobel kalau ada 2 lonceng di halaman yang sama.
export function playNotificationSound(key?: string) {
  if (typeof window === 'undefined' || !isSoundEnabled()) return
  if (key) {
    if (played.has(key)) return
    played.add(key)
    if (played.size > 200) played.clear()
  }
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  const t = c.currentTime + 0.02
  tone(c, 1318.5, t, 0.55, 0.22) // E6 "ding"
  tone(c, 1046.5, t + 0.5, 0.75, 0.22) // C6 "dong"
  try {
    navigator.vibrate?.([60, 120, 60])
  } catch {
    // getar tidak didukung
  }
}