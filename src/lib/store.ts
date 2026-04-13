import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  name: string
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  color: string
  emoji: string
}

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  currentIndex: number
  timeLeftSeconds: number
  routineTaskIds: string[]
  sessionStarted: boolean
  completedIndexes: number[]
  expired: boolean
  dayStartedAt: string | null
}

interface AppStore {
  tasks: Task[]
  timer: TimerState
  userName: string
  setUserName: (name: string) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, task: Omit<Task, 'id'>) => void
  removeTask: (id: string) => void
  reorderTasks: (tasks: Task[]) => void
  startSession: (taskIds: string[]) => void
  tickTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  nextTask: () => void
  stopSession: () => void
  acknowledgeExpiry: () => void
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function secondsUntilTime(hhmm: string): number {
  const now = new Date()
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  const [h, m] = hhmm.split(':').map(Number)
  const targetSec = (h ?? 0) * 3600 + (m ?? 0) * 60
  return Math.max(0, targetSec - nowSec)
}

export function getDurationMinutes(startTime: string, endTime: string): number {
  return Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime))
}

const defaultTimer: TimerState = {
  isRunning: false,
  isPaused: false,
  currentIndex: 0,
  timeLeftSeconds: 0,
  routineTaskIds: [],
  sessionStarted: false,
  completedIndexes: [],
  expired: false,
  dayStartedAt: null,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      timer: defaultTimer,
      userName: '',

      setUserName: (name) => set({ userName: name }),

      addTask: (taskData) => {
        const task: Task = { ...taskData, id: crypto.randomUUID() }
        set((s) => ({ tasks: [...s.tasks, task] }))
      },

      updateTask: (id, taskData) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...taskData } : t)),
        }))
      },

      removeTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
      },

      reorderTasks: (tasks) => set({ tasks }),

      startSession: (taskIds) => {
        if (taskIds.length === 0) return
        const { tasks } = get()

        // Encontra a tarefa atual com base no horário real
        const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()
        let startIndex = 0
        for (let i = 0; i < taskIds.length; i++) {
          const t = tasks.find((t) => t.id === taskIds[i])
          if (!t) continue
          if (timeToMinutes(t.endTime) > nowMinutes) {
            startIndex = i
            break
          }
          // Se todas acabaram, começa na última
          startIndex = i
        }

        const activeTask = tasks.find((t) => t.id === taskIds[startIndex])
        if (!activeTask) return

        set({
          timer: {
            isRunning: true,
            isPaused: false,
            currentIndex: startIndex,
            timeLeftSeconds: secondsUntilTime(activeTask.endTime),
            routineTaskIds: taskIds,
            sessionStarted: true,
            completedIndexes: Array.from({ length: startIndex }, (_, i) => i),
            expired: false,
            dayStartedAt: new Date().toISOString(),
          },
        })
      },

      tickTimer: () => {
        const { timer } = get()
        if (!timer.isRunning || timer.isPaused || timer.expired) return
        if (timer.timeLeftSeconds > 1) {
          set((s) => ({
            timer: { ...s.timer, timeLeftSeconds: s.timer.timeLeftSeconds - 1 },
          }))
        } else if (timer.timeLeftSeconds === 1) {
          set((s) => ({
            timer: { ...s.timer, timeLeftSeconds: 0, isRunning: false, expired: true },
          }))
        }
      },

      pauseTimer: () => {
        set((s) => ({ timer: { ...s.timer, isPaused: true, isRunning: false } }))
      },

      resumeTimer: () => {
        set((s) => ({ timer: { ...s.timer, isPaused: false, isRunning: true } }))
      },

      nextTask: () => {
        const { timer, tasks } = get()
        const nextIndex = timer.currentIndex + 1
        if (nextIndex >= timer.routineTaskIds.length) {
          set({ timer: defaultTimer })
          return
        }
        const nextTaskId = timer.routineTaskIds[nextIndex]
        const nextTask = tasks.find((t) => t.id === nextTaskId)
        if (!nextTask) return
        set((s) => ({
          timer: {
            ...s.timer,
            currentIndex: nextIndex,
            timeLeftSeconds: secondsUntilTime(nextTask.endTime),
            isRunning: true,
            isPaused: false,
            expired: false,
            completedIndexes: [...s.timer.completedIndexes, s.timer.currentIndex],
          },
        }))
      },

      stopSession: () => set({ timer: defaultTimer }),

      acknowledgeExpiry: () => {
        set((s) => ({ timer: { ...s.timer, expired: false } }))
      },
    }),
    {
      name: 'focusflow-storage',
      partialize: (state) => ({ tasks: state.tasks, userName: state.userName }),
    }
  )
)
