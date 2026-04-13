'use client'

import { useState } from 'react'
import { Task, useAppStore } from '@/lib/store'
import TaskForm from './TaskForm'

interface Props {
  onStart: (taskIds: string[]) => void
  sessionActive: boolean
  currentIndex: number
  completedIndexes: number[]
}

function parseStartTime(hhmm: string): { h: number; m: number } {
  const [h, m] = hhmm.split(':').map(Number)
  return { h: h ?? 8, m: m ?? 0 }
}

function addMinutes(base: { h: number; m: number }, minutes: number): { h: number; m: number } {
  const total = base.h * 60 + base.m + minutes
  return { h: Math.floor(total / 60) % 24, m: total % 60 }
}

function fmt(t: { h: number; m: number }) {
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`
}

function fmtDuration(min: number) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export default function TaskList({ onStart, sessionActive, currentIndex, completedIndexes }: Props) {
  const { tasks, dayStartTime, setDayStartTime, addTask, updateTask, removeTask, reorderTasks } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [editingTime, setEditingTime] = useState(false)
  const [tempTime, setTempTime] = useState(dayStartTime)

  const totalMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0)
  const start = parseStartTime(dayStartTime)
  const endTime = addMinutes(start, totalMinutes)

  // Calcula horário de início de cada tarefa
  const taskSlots = tasks.map((task, i) => {
    const minutesBefore = tasks.slice(0, i).reduce((s, t) => s + t.durationMinutes, 0)
    const slotStart = addMinutes(start, minutesBefore)
    const slotEnd = addMinutes(start, minutesBefore + task.durationMinutes)
    return { task, slotStart, slotEnd }
  })

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
    <div className="flex flex-col gap-4 h-full">

      {/* Cabeçalho da agenda */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 capitalize">{today}</p>
            <h2 className="text-lg font-bold text-white leading-tight">Agenda do Dia</h2>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            disabled={sessionActive}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <span className="text-base leading-none">+</span> Tarefa
          </button>
        </div>

        {/* Horário de início + resumo */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 text-xs">Início:</span>
            {editingTime ? (
              <form
                onSubmit={(e) => { e.preventDefault(); setDayStartTime(tempTime); setEditingTime(false) }}
                className="flex items-center gap-1"
              >
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="bg-zinc-800 border border-violet-600 rounded px-1.5 py-0.5 text-violet-400 text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="text-violet-400 text-xs hover:text-violet-300">✓</button>
                <button type="button" onClick={() => setEditingTime(false)} className="text-zinc-500 text-xs hover:text-zinc-300">✕</button>
              </form>
            ) : (
              <button
                onClick={() => { setTempTime(dayStartTime); setEditingTime(true) }}
                className="text-violet-400 text-xs font-mono font-bold hover:text-violet-300 transition-colors"
                disabled={sessionActive}
              >
                {dayStartTime} ✏️
              </button>
            )}
          </div>
          {tasks.length > 0 && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 text-xs">{tasks.length} tarefas</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 text-xs">{fmtDuration(totalMinutes)}</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-500 text-xs">até {fmt(endTime)}</span>
            </>
          )}
        </div>
      </div>

      {/* Formulário */}
      {(showForm || editingTask) && (
        <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            {editingTask ? 'Editar tarefa' : 'Nova tarefa'}
          </h3>
          <TaskForm
            initial={editingTask ?? undefined}
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

      {/* Lista de tarefas como agenda */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto pr-1 gap-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
            <span className="text-5xl mb-4">📅</span>
            <p className="text-zinc-400 font-medium">Agenda vazia</p>
            <p className="text-zinc-600 text-sm mt-1">Monte sua rotina diária clicando em "+ Tarefa"</p>
          </div>
        ) : (
          taskSlots.map(({ task, slotStart, slotEnd }, index) => {
            const isCompleted = completedIndexes.includes(index)
            const isCurrent = sessionActive && index === currentIndex
            const isFuture = sessionActive && index > currentIndex && !isCompleted

            return (
              <div
                key={task.id}
                draggable={!sessionActive}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={() => setDragIndex(null)}
                className={`group flex items-stretch gap-0 rounded-xl border overflow-hidden transition-all ${
                  isCurrent
                    ? 'border-violet-500 shadow-lg shadow-violet-900/30'
                    : isCompleted
                    ? 'border-zinc-800 opacity-50'
                    : 'border-zinc-800 hover:border-zinc-700'
                } ${sessionActive ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
              >
                {/* Coluna de horário */}
                <div
                  className="flex flex-col items-center justify-center px-3 py-3 min-w-[64px] text-center"
                  style={{ backgroundColor: `${task.color}18` }}
                >
                  <span className="text-xs font-bold" style={{ color: task.color }}>
                    {fmt(slotStart)}
                  </span>
                  <div className="w-px flex-1 my-1" style={{ backgroundColor: `${task.color}40` }} />
                  <span className="text-xs text-zinc-600">{fmt(slotEnd)}</span>
                </div>

                {/* Conteúdo da tarefa */}
                <div className="flex items-center gap-3 flex-1 px-3 py-3 bg-zinc-900/60">
                  <span className="text-xl">{task.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isCompleted ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {task.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{fmtDuration(task.durationMinutes)}</p>
                  </div>

                  {/* Status / Ações */}
                  {isCompleted && <span className="text-emerald-500 text-lg flex-shrink-0">✓</span>}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-900/40 px-2 py-0.5 rounded-full flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                      agora
                    </span>
                  )}
                  {!sessionActive && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => { setEditingTask(task); setShowForm(false) }}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
                      >✏️</button>
                      <button
                        onClick={() => removeTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-900/40 text-zinc-500 hover:text-red-400 transition-colors text-sm"
                      >🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Botão Iniciar Dia */}
      {tasks.length > 0 && !sessionActive && (
        <div className="pt-2 border-t border-zinc-800">
          <button
            onClick={() => onStart(tasks.map((t) => t.id))}
            className="w-full py-3.5 rounded-xl font-black text-white text-base transition-all bg-violet-600 hover:bg-violet-500 active:scale-95 flex items-center justify-center gap-2"
          >
            🚀 Iniciar Dia
          </button>
          <p className="text-center text-xs text-zinc-600 mt-2">
            {tasks.length} tarefas · {fmtDuration(totalMinutes)} · termina às {fmt(endTime)}
          </p>
        </div>
      )}

      {/* Sessão ativa — botão encerrar */}
      {sessionActive && (
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-center text-xs text-zinc-500">
            Rotina em andamento · {completedIndexes.length}/{tasks.length} concluídas
          </p>
        </div>
      )}
    </div>
  )
}
