import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, X } from 'lucide-react'
import { VibeAvatar } from './VibeAvatar'

const GAMES = [
  {
    id: 'trivia',
    tag: 'trv',
    label: 'vibe trivia',
    desc: 'claude builds questions from both your interests',
    color: '#6f8b5e',
  },
  {
    id: 'hottakes',
    tag: 'hot',
    label: 'hot takes',
    desc: 'swipe on spicy opinions — see if you agree',
    color: '#c5532c',
  },
  {
    id: 'thisorthat',
    tag: 'tot',
    label: 'this or that',
    desc: 'would you rather — reveal your true vibe',
    color: '#cd8a3b',
  },
]

async function fetchTrivia(currentUser, matchedUser) {
  const res = await fetch('/api/claude/trivia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUser, matchedUser }),
  })
  return res.json()
}

async function fetchHotTakes(currentUser, matchedUser) {
  const res = await fetch('/api/claude/hottakes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentUser, matchedUser }),
  })
  return res.json()
}

function TriviaGame({ questions, onDone }) {
  const [qi, setQi] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const q = questions[qi]

  const handleAnswer = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.answer) setScore(s => s + 1)
    setTimeout(() => {
      if (qi + 1 < questions.length) { setQi(qi + 1); setSelected(null) }
      else setShowResult(true)
    }, 1200)
  }

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 px-6 py-8"
      >
        <div
          className="font-display tabular-nums"
          style={{
            color: 'var(--terracotta)',
            fontSize: 120, fontWeight: 300, lineHeight: 0.85,
            letterSpacing: '-0.05em',
          }}
        >
          {score}<span style={{ color: 'var(--ink-whisper)' }}>/{questions.length}</span>
        </div>
        <p className="italic-serif text-center text-base max-w-xs" style={{ color: 'var(--ink-soft)' }}>
          {pct >= 80 ? 'big brain energy — you two vibe' : pct >= 60 ? 'solid — you sync up' : 'different knowledge bases, still connects'}
        </p>
        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={onDone}
          className="w-full rounded-full py-3.5 font-bold text-sm"
          style={{
            background: 'var(--ink)',
            color: 'var(--cream)',
            boxShadow: '0 14px 28px -12px rgba(197,83,44,0.5), 0 2px 0 var(--ink-soft)',
          }}
        >
          <span className="font-mono tracking-widest uppercase">+150 xp — back to radar</span>
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--paper-sunk)' }}>
          <div
            className="h-full"
            style={{
              width: `${((qi) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--terracotta), var(--ochre))',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: 'var(--ink-muted)' }}>
          {qi + 1}/{questions.length}
        </span>
      </div>

      <span
        className="self-start font-mono text-[9px] font-bold tracking-[0.25em] uppercase px-2 py-1 rounded-full"
        style={{ background: 'var(--paper-tint)', border: '1px solid var(--line)', color: 'var(--sienna)' }}
      >
        topic · {q.topic}
      </span>

      <p
        className="font-display leading-snug"
        style={{
          color: 'var(--ink)',
          fontSize: 24, fontWeight: 400,
          fontVariationSettings: "'SOFT' 60, 'opsz' 36",
        }}
      >
        {q.q}
      </p>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer
          const isSelected = i === selected
          let bg = 'var(--cream)'
          let border = 'var(--line)'
          let textColor = 'var(--ink)'
          if (selected !== null) {
            if (isCorrect) { bg = 'rgba(111,139,94,0.12)'; border = 'var(--sage)'; textColor = 'var(--sage-d)' }
            else if (isSelected) { bg = 'rgba(162,53,67,0.1)'; border = 'var(--cranberry)'; textColor = 'var(--cranberry)' }
          }
          return (
            <motion.button
              key={i}
              whileHover={selected === null ? { y: -1 } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(i)}
              className="flex items-center justify-between rounded-sm px-4 py-3 text-left text-sm font-medium"
              style={{
                background: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                transition: 'all 0.2s',
                cursor: selected !== null ? 'default' : 'pointer',
              }}
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--ink-muted)' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
              {selected !== null && isCorrect && <Check size={14} />}
              {selected !== null && isSelected && !isCorrect && <X size={14} />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function HotTakesGame({ takes, matchedUser, onDone }) {
  const [idx, setIdx] = useState(0)
  const [myAnswers, setMyAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const theirAnswers = takes.map((_, i) => i % 3 !== 1)

  const handleSwipe = (agree) => {
    const next = [...myAnswers, agree]
    setMyAnswers(next)
    if (next.length >= takes.length) setShowResult(true)
    else setIdx(i => i + 1)
  }

  if (showResult) {
    const matches = myAnswers.filter((a, i) => a === theirAnswers[i]).length
    const pct = Math.round((matches / takes.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 px-6 py-8"
      >
        <div
          className="font-display tabular-nums"
          style={{
            color: 'var(--terracotta)',
            fontSize: 110, fontWeight: 300, lineHeight: 0.85,
            letterSpacing: '-0.05em',
          }}
        >
          {pct}<span style={{ color: 'var(--ink-whisper)', fontSize: 72 }}>%</span>
        </div>
        <p className="italic-serif text-center text-base max-w-xs" style={{ color: 'var(--ink-soft)' }}>
          {pct >= 70 ? 'you think alike — dangerous combo' : pct >= 40 ? "balanced — you'd argue in a good way" : "opposites — actually more interesting"}
        </p>

        <div className="w-full flex flex-col gap-1.5">
          {takes.map((take, i) => (
            <div key={i} className="flex items-center gap-2 text-xs rounded-sm px-3 py-2"
              style={{ background: 'var(--cream)', border: '1px solid var(--line)' }}>
              <span className="flex-1 italic-serif" style={{ color: 'var(--ink-soft)' }}>{take}</span>
              <span className="font-mono text-[10px]" style={{ color: myAnswers[i] ? 'var(--sage)' : 'var(--cranberry)' }}>
                {myAnswers[i] ? '✓' : '✗'}
              </span>
              <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>you</span>
              <span className="font-mono text-[10px]" style={{ color: theirAnswers[i] ? 'var(--sage)' : 'var(--cranberry)' }}>
                {theirAnswers[i] ? '✓' : '✗'}
              </span>
              <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                {matchedUser.name?.split(' ')[0]?.toLowerCase()}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={onDone}
          className="w-full rounded-full py-3.5 font-bold text-sm"
          style={{
            background: 'var(--ink)', color: 'var(--cream)',
            boxShadow: '0 14px 28px -12px rgba(205,138,59,0.5), 0 2px 0 var(--ink-soft)',
          }}
        >
          <span className="font-mono tracking-widest uppercase">+100 xp — back to radar</span>
        </motion.button>
      </motion.div>
    )
  }

  const take = takes[idx]
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-6">
      <div className="flex items-center gap-2">
        {takes.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: i === idx ? 20 : 6, height: 6,
              background: i <= idx ? 'var(--terracotta)' : 'var(--line-strong)',
            }}
          />
        ))}
      </div>

      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-sm p-6 text-center"
        style={{
          background: 'var(--cream)',
          border: '1px solid var(--line)',
          borderLeft: '3px solid var(--terracotta)',
          boxShadow: 'var(--shadow-sm)',
          minHeight: 120,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <p className="font-display italic-serif leading-snug" style={{
          color: 'var(--ink)', fontSize: 22, fontWeight: 400,
        }}>
          {take}
        </p>
      </motion.div>

      <div className="flex gap-3 w-full">
        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
          onClick={() => handleSwipe(false)}
          className="flex-1 rounded-full py-4 font-bold flex items-center justify-center gap-2"
          style={{
            background: 'transparent',
            border: '1.5px solid var(--cranberry)',
            color: 'var(--cranberry)',
          }}
        >
          <X size={16} />
          <span className="font-mono tracking-widest uppercase text-xs">nah</span>
        </motion.button>
        <motion.button
          whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
          onClick={() => handleSwipe(true)}
          className="flex-1 rounded-full py-4 font-bold flex items-center justify-center gap-2"
          style={{
            background: 'var(--sage)',
            color: 'var(--cream)',
            boxShadow: '0 10px 22px -10px var(--sage)',
          }}
        >
          <Check size={16} />
          <span className="font-mono tracking-widest uppercase text-xs">facts</span>
        </motion.button>
      </div>
    </div>
  )
}

export default function GameModal({ currentUser, matchedUser, onBack, onDone }) {
  const [phase, setPhase] = useState('choose')
  const [gameData, setGameData] = useState(null)
  const [loadErr, setLoadErr] = useState(false)

  const startGame = async (game) => {
    setPhase('loading')
    setLoadErr(false)
    try {
      if (game.id === 'trivia') {
        const data = await fetchTrivia(currentUser, matchedUser)
        setGameData(data)
        setPhase('trivia')
      } else {
        const data = await fetchHotTakes(currentUser, matchedUser)
        setGameData(data)
        setPhase('hottakes')
      }
    } catch {
      setLoadErr(true)
      setPhase('choose')
    }
  }

  return (
    <motion.div
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 40% at 50% 30%, rgba(205,138,59,0.18), transparent 70%)' }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-6 pt-6 pb-3 flex-shrink-0">
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={phase === 'choose' ? onBack : () => setPhase('choose')}
          className="flex items-center gap-1.5" style={{ color: 'var(--ink-muted)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">
            {phase === 'choose' ? 'back' : 'games'}
          </span>
        </motion.button>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
          play · together
        </span>
      </div>

      {phase === 'loading' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-9 h-9 rounded-full border-2"
            style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }}
          />
          <p className="italic-serif text-sm" style={{ color: 'var(--ink-muted)' }}>
            claude is crafting your game…
          </p>
        </div>
      )}

      {phase === 'choose' && (
        <div className="relative z-10 flex-1 flex flex-col px-6 gap-7">
          {/* Versus */}
          <div className="flex items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-1.5">
              {currentUser.avatarConfig
                ? <VibeAvatar config={currentUser.avatarConfig} size={52} />
                : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--terracotta)' }} />
              }
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                {currentUser.name}
              </span>
            </div>
            <span className="font-display italic-serif" style={{ color: 'var(--terracotta)', fontSize: 24 }}>vs</span>
            <div className="flex flex-col items-center gap-1.5">
              {matchedUser.avatarConfig
                ? <VibeAvatar config={matchedUser.avatarConfig} size={52} />
                : <div style={{ width: 52, height: 52, borderRadius: '50%', background: matchedUser.avatarColor }} />
              }
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                {matchedUser.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h2 className="font-display text-center"
              style={{
                color: 'var(--ink)',
                fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em',
              }}>
              pick a <span className="italic-serif" style={{ color: 'var(--terracotta)' }}>game</span>
            </h2>
            <p className="italic-serif text-sm" style={{ color: 'var(--ink-muted)' }}>
              each one is generated live for the two of you
            </p>
          </div>

          {loadErr && (
            <p className="text-center text-xs" style={{ color: 'var(--cranberry)' }}>
              couldn't load game — try again
            </p>
          )}

          <div className="flex flex-col gap-3">
            {GAMES.map((game) => (
              <motion.button
                key={game.id}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => startGame(game)}
                className="flex items-center gap-4 rounded-sm p-4 text-left"
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--line)',
                  borderLeft: `3px solid ${game.color}`,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${game.color}18`,
                    border: `1px solid ${game.color}50`,
                    color: game.color,
                  }}
                >
                  <span className="font-mono font-bold text-[10px] tracking-wider uppercase">
                    {game.tag}
                  </span>
                </span>
                <div className="flex flex-col flex-1">
                  <span className="font-display text-lg" style={{ color: 'var(--ink)', fontWeight: 500, lineHeight: 1.1 }}>
                    {game.label}
                  </span>
                  <span className="italic-serif text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {game.desc}
                  </span>
                </div>
                <div className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                  style={{ background: `${game.color}18`, color: game.color }}>
                  claude
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {phase === 'trivia' && gameData?.questions && (
        <div className="relative z-10 flex-1 overflow-y-auto">
          <TriviaGame questions={gameData.questions} onDone={onDone} />
        </div>
      )}

      {phase === 'hottakes' && gameData?.takes && (
        <div className="relative z-10 flex-1 overflow-y-auto">
          <HotTakesGame takes={gameData.takes} matchedUser={matchedUser} onDone={onDone} />
        </div>
      )}
    </motion.div>
  )
}
