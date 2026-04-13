'use client'

import { useState } from 'react'
import { Task, useAppStore } from '@/lib/store'
import TaskForm from './TaskForm'

interface Props {
  onStart: (taskIds: string[]) => void
  sessionActive: boolean
}

export default function TaskList({ onStart, sessionActive }: Props) {
  const { tasks, addTask, updateTask, removeTask, reorderTasks } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [selected, setSelected] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleStartAll = () => {
    const ids = tasks.map((t) => t.id)
    if (ids.length > 0) onStart(ids)
  }

  const handleStartSelected = () => {
    // Use selected in order they appear in tasks list
    const ordered = tasks.filter((t) => selected.includes(t.id)).map((t) => t.id)
    if (ordered.length > 0) onStart(ordered)
  }

  const totalMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0)

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

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Sua Rotina</h2>
          {tasks.length > 0 && (
            <p className="text-xs text-zinc-500">
              {tasks.length} tarefas · {totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                : `${totalMinutes}m`} no total
            </p>
          )}
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          disabled={sessionActive}
        >
          <span className="text-base">+</span> Tarefa
        </button>
      </div>

      {/* Form */}
      {(showForm || editingTask) && (
        <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            {editingTask ? 'Editar tarefa' : 'Nova tarefa'}
          </h3>
          <TaskForm
            initial={editingTask ?? undefined}
            onSave={(data) => {
              if (editingTask) {
                updateTask(editingTask.id, data)
              } else {
                addTask(data)
              }
              setShowForm(false)
              setEditingTask(null)
            }}
            onCancel={() => { setShowForm(false); setEditingTask(null) }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-zinc-400 font-medium">Nenhuma tarefa ainda</p>
            <p className="text-zinc-600 text-sm mt-1">Adicione suas tarefas para começar a rotina</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              draggable={!sessionActive}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => setDragIndex(null)}
              className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                selected.includes(task.id)
                  ? 'border-violet-500 bg-violet-950/40'
                  : 'border-zinc-700/50 bg-zinc-800/60 hover:border-zinc-600'
              } ${sessionActive ? 'opacity-60 cursor-default' : ''}`}
            >
              {/* Select checkbox */}
              <button
                onClick={() => !sessionActive && toggleSelect(task.id)}
                className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  borderColor: selected.includes(task.id) ? task.color : '#52525b',
                  backgroundColor: selected.includes(task.id) ? task.color : 'transparent',
                }}
                disabled={sessionActive}
              >
                {selected.includes(task.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Color bar */}
              <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />

              {/* Emoji + Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">{task.emoji}</span>
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">{task.name}</p>
                  <p className="text-xs text-zinc-500">{task.durationMinutes} min</p>
                </div>
              </div>

              {/* Actions */}
              {!sessionActive && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingTask(task); setShowForm(false) }}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 rounded-lg hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"
                    title="Remover"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {/* Drag handle */}
              {!sessionActive && (
                <div className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">⠿</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Start buttons */}
      {tasks.length > 0 && !sessionActive && (
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          {selected.length > 0 ? (
            <>
              <button
                onClick={handleStartSelected}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all bg-violet-600 hover:bg-violet-500 active:scale-95"
              >
                ▶ Iniciar {selected.length} selecionada{selected.length > 1 ? 's' : ''}
              </button>
              <button
                onClick={() => setSelected([])}
                className="px-4 py-3 rounded-xl font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
              >
                Limpar
              </button>
            </>
          ) : (
            <button
              onClick={handleStartAll}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all bg-violet-600 hover:bg-violet-500 active:scale-95"
            >
              ▶ Iniciar Rotina Completa
            </button>
          )}
        </div>
      )}
    </div>
  )
}
