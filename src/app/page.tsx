'use client'

import { useAppStore } from '@/lib/store'
import TaskList from '@/components/TaskList'
import FocusTimer from '@/components/FocusTimer'
import { playStartSound } from '@/lib/alarm'

export default function Home() {
  const { timer, userName, startSession } = useAppStore()

  const handleStart = (taskIds: string[]) => {
    playStartSound()
    startSession(taskIds)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-sm font-black">
            F
          </div>
          <span className="font-bold text-white text-lg">FocusFlow</span>
          {timer.sessionStarted && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Dia em andamento
            </span>
          )}
        </div>
        <div className="text-xs text-zinc-600">
          {userName ? `Foco total, ${userName}. Um passo de cada vez. 💜` : 'Mantenha o foco. Um passo de cada vez.'}
        </div>
      </header>

      {/* Layout principal */}
      <main className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        {/* Esquerda: Agenda */}
        <div className="w-[400px] min-w-[400px] border-r border-zinc-800/60 p-6 overflow-y-auto">
          <TaskList
            onStart={handleStart}
            sessionActive={timer.sessionStarted}
            currentIndex={timer.currentIndex}
            completedIndexes={timer.completedIndexes}
          />
        </div>

        {/* Direita: Timer */}
        <div className="flex-1 p-6 overflow-hidden">
          <FocusTimer />
        </div>
      </main>
    </div>
  )
}
