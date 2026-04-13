'use client'

import { useState } from 'react'
import { Task, getDurationMinutes } from '@/lib/store'

const COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#dc2626',
  '#d97706', '#db2777', '#0891b2', '#65a30d',
]

const EMOJIS = ['💼', '📚', '💪', '🎯', '✍️', '🧠', '📞', '🛠️', '🎨', '📝', '🏃', '🍽️', '💤', '🧘']

interface Props {
  onSave: (task: Omit<Task, 'id'>) => void
  onCancel: () => void
  initial?: Task
  suggestedStart?: string
}

export default function TaskForm({ onSave, onCancel, initial, suggestedStart }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [startTime, setStartTime] = useState(initial?.startTime ?? suggestedStart ?? '09:00')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')

  const duration = getDurationMinutes(startTime, endTime)
  const validTimes = endTime > startTime

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !validTimes) return
    onSave({ name: name.trim(), startTime, endTime, color, emoji })
  }

  function fmtDuration(min: number) {
    if (min <= 0) return '—'
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nome */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Nome da tarefa</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Reunião com cliente"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          autoFocus
        />
      </div>

      {/* Horários */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Início</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
          />
        </div>
        <div className="text-zinc-600 pb-2 text-lg">→</div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Fim</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 text-sm font-mono ${
              validTimes ? 'border-zinc-700 focus:ring-violet-500' : 'border-red-700 focus:ring-red-500'
            }`}
          />
        </div>
        <div className={`pb-2 text-xs font-medium min-w-[52px] text-right ${validTimes ? 'text-violet-400' : 'text-red-400'}`}>
          {validTimes ? fmtDuration(duration) : 'inválido'}
        </div>
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">Ícone</label>
        <div className="flex gap-1.5 flex-wrap">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-lg w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                emoji === e ? 'bg-violet-600 scale-110' : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-2">Cor</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform ${
                color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim() || !validTimes}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          {initial ? 'Salvar' : 'Adicionar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
