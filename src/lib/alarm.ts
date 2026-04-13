let audioCtx: AudioContext | null = null
let alarmInterval: ReturnType<typeof setInterval> | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

async function ensureAudioReady(): Promise<AudioContext> {
  const ctx = getAudioContext()
  // Resume se o browser suspendeu (exige interação do usuário antes)
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
  return ctx
}

function playBeep(ctx: AudioContext, frequency: number, startTime: number, duration: number, volume: number = 0.8) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.05)
}

export async function playAlarmSound() {
  try {
    const ctx = await ensureAudioReady()
    const now = ctx.currentTime
    // Triple beep urgente
    playBeep(ctx, 880,  now,        0.15, 0.9)
    playBeep(ctx, 880,  now + 0.22, 0.15, 0.9)
    playBeep(ctx, 1100, now + 0.44, 0.30, 1.0)
  } catch (e) {
    console.warn('Audio error:', e)
  }
}

export function startAlarm() {
  playAlarmSound()
  alarmInterval = setInterval(playAlarmSound, 1600)
}

export function stopAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval)
    alarmInterval = null
  }
}

export async function playStartSound() {
  try {
    const ctx = await ensureAudioReady()
    const now = ctx.currentTime
    playBeep(ctx, 523, now,        0.1, 0.4)
    playBeep(ctx, 659, now + 0.13, 0.1, 0.4)
    playBeep(ctx, 784, now + 0.26, 0.2, 0.5)
  } catch (e) {
    console.warn('Audio error:', e)
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'focusflow-alarm',
      requireInteraction: true,
    })
  } catch (e) {
    console.warn('Notification error:', e)
  }
}
