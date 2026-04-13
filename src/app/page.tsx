'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import TaskList from '@/components/TaskList'
import FocusTimer from '@/components/FocusTimer'
import { playStartSound } from '@/lib/alarm'

export default function Home() {
  const { timer, userName, startSession } = useAppStore()
  const [mobileTab, setMobileTab] = useState<'agenda' | 'timer'>('agenda')

  const handleStart = (taskIds: string[]) => {
    playStartSound()
    startSession(taskIds)
    setMobileTab('timer')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-violet-600 rounded-lg flex items-center justify-center text-xs md:text-sm font-black flex-shrink-0">
            F
          </div>
          <span className="font-bold text-white text-base md:text-lg">FocusFlow</span>
          {timer.sessionStarted && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Em andamento</span>
            </span>
          )}
        </div>
        {userName && (
          <p className="text-xs text-zinc-600 hidden md:block">
            Foco total, {userName}. 💜
          </p>
        )}
      </header>

      {/* Desktop: side by side | Mobile: tabs */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* === DESKTOP LAYOUT === */}
        <div className="hidden md:flex flex-row flex-1 overflow-hidden">
          {/* Agenda */}
          <div className="w-80 lg:w-96 xl:w-[420px] flex-shrink-0 border-r border-zinc-800/60 p-4 lg:p-5 overflow-y-auto">
            <TaskList
              onStart={handleStart}
              sessionActive={timer.sessionStarted}
              currentIndex={timer.currentIndex}
              completedIndexes={timer.completedIndexes}
            />
          </div>
          {/* Timer */}
          <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
            <FocusTimer />
          </div>
        </div>

        {/* === MOBILE LAYOUT === */}
        <div className="flex md:hidden flex-col flex-1 overflow-hidden">
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {mobileTab === 'agenda' ? (
              <TaskList
                onStart={handleStart}
                sessionActive={timer.sessionStarted}
                currentIndex={timer.currentIndex}
                completedIndexes={timer.completedIndexes}
              />
            ) : (
              <FocusTimer />
            )}
          </div>

          {/* Bottom tab bar */}
          <div className="flex-shrink-0 border-t border-zinc-800 flex">
            <button
              onClick={() => setMobileTab('agenda')}
              className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                mobileTab === 'agenda' ? 'text-violet-400 bg-violet-950/30' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg">📅</span>
              Agenda
            </button>
            <button
              onClick={() => setMobileTab('timer')}
              className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                mobileTab === 'timer' ? 'text-violet-400 bg-violet-950/30' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg">⏱️</span>
              Timer
              {timer.sessionStarted && (
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
