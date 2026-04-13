'use client'

import { useState } from 'react'
import { Task, useAppStore, getDurationMinutes } from '@/lib/store'
import TaskForm from './TaskForm'

interface Props {
  onStart: (taskIds: string[]) => void
  sessionActive: boolean
  currentIndex: number
  completedIndexes: number[]
}

function fmtDuration(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function TaskList({ onStart, sessionActive, currentIndex, completedIndexes }: Props) {
  const { tasks, addTask, updateTask, removeTask, reorderTasks } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const totalMinutes = tasks.reduce((sum, t) => sum + getDurationMinutes(t.startTime, t.endTime), 0)
  const suggestedStart = tasks.length > 0 ? tasks[tasks.length - 1].endTime : undefined

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  const handleDragStart = (i: number) => setDragIndex(i)
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    const arr = [...tasks]
    const [moved] = arr.splice(dragIndex, 1)
    arr.splice(i, 0, moved)
    reorderTasks(arr)
    setDragIndex(i)
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{today}</p>
          <h2 className="text-base font-bold mt-0.5" style={{ color: 'var(--text)' }}>Agenda do Dia</h2>
          {tasks.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} · {fmtDuration(totalMinutes)}
            </p>
          )}
        </div>
        {!sessionActive && (
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--primary-light)' }}
          >
            + Tarefa
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || editingTask) && (
        <div className="rounded-2xl p-4 animate-fade-in" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            {editingTask ? '✏️ Editar tarefa' : '✨ Nova tarefa'}
          </p>
          <TaskForm
            initial={editingTask ?? undefined}
            suggestedStart={suggestedStart}
            onSave={(data) => {
              if (editingTask) updateTask(editingTask.id, data)
              else addTask(data)
              setShowForm(false); setEditingTask(null)
            }}
            onCancel={() => { setShowForm(false); setEditingTask(null) }}
          />
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>📅</div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Agenda vazia</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Adicione tarefas com horário para montar sua rotina</p>
            </div>
          </div>
        ) : tasks.map((task, index) => {
          const isCompleted = completedIndexes.includes(index)
          const isCurrent = sessionActive && index === currentIndex
          const dur = getDurationMinutes(task.startTime, task.endTime)

          return (
            <div
              key={task.id}
              draggable={!sessionActive}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragIndex(null)}
              className={`group flex items-stretch rounded-2xl overflow-hidden transition-all duration-200 ${!sessionActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isCurrent ? 'animate-fade-in' : ''}`}
              style={{
                background: isCurrent ? `${task.color}14` : isCompleted ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isCurrent ? task.color + '55' : isCompleted ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isCurrent ? `0 0 20px ${task.color}22` : 'none',
                opacity: isCompleted ? 0.45 : 1,
              }}
            >
              {/* Color bar */}
              <div className="w-1 flex-shrink-0" style={{ background: isCompleted ? 'rgba(255,255,255,0.1)' : `linear-gradient(180deg, ${task.color}, ${task.color}88)` }} />

              {/* Time column */}
              <div className="flex flex-col items-center justify-center px-3 py-3 w-16 flex-shrink-0 gap-0.5">
                <span className="text-xs font-bold leading-none tabular-nums" style={{ color: isCurrent ? task.color : 'var(--text-muted)' }}>{task.startTime}</span>
                <div className="w-px h-2 rounded-full" style={{ background: 'var(--border)' }} />
                <span className="text-xs leading-none tabular-nums" style={{ color: 'var(--text-dim)' }}>{task.endTime}</span>
              </div>

              {/* Content */}
              <div className="flex items-center gap-2.5 flex-1 py-3 pr-3 min-w-0">
                <span className="text-lg flex-shrink-0">{task.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight truncate ${isCompleted ? 'line-through' : ''}`}
                    style={{ color: isCompleted ? 'var(--text-dim)' : 'var(--text)' }}>
                    {task.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{fmtDuration(dur)}</p>
                </div>

                {isCompleted && <span className="text-emerald-500 flex-shrink-0">✓</span>}
                {isCurrent && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: `${task.color}22`, color: task.color, border: `1px solid ${task.color}44` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: task.color }} />
                    agora
                  </span>
                )}

                {!sessionActive && (
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => { setEditingTask(task); setShowForm(false) }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>✏️</button>
                    <button onClick={() => removeTask(task.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>🗑️</button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {tasks.length > 0 && !sessionActive && (
        <div className="flex-shrink-0 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => onStart(tasks.map(t => t.id))}
            className="btn-primary w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            Iniciar Dia
          </button>
          {tasks[0] && tasks[tasks.length - 1] && (
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-dim)' }}>
              {tasks[0].startTime} → {tasks[tasks.length - 1].endTime} · {fmtDuration(totalMinutes)}
            </p>
          )}
        </div>
      )}
      {sessionActive && (
        <div className="flex-shrink-0 pt-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completedIndexes.length}/{tasks.length} concluídas
          </p>
        </div>
      )}
    </div>
  )
}
