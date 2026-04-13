'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { startAlarm, stopAlarm, playStartSound, requestNotificationPermission, sendNotification } from '@/lib/alarm'

export default function FocusTimer() {
  const { tasks, timer, tickTimer, pauseTimer, resumeTimer, nextTask, stopSession } = useAppStore()
  const [alarmFiring, setAlarmFiring] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevTimeRef = useRef<number>(timer.timeLeftSeconds)

  const currentTask = tasks.find((t) => t.id === timer.routineTaskIds[timer.currentIndex])
  const totalTasks = timer.routineTaskIds.length

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setNotifGranted)
  }, [])

  // Tick interval
  useEffect(() => {
    if (timer.isRunning && !timer.isPaused) {
      intervalRef.current = setInterval(tickTimer, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timer.isRunning, timer.isPaused, tickTimer])

  // Detect when timer hits 0
  useEffect(() => {
    if (prevTimeRef.current > 0 && timer.timeLeftSeconds === 0 && timer.isRunning) {
      setAlarmFiring(true)
      startAlarm()
      sendNotification(
        `⏰ Tempo esgotado!`,
        currentTask ? `Tarefa "${currentTask.name}" finalizada. Próxima tarefa!` : 'Tarefa finalizada!',
        currentTask?.emoji ?? '⏰'
      )
    }
    prevTimeRef.current = timer.timeLeftSeconds
  }, [timer.timeLeftSeconds, timer.isRunning, currentTask])

  // Stop alarm when navigating away from alarm state
  useEffect(() => {
    if (!alarmFiring) stopAlarm()
  }, [alarmFiring])

  const handleDismissAlarm = () => {
    setAlarmFiring(false)
    stopAlarm()
    nextTask()
  }

  const handleStop = () => {
    setAlarmFiring(false)
    stopAlarm()
    stopSession()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const progress = currentTask
    ? 1 - timer.timeLeftSeconds / (currentTask.durationMinutes * 60)
    : 0

  const radius = 90
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  if (!timer.sessionStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
        <div className="text-7xl">🎯</div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Pronto para focar?</h2>
          <p className="text-zinc-400 text-sm max-w-xs">
            Adicione suas tarefas na lista ao lado e inicie a rotina para começar.
          </p>
        </div>
        {!notifGranted && (
          <button
            onClick={() => requestNotificationPermission().then(setNotifGranted)}
            className="px-4 py-2 bg-amber-900/40 border border-amber-700 rounded-xl text-amber-400 text-sm font-medium hover:bg-amber-900/60 transition-colors"
          >
            🔔 Ativar notificações do navegador
          </button>
        )}
        {notifGranted && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-xl text-emerald-400 text-sm">
            ✅ Notificações ativadas
          </div>
        )}
      </div>
    )
  }

  // ALARM OVERLAY
  if (alarmFiring) {
    const isLast = timer.currentIndex >= totalTasks - 1
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-6 text-center animate-pulse-slow rounded-2xl"
        style={{
          backgroundColor: currentTask ? `${currentTask.color}22` : '#7c3aed22',
          border: `2px solid ${currentTask?.color ?? '#7c3aed'}`,
        }}
      >
        <div className="text-8xl animate-bounce">{currentTask?.emoji ?? '⏰'}</div>
        <div>
          <div className="text-5xl font-black text-white mb-2">TEMPO!</div>
          <div
            className="text-xl font-bold mb-1"
            style={{ color: currentTask?.color ?? '#7c3aed' }}
          >
            {currentTask?.name}
          </div>
          <p className="text-zinc-400 text-sm">
            {isLast ? 'Última tarefa concluída! Rotina completa!' : 'Hora de passar para a próxima tarefa.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {!isLast ? (
            <button
              onClick={handleDismissAlarm}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all active:scale-95 hover:brightness-110"
              style={{ backgroundColor: currentTask?.color ?? '#7c3aed' }}
            >
              ▶ Próxima Tarefa
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full py-4 rounded-xl font-black text-white text-lg bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-95"
            >
              🎉 Rotina Concluída!
            </button>
          )}
          <button
            onClick={handleStop}
            className="w-full py-2 rounded-xl font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
          >
            Encerrar sessão
          </button>
        </div>
      </div>
    )
  }

  // ACTIVE TIMER
  return (
    <div className="flex flex-col items-center justify-between h-full py-4">
      {/* Progress indicators */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-zinc-500 text-xs">Progresso</span>
          <span className="text-zinc-400 text-xs font-medium">
            {timer.completedIndexes.length + 1} / {totalTasks}
          </span>
        </div>
        <div className="flex gap-1">
          {timer.routineTaskIds.map((id, index) => {
            const t = tasks.find((t) => t.id === id)
            const isCompleted = timer.completedIndexes.includes(index)
            const isCurrent = index === timer.currentIndex
            return (
              <div
                key={id}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100 animate-pulse' : 'opacity-30'
                }`}
                style={{ backgroundColor: t?.color ?? '#7c3aed' }}
              />
            )
          })}
        </div>
      </div>

      {/* Task info */}
      <div className="text-center">
        <div className="text-4xl mb-2">{currentTask?.emoji}</div>
        <h3 className="text-xl font-bold text-white">{currentTask?.name}</h3>
        <p className="text-zinc-500 text-sm mt-1">
          Tarefa {timer.currentIndex + 1} de {totalTasks}
        </p>
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle
            cx="110" cy="110" r={radius}
            fill="none"
            stroke="#27272a"
            strokeWidth="10"
          />
          <circle
            cx="110" cy="110" r={radius}
            fill="none"
            stroke={currentTask?.color ?? '#7c3aed'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-5xl font-black text-white tabular-nums">
            {formatTime(timer.timeLeftSeconds)}
          </div>
          <div className="text-zinc-500 text-xs mt-1">
            {timer.isPaused ? 'Pausado' : 'Restante'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="flex gap-3">
          {timer.isPaused ? (
            <button
              onClick={() => { resumeTimer(); playStartSound() }}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: currentTask?.color ?? '#7c3aed' }}
            >
              ▶ Retomar
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex-1 py-3 rounded-xl font-bold text-zinc-200 bg-zinc-700 hover:bg-zinc-600 transition-all active:scale-95"
            >
              ⏸ Pausar
            </button>
          )}
          <button
            onClick={() => {
              stopAlarm()
              nextTask()
            }}
            className="px-4 py-3 rounded-xl font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
            title="Pular tarefa"
          >
            ⏭
          </button>
        </div>
        <button
          onClick={handleStop}
          className="w-full py-2 rounded-xl font-medium text-zinc-500 hover:text-red-400 hover:bg-red-950/30 text-sm transition-colors"
        >
          Encerrar sessão
        </button>
      </div>
    </div>
  )
}
