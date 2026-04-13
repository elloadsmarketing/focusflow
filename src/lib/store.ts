import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  name: string
  durationMinutes: number
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
  dayStartedAt: string | null // ISO string do momento que o dia foi iniciado
}

interface AppStore {
  tasks: Task[]
  timer: TimerState
  userName: string
  dayStartTime: string   // "HH:MM" — horário configurado para começar o dia
  setUserName: (name: string) => void
  setDayStartTime: (time: string) => void
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, task: Omit<Task, 'id'>) => void
  removeTask: (id: string) => void
  reorderTasks: (tasks: Task[]) => void
  startSession: (taskIds: string[], startedAt?: string) => void
  tickTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  nextTask: () => void
  stopSession: () => void
  acknowledgeExpiry: () => void
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
      dayStartTime: '08:00',

      setUserName: (name) => set({ userName: name }),
      setDayStartTime: (time) => set({ dayStartTime: time }),

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

      startSession: (taskIds, startedAt) => {
        if (taskIds.length === 0) return
        const state = get()
        const firstTask = state.tasks.find((t) => t.id === taskIds[0])
        if (!firstTask) return
        set({
          timer: {
            isRunning: true,
            isPaused: false,
            currentIndex: 0,
            timeLeftSeconds: firstTask.durationMinutes * 60,
            routineTaskIds: taskIds,
            sessionStarted: true,
            completedIndexes: [],
            expired: false,
            dayStartedAt: startedAt ?? new Date().toISOString(),
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
            timer: {
              ...s.timer,
              timeLeftSeconds: 0,
              isRunning: false,
              expired: true,
            },
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
            timeLeftSeconds: nextTask.durationMinutes * 60,
            isRunning: true,
            isPaused: false,
            expired: false,
            completedIndexes: [...s.timer.completedIndexes, s.timer.currentIndex],
          },
        }))
      },

      stopSession: () => {
        set({ timer: defaultTimer })
      },

      acknowledgeExpiry: () => {
        set((s) => ({ timer: { ...s.timer, expired: false } }))
      },
    }),
    {
      name: 'focusflow-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        userName: state.userName,
        dayStartTime: state.dayStartTime,
      }),
    }
  )
)
