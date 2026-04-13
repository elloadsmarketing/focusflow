let audioCtx: AudioContext | null = null
let alarmInterval: ReturnType<typeof setInterval> | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

function playBeep(frequency: number, duration: number, volume: number = 0.8) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

export function playAlarmSound() {
  // Urgent triple beep pattern
  playBeep(880, 0.15, 0.9)
  setTimeout(() => playBeep(880, 0.15, 0.9), 200)
  setTimeout(() => playBeep(1100, 0.3, 1.0), 400)
}

export function startAlarm() {
  playAlarmSound()
  alarmInterval = setInterval(playAlarmSound, 1500)
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval)
    alarmInterval = null
  }
}

export function playTickSound() {
  playBeep(440, 0.05, 0.2)
}

export function playStartSound() {
  playBeep(523, 0.1, 0.5)
  setTimeout(() => playBeep(659, 0.1, 0.5), 120)
  setTimeout(() => playBeep(784, 0.2, 0.6), 240)
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendNotification(title: string, body: string, taskEmoji: string = '⏰') {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'focusflow-alarm',
    requireInteraction: true,
  })
}
