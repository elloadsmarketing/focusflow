'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const MESSAGES = [
  {
    hora: [5, 11],
    titulo: (nome: string) => `Bom dia, ${nome}! ☀️`,
    sub: 'O dia acabou de começar. Você tem tudo dentro de você pra fazer acontecer.',
  },
  {
    hora: [12, 17],
    titulo: (nome: string) => `Boa tarde, ${nome}! 💪`,
    sub: 'Cada minuto focado agora é uma versão melhor de você amanhã.',
  },
  {
    hora: [18, 23],
    titulo: (nome: string) => `Boa noite, ${nome}! 🌙`,
    sub: 'Ainda dá tempo de ser produtivo. Pequenos passos fazem a diferença.',
  },
  {
    hora: [0, 4],
    titulo: (nome: string) => `Ei, ${nome}... 🌌`,
    sub: 'Sei que é tarde. Mas você está aqui, e isso já é muito.',
  },
]

const CUIDADO_FRASES = [
  'Procrastinar não é fraqueza — é o seu cérebro pedindo um empurrão. Eu estou aqui pra isso.',
  'Você não precisa ser perfeito. Precisa apenas começar. Eu cuido do resto.',
  'Com TDAH, começar é a parte mais difícil. Então deixa eu te ajudar a dar o primeiro passo.',
  'Cada tarefa concluída é uma vitória real. E você merece celebrar cada uma.',
  'Foco não é um dom — é uma habilidade. E você está aqui treinando. Isso conta muito.',
  'Não se compare com ninguém. Só compare com quem você foi ontem.',
]

function getMessageForHour() {
  const hora = new Date().getHours()
  return MESSAGES.find((m) => hora >= m.hora[0] && hora <= m.hora[1]) ?? MESSAGES[0]
}

function getRandomFrase() {
  return CUIDADO_FRASES[Math.floor(Math.random() * CUIDADO_FRASES.length)]
}

interface Props {
  notifGranted: boolean
  onRequestNotif: () => void
}

export default function WelcomeScreen({ notifGranted, onRequestNotif }: Props) {
  const { userName, setUserName } = useAppStore()
  const [inputName, setInputName] = useState('')
  const [frase] = useState(getRandomFrase)
  const [msg] = useState(getMessageForHour)
  const [showNameForm, setShowNameForm] = useState(false)

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputName.trim()
    if (trimmed) {
      setUserName(trimmed)
      setShowNameForm(false)
    }
  }

  // First time — ask for name
  if (!userName) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-8">
        <div className="text-6xl animate-bounce">👋</div>
        <div>
          <h2 className="text-3xl font-black text-white mb-3">Olá! Eu sou o FocusFlow.</h2>
          <p className="text-zinc-400 text-base max-w-sm leading-relaxed">
            Fui criado pra te ajudar a focar, vencer a procrastinação e respeitar o seu ritmo.
            Mas primeiro, preciso te conhecer.
          </p>
        </div>

        <form onSubmit={handleSaveName} className="w-full max-w-xs flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 text-left">
              Qual é o seu nome?
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Seu primeiro nome"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!inputName.trim()}
            className="w-full py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 text-lg"
          >
            Vamos começar →
          </button>
        </form>
      </div>
    )
  }

  // Returning user
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-6">
      {/* Greeting */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-black text-white">{msg.titulo(userName)}</h2>
        <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">{msg.sub}</p>
      </div>

      {/* Cuidado card */}
      <div className="bg-violet-950/40 border border-violet-700/40 rounded-2xl px-6 py-5 max-w-xs">
        <div className="text-2xl mb-2">💜</div>
        <p className="text-zinc-300 text-sm leading-relaxed italic">"{frase}"</p>
      </div>

      {/* Instrução */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <span className="text-zinc-600">←</span>
          <span>Adicione suas tarefas e inicie a rotina</span>
        </div>

        {!notifGranted && (
          <button
            onClick={onRequestNotif}
            className="flex items-center gap-2 px-4 py-2 bg-amber-900/40 border border-amber-700/50 rounded-xl text-amber-400 text-sm font-medium hover:bg-amber-900/60 transition-colors"
          >
            🔔 Ativar alarme no navegador
          </button>
        )}

        {notifGranted && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/40 rounded-xl text-emerald-400 text-xs">
            ✅ Alarme do navegador ativado
          </div>
        )}
      </div>

      {/* Change name */}
      {!showNameForm ? (
        <button
          onClick={() => setShowNameForm(true)}
          className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
        >
          Não é {userName}? Clique aqui
        </button>
      ) : (
        <form onSubmit={handleSaveName} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Seu nome"
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 w-36"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
          >
            Ok
          </button>
          <button
            type="button"
            onClick={() => setShowNameForm(false)}
            className="text-zinc-500 text-sm hover:text-zinc-300"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  )
}
