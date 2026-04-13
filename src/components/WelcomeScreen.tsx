'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const MESSAGES = [
  { hora: [5, 11],  titulo: (n: string) => `Bom dia, ${n} ☀️`,   sub: 'O dia acabou de começar. Você tem tudo dentro de você.' },
  { hora: [12, 17], titulo: (n: string) => `Boa tarde, ${n} 💪`,  sub: 'Cada minuto focado agora vale ouro amanhã.' },
  { hora: [18, 23], titulo: (n: string) => `Boa noite, ${n} 🌙`,  sub: 'Ainda dá tempo. Pequenos passos mudam tudo.' },
  { hora: [0, 4],   titulo: (n: string) => `Ei, ${n}... 🌌`,      sub: 'Sei que é tarde. Mas você está aqui, e isso já é muito.' },
]

const FRASES = [
  'Procrastinar não é fraqueza — é seu cérebro pedindo um empurrão. Estou aqui pra isso.',
  'Você não precisa ser perfeito. Só precisa começar.',
  'Com TDAH, começar é a parte mais difícil. Deixa eu te ajudar no primeiro passo.',
  'Cada tarefa concluída é uma vitória real. Celebre cada uma.',
  'Foco não é um dom — é uma habilidade. E você está aqui treinando.',
  'Não se compare com ninguém. Só com quem você foi ontem.',
]

function getMsgForHour() {
  const h = new Date().getHours()
  return MESSAGES.find(m => h >= m.hora[0] && h <= m.hora[1]) ?? MESSAGES[0]
}

export default function WelcomeScreen({ notifGranted, onRequestNotif }: { notifGranted: boolean; onRequestNotif: () => void }) {
  const { userName, setUserName } = useAppStore()
  const [input, setInput] = useState('')
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)])
  const [msg] = useState(getMsgForHour)
  const [editName, setEditName] = useState(false)

  if (!userName) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-6 animate-fade-in">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <img src="/icon.svg" alt="" className="w-20 h-20 relative" />
        </div>

        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text)' }}>
            Olá! Sou o <span className="gradient-text">FocusFlow</span>.
          </h1>
          <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Fui criado pra te ajudar a focar, vencer a procrastinação e respeitar o seu ritmo.
            Mas primeiro — preciso te conhecer.
          </p>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (input.trim()) setUserName(input.trim()) }}
          className="w-full max-w-xs flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Qual é o seu nome?"
            className="w-full px-4 py-3 rounded-xl text-center text-base font-medium outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)' }}
            autoFocus
            onFocus={e => (e.target.style.borderColor = 'rgba(139,92,246,0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button type="submit" disabled={!input.trim()}
            className="btn-primary w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
            Vamos começar →
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-black mb-1" style={{ color: 'var(--text)' }}>{msg.titulo(userName)}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{msg.sub}</p>
      </div>

      {/* Motivational card */}
      <div className="max-w-sm w-full rounded-2xl p-5 text-left relative overflow-hidden"
        style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
          style={{ background: '#8b5cf6', transform: 'translate(30%, -30%)' }} />
        <p className="text-2xl mb-2">💜</p>
        <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-muted)' }}>"{frase}"</p>
      </div>

      {/* Instruction */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Adicione tarefas na agenda e inicie o dia
        </div>

        {!notifGranted
          ? <button onClick={onRequestNotif}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
              🔔 Ativar alarme no navegador
            </button>
          : <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
              ✅ Alarme do navegador ativado
            </div>
        }
      </div>

      {/* Change name */}
      {!editName
        ? <button onClick={() => setEditName(true)} className="text-xs transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-dim)')}>
            Não é {userName}?
          </button>
        : <form onSubmit={e => { e.preventDefault(); if (input.trim()) { setUserName(input.trim()); setEditName(false) } }}
            className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Seu nome"
              className="px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', width: 140 }}
              autoFocus />
            <button type="submit" className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>Ok</button>
            <button type="button" onClick={() => setEditName(false)} className="text-sm" style={{ color: 'var(--text-muted)' }}>✕</button>
          </form>
      }
    </div>
  )
}
