'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import TaskList from '@/components/TaskList'
import FocusTimer from '@/components/FocusTimer'
import { playStartSound } from '@/lib/alarm'

export default function App() {
  const { timer, userName, startSession } = useAppStore()
  const [mobileTab, setMobileTab] = useState<'agenda' | 'timer'>('agenda')

  const handleStart = (taskIds: string[]) => {
    playStartSound()
    startSession(taskIds)
    setMobileTab('timer')
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 md:px-7 py-3.5"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(7,7,17,0.8)', backdropFilter: 'blur(20px)' }}>

        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <img src="/icon.svg" alt="FocusFlow" className="w-8 h-8" />
          </div>
          <span className="font-bold text-base tracking-tight gradient-text">FocusFlow</span>
          {timer.sessionStarted && (
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Em andamento</span>
            </span>
          )}
        </div>

        {userName && (
          <p className="hidden md:block text-xs" style={{ color: 'var(--text-muted)' }}>
            Foco total, <span style={{ color: 'var(--primary-light)' }}>{userName}</span>. 💜
          </p>
        )}
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* Desktop */}
        <div className="hidden md:flex flex-row flex-1 overflow-hidden">
          <div className="w-80 lg:w-[360px] xl:w-[400px] flex-shrink-0 overflow-y-auto p-5"
            style={{ borderRight: '1px solid var(--border)' }}>
            <TaskList
              onStart={handleStart}
              sessionActive={timer.sessionStarted}
              currentIndex={timer.currentIndex}
              completedIndexes={timer.completedIndexes}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col p-5 lg:p-8">
            <FocusTimer />
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {mobileTab === 'agenda'
              ? <TaskList onStart={handleStart} sessionActive={timer.sessionStarted} currentIndex={timer.currentIndex} completedIndexes={timer.completedIndexes} />
              : <FocusTimer />}
          </div>
          <div className="flex-shrink-0 flex" style={{ borderTop: '1px solid var(--border)' }}>
            {(['agenda', 'timer'] as const).map((tab) => (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className="flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors"
                style={{ color: mobileTab === tab ? 'var(--primary-light)' : 'var(--text-muted)', background: mobileTab === tab ? 'rgba(139,92,246,0.08)' : 'transparent' }}>
                <span className="text-lg">{tab === 'agenda' ? '📅' : '⏱️'}</span>
                {tab === 'agenda' ? 'Agenda' : 'Timer'}
                {tab === 'timer' && timer.sessionStarted && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
