'use client'

import { useState } from 'react'
import { Task, getDurationMinutes } from '@/lib/store'

const COLORS = ['#8b5cf6','#3b82f6','#10b981','#ef4444','#f59e0b','#ec4899','#06b6d4','#84cc16']
const EMOJIS = ['💼','📚','💪','🎯','✍️','🧠','📞','🛠️','🎨','📝','🏃','🍽️','💤','🧘']

interface Props {
  onSave: (task: Omit<Task, 'id'>) => void
  onCancel: () => void
  initial?: Task
  suggestedStart?: string
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
}

export default function TaskForm({ onSave, onCancel, initial, suggestedStart }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [startTime, setStartTime] = useState(initial?.startTime ?? suggestedStart ?? '09:00')
  const [endTime, setEndTime] = useState(initial?.endTime ?? '10:00')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯')

  const dur = getDurationMinutes(startTime, endTime)
  const valid = endTime > startTime && name.trim().length > 0

  const fmtDur = (m: number) => m <= 0 ? '—' : m < 60 ? `${m}min` : `${Math.floor(m/60)}h${m%60 ? ` ${m%60}m` : ''}`

  return (
    <form onSubmit={e => { e.preventDefault(); if (valid) onSave({ name: name.trim(), startTime, endTime, color, emoji }) }}
      className="flex flex-col gap-3">

      {/* Name */}
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Nome da tarefa" style={inputStyle} autoFocus
        onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')} />

      {/* Times */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Início</p>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
            style={{ ...inputStyle, fontFamily: 'monospace' }} />
        </div>
        <div className="text-lg mt-4" style={{ color: 'var(--text-dim)' }}>→</div>
        <div className="flex-1">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Fim</p>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
            style={{ ...inputStyle, fontFamily: 'monospace', borderColor: dur > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.5)' }} />
        </div>
        <div className="mt-4 text-xs font-bold min-w-[44px] text-right" style={{ color: dur > 0 ? color : '#ef4444' }}>
          {fmtDur(dur)}
        </div>
      </div>

      {/* Emoji */}
      <div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Ícone</p>
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map(e => (
            <button key={e} type="button" onClick={() => setEmoji(e)}
              className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all"
              style={{ background: emoji === e ? `${color}33` : 'rgba(255,255,255,0.05)', border: `1px solid ${emoji === e ? color + '66' : 'transparent'}`, transform: emoji === e ? 'scale(1.1)' : 'scale(1)' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Cor</p>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform"
              style={{ background: c, transform: color === c ? 'scale(1.3)' : 'scale(1)', boxShadow: color === c ? `0 0 8px ${c}` : 'none', outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={!valid}
          className="flex-1 py-2 rounded-xl font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: valid ? `linear-gradient(135deg, ${color}, ${color}bb)` : 'rgba(255,255,255,0.1)' }}>
          {initial ? 'Salvar' : 'Adicionar'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
