'use client'

import { useState } from 'react'
import { Task } from '@/lib/store'

const COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#dc2626',
  '#d97706', '#db2777', '#0891b2', '#65a30d',
]

const EMOJIS = ['💼', '📚', '💪', '🎯', '✍️', '🧠', '📞', '🛠️', '🎨', '📝', '🏃', '🍽️', '💤', '🧘']

interface Props {
  onSave: (task: Omit<Task, 'id'>) => void
  onCancel: () => void
  initial?: Task
}

export default function TaskForm({ onSave, onCancel, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 25)
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), durationMinutes: duration, color, emoji })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">Nome da tarefa</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Responder e-mails"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-1">
          Duração: <span className="text-violet-400 font-bold">{duration} min</span>
        </label>
        <input
          type="range"
          min={1}
          max={120}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-violet-500"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>1 min</span>
          <span>30 min</span>
          <span>60 min</span>
          <span>120 min</span>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[5, 10, 15, 25, 30, 45, 60, 90].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDuration(m)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                duration === m
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Emoji</label>
        <div className="flex gap-2 flex-wrap">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                emoji === e ? 'bg-violet-600 scale-110' : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Cor</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {initial ? 'Salvar' : 'Adicionar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
