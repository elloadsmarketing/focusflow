'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore, getDurationMinutes } from '@/lib/store'
import { startAlarm, stopAlarm, playStartSound, requestNotificationPermission, sendNotification } from '@/lib/alarm'
import WelcomeScreen from './WelcomeScreen'

export default function FocusTimer() {
  const { tasks, timer, tickTimer, pauseTimer, resumeTimer, nextTask, stopSession, acknowledgeExpiry } = useAppStore()
  const [alarmFiring, setAlarmFiring] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentTask = tasks.find(t => t.id === timer.routineTaskIds[timer.currentIndex])
  const totalTasks = timer.routineTaskIds.length
  const color = currentTask?.color ?? '#8b5cf6'

  useEffect(() => { requestNotificationPermission().then(setNotifGranted) }, [])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timer.isRunning && !timer.isPaused && !timer.expired) {
      intervalRef.current = setInterval(tickTimer, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timer.isRunning, timer.isPaused, timer.expired])

  useEffect(() => {
    if (timer.expired && !alarmFiring) {
      setAlarmFiring(true)
      startAlarm()
      sendNotification(`⏰ ${currentTask?.emoji ?? ''} Tempo esgotado!`,
        currentTask ? `"${currentTask.name}" finalizada!` : 'Tarefa finalizada!')
    }
  }, [timer.expired])

  const handleDismiss = () => { stopAlarm(); setAlarmFiring(false); acknowledgeExpiry(); nextTask() }
  const handleStop = () => { stopAlarm(); setAlarmFiring(false); stopSession() }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const totalSec = currentTask ? getDurationMinutes(currentTask.startTime, currentTask.endTime) * 60 : 1
  const progress = Math.max(0, Math.min(1, 1 - timer.timeLeftSeconds / totalSec))
  const R = 88
  const circ = 2 * Math.PI * R
  const dash = circ * (1 - progress)

  if (!timer.sessionStarted) {
    return <WelcomeScreen notifGranted={notifGranted} onRequestNotif={() => requestNotificationPermission().then(setNotifGranted)} />
  }

  // ALARM
  if (alarmFiring) {
    const isLast = timer.currentIndex >= totalTasks - 1
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center animate-alarm rounded-3xl p-8"
        style={{ background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`, border: `1px solid ${color}44` }}>
        <div className="text-7xl" style={{ filter: `drop-shadow(0 0 20px ${color})` }}>{currentTask?.emoji ?? '⏰'}</div>
        <div>
          <div className="text-4xl font-black mb-2" style={{ color }}>TEMPO ESGOTADO</div>
          <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>{currentTask?.name}</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isLast ? '🎉 Última tarefa! Rotina concluída!' : 'Hora da próxima tarefa.'}
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {!isLast
            ? <button onClick={handleDismiss} className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 0 30px ${color}66` }}>
                ▶ Próxima Tarefa
              </button>
            : <button onClick={handleStop} className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 0 30px rgba(5,150,105,0.5)' }}>
                🎉 Concluir Dia!
              </button>
          }
          <button onClick={handleStop} className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Encerrar sessão
          </button>
        </div>
      </div>
    )
  }

  // ACTIVE TIMER
  return (
    <div className="flex flex-col items-center justify-between h-full py-4 animate-fade-in">

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Progresso do dia</span>
          <span className="text-xs font-bold" style={{ color }}>{timer.completedIndexes.length + 1}/{totalTasks}</span>
        </div>
        <div className="flex gap-1.5">
          {timer.routineTaskIds.map((id, i) => {
            const t = tasks.find(t => t.id === id)
            const done = timer.completedIndexes.includes(i)
            const cur = i === timer.currentIndex
            return (
              <div key={id} className={`h-1 flex-1 rounded-full transition-all duration-500 ${cur ? 'animate-pulse' : ''}`}
                style={{ background: t?.color ?? '#8b5cf6', opacity: done ? 1 : cur ? 0.9 : 0.2 }} />
            )
          })}
        </div>
      </div>

      {/* Task name */}
      <div className="text-center">
        <div className="text-3xl mb-2" style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}>{currentTask?.emoji}</div>
        <h3 className="text-lg font-bold px-4" style={{ color: 'var(--text)' }}>{currentTask?.name}</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {currentTask?.startTime} → {currentTask?.endTime}
        </p>
      </div>

      {/* Circular timer with glow */}
      <div className="relative flex items-center justify-center glow-ring" style={{ filter: `drop-shadow(0 0 16px ${color}55)` }}>
        <svg width="210" height="210" className="-rotate-90">
          {/* Track */}
          <circle cx="105" cy="105" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          {/* Progress */}
          <circle cx="105" cy="105" r={R} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.95s linear', filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <div className="absolute text-center">
          <div className="text-5xl font-black tabular-nums tracking-tight" style={{ color: 'var(--text)' }}>
            {fmt(timer.timeLeftSeconds)}
          </div>
          <div className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            {timer.isPaused ? '⏸ pausado' : 'restante'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="flex gap-2">
          {timer.isPaused
            ? <button onClick={() => { resumeTimer(); playStartSound() }}
                className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 0 20px ${color}44` }}>
                ▶ Retomar
              </button>
            : <button onClick={pauseTimer}
                className="flex-1 py-3 rounded-xl font-bold transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}>
                ⏸ Pausar
              </button>
          }
          <button onClick={() => { stopAlarm(); nextTask() }}
            className="px-4 py-3 rounded-xl transition-all active:scale-95 text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
            title="Pular tarefa">⏭</button>
        </div>
        <button onClick={handleStop}
          className="w-full py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          Encerrar sessão
        </button>
      </div>
    </div>
  )
}
