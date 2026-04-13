'use client'

import { useState } from 'react'
import { Task, useAppStore, getDurationMinutes, timeToMinutes } from '@/lib/store'
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
  return m > 0 ? `${h}h${m}` : `${h}h`
}

export default function TaskList({ onStart, sessionActive, currentIndex, completedIndexes }: Props) {
  const { tasks, addTask, updateTask, removeTask, reorderTasks } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const totalMinutes = tasks.reduce((sum, t) => sum + getDurationMinutes(t.startTime, t.endTime), 0)

  // Horário sugerido para nova tarefa = fim da última tarefa
  const suggestedStart = tasks.length > 0 ? tasks[tasks.length - 1].endTime : undefined

  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newTasks = [...tasks]
    const [moved] = newTasks.splice(dragIndex, 1)
    newTasks.splice(index, 0, moved)
    reorderTasks(newTasks)
    setDragIndex(index)
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 capitalize truncate">{today}</p>
          <h2 className="text-base font-bold text-white leading-tight">Agenda do Dia</h2>
          {tasks.length > 0 && (
            <p className="text-xs text-zinc-600 mt-0.5">
              {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'} · {fmtDuration(totalMinutes)} total
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          disabled={sessionActive}
          className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 flex-shrink-0"
        >
          + Tarefa
        </button>
      </div>

      {/* Formulário */}
      {(showForm || editingTask) && (
        <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3">
          <p className="text-xs font-semibold text-zinc-400 mb-3">
            {editingTask ? 'Editar tarefa' : 'Nova tarefa'}
          </p>
          <TaskForm
            initial={editingTask ?? undefined}
            suggestedStart={suggestedStart}
            onSave={(data) => {
              if (editingTask) updateTask(editingTask.id, data)
              else addTask(data)
              setShowForm(false)
              setEditingTask(null)
            }}
            onCancel={() => { setShowForm(false); setEditingTask(null) }}
          />
        </div>
      )}

      {/* Lista */}
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto min-h-0">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
            <span className="text-4xl mb-3">📅</span>
            <p className="text-zinc-400 font-medium text-sm">Agenda vazia</p>
            <p className="text-zinc-600 text-xs mt-1">Clique em "+ Tarefa" para montar sua rotina</p>
          </div>
        ) : (
          tasks.map((task, index) => {
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
                className={`group flex items-stretch rounded-xl border overflow-hidden transition-all select-none ${
                  isCurrent
                    ? 'border-violet-500 shadow-md shadow-violet-900/30'
                    : isCompleted
                    ? 'border-zinc-800/50 opacity-50'
                    : 'border-zinc-800 hover:border-zinc-700'
                } ${!sessionActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
              >
                {/* Coluna de horário */}
                <div
                  className="flex flex-col items-center justify-center px-2 py-2.5 w-14 flex-shrink-0 text-center gap-0.5"
                  style={{ backgroundColor: `${task.color}20` }}
                >
                  <span className="text-xs font-bold leading-none" style={{ color: task.color }}>
                    {task.startTime}
                  </span>
                  <div className="w-px h-3 my-0.5" style={{ backgroundColor: `${task.color}50` }} />
                  <span className="text-xs text-zinc-500 leading-none">{task.endTime}</span>
                </div>

                {/* Corpo */}
                <div className="flex items-center gap-2 flex-1 px-2.5 py-2 bg-zinc-900/70 min-w-0">
                  <span className="text-lg flex-shrink-0">{task.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-xs leading-tight truncate ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.name}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{fmtDuration(dur)}</p>
                  </div>

                  {/* Status */}
                  {isCompleted && <span className="text-emerald-500 flex-shrink-0 text-sm">✓</span>}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-900/40 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                      agora
                    </span>
                  )}

                  {/* Ações */}
                  {!sessionActive && (
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => { setEditingTask(task); setShowForm(false) }}
                        className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors text-xs"
                      >✏️</button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1.5 rounded hover:bg-red-900/40 text-zinc-500 hover:text-red-400 transition-colors text-xs"
                      >🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Rodapé */}
      {tasks.length > 0 && !sessionActive && (
        <div className="pt-2 border-t border-zinc-800 flex-shrink-0">
          <button
            onClick={() => onStart(tasks.map((t) => t.id))}
            className="w-full py-3 rounded-xl font-black text-white text-sm transition-all bg-violet-600 hover:bg-violet-500 active:scale-95 flex items-center justify-center gap-2"
          >
            🚀 Iniciar Dia
          </button>
          {tasks[0] && tasks[tasks.length - 1] && (
            <p className="text-center text-xs text-zinc-600 mt-1.5">
              {tasks[0].startTime} → {tasks[tasks.length - 1].endTime} · {fmtDuration(totalMinutes)}
            </p>
          )}
        </div>
      )}

      {sessionActive && (
        <div className="pt-2 border-t border-zinc-800 flex-shrink-0">
          <p className="text-center text-xs text-zinc-500">
            {completedIndexes.length}/{tasks.length} concluídas
          </p>
        </div>
      )}
    </div>
  )
}
