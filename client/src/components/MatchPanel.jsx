import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Link2, Gamepad2 } from 'lucide-react'
import { VibeAvatar, GRADIENT_COLORS } from './VibeAvatar'

// Connection types → warm palette tones
const CONNECTION_TYPE_COLORS = {
  'Study Ally':        '#6f8b5e',  // sage
  'Creative Collab':   '#c5532c',  // terracotta
  'Serendipity Clash': '#cd8a3b',  // ochre
  'Energy Sync':       '#e0775a',  // coral
  'Curiosity Bridge':  '#7b3e52',  // plum
}

const STREAK_MILESTONES = [
  { days: 3,  label: '3-day spark', emoji: '·' },
  { days: 7,  label: 'week streak', emoji: '∴' },
  { days: 14, label: 'fortnight',   emoji: '✦' },
  { days: 30, label: 'month vibe',  emoji: '✶' },
]

export default function MatchPanel({ currentUser, matchedUser, matchData, streak = 0, onConnect, onGame, onBack, isLoading }) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!matchData?.score) return
    setDisplayScore(0)
    const target = matchData.score
    const step = 16
    const increment = target / (1500 / step)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setDisplayScore(target); clearInterval(timer) }
      else setDisplayScore(Math.round(current))
    }, step)
    return () => clearInterval(timer)
  }, [matchData?.score])

  const typeColor = CONNECTION_TYPE_COLORS[matchData?.connectionType] || '#c5532c'
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > streak)
  const streakColor = streak >= 14 ? '#a23543' : streak >= 7 ? '#c5532c' : streak >= 3 ? '#cd8a3b' : '#b5a58f'

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Warm ambient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 25%, ${typeColor}18, transparent 65%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-6 pt-6 pb-2 flex-shrink-0">
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--ink-muted)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">back to radar</span>
        </motion.button>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
          match nº{String(Math.abs(matchedUser.id?.charCodeAt(1) || 42)).padStart(3, '0')}
        </span>
      </div>

      {isLoading ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="w-8 h-8 rounded-full border-2"
            style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }}
          />
          <p className="italic-serif text-sm" style={{ color: 'var(--ink-muted)' }}>
            claude is reading the room…
          </p>
        </div>
      ) : matchData ? (
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-6">

          {/* Streak banner */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg px-4 py-3"
              style={{
                background: `${streakColor}12`,
                border: `1px solid ${streakColor}40`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="font-mono text-xs font-bold tabular-nums" style={{ color: streakColor }}>
                  ━━ {streak}d
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold" style={{ color: streakColor }}>
                    streak with {matchedUser.name.split(' ')[0]}
                  </span>
                  {nextMilestone && (
                    <span className="italic-serif text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                      {nextMilestone.days - streak}d until {nextMilestone.label}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-display text-3xl tabular-nums" style={{ color: streakColor, fontWeight: 400, lineHeight: 1 }}>
                {streak}
              </span>
            </motion.div>
          )}

          {/* Avatar pair */}
          <div className="flex items-center justify-center gap-5 py-2">
            <div className="flex flex-col items-center gap-1.5">
              {currentUser.avatarConfig
                ? <VibeAvatar config={currentUser.avatarConfig} size={60} />
                : <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: currentUser.avatarColor || 'var(--terracotta)', color: 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18,
                  }}>
                    {currentUser.avatar || 'Y'}
                  </div>
              }
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                {currentUser.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1 h-1 rounded-full"
                  style={{ background: typeColor }}
                />
              ))}
              <Link2 size={13} style={{ color: typeColor, margin: '0 3px' }} />
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: (4 - i) * 0.2 }}
                  className="w-1 h-1 rounded-full"
                  style={{ background: typeColor }}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-1.5">
              {matchedUser.avatarConfig
                ? <VibeAvatar config={matchedUser.avatarConfig} size={60} />
                : <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: matchedUser.avatarColor, color: 'var(--cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 18,
                  }}>
                    {matchedUser.avatar}
                  </div>
              }
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                {matchedUser.name}
              </span>
            </div>
          </div>

          {/* Score — editorial */}
          <div className="flex flex-col items-center">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--ink-muted)' }}>
              vibe score
            </span>
            <div
              className="font-display tabular-nums"
              style={{
                color: typeColor,
                fontSize: 140,
                fontWeight: 300,
                lineHeight: 0.85,
                letterSpacing: '-0.06em',
                fontVariationSettings: "'SOFT' 100, 'opsz' 144",
              }}
            >
              {displayScore}
            </div>
            <div className="mt-2 px-3 py-1 rounded-full"
              style={{ background: `${typeColor}14`, border: `1px solid ${typeColor}40` }}>
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: typeColor }}>
                {matchData.connectionType}
              </span>
            </div>
            <p className="font-display text-center mt-3 max-w-sm italic-serif"
              style={{ color: 'var(--ink)', fontSize: 20, lineHeight: 1.3, fontWeight: 400 }}>
              "{matchData.scoreLine}"
            </p>
          </div>

          {/* Crossover — feature block */}
          <div
            className="rounded-lg p-5 relative"
            style={{
              background: 'var(--cream)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="absolute top-0 left-5 -translate-y-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: 'var(--paper)', border: `1px solid ${typeColor}40` }}>
              <Zap size={10} style={{ color: typeColor }} />
              <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: typeColor }}>
                the connection
              </span>
            </div>
            <p className="text-sm leading-relaxed italic-serif pt-1" style={{ color: 'var(--ink-soft)' }}>
              {matchData.crossover}
            </p>
          </div>

          {/* Hooks */}
          <div className="flex flex-col gap-1.5">
            {matchData.hooks?.map((hook, i) => (
              <div key={i} className="flex items-start gap-3 py-2 px-3"
                style={{
                  background: 'transparent',
                  borderLeft: `2px solid ${typeColor}`,
                }}>
                <span className="font-mono text-[10px] font-bold tabular-nums" style={{ color: typeColor }}>
                  0{i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                  {hook}
                </span>
              </div>
            ))}
          </div>

          {/* Their vibe — callout */}
          <div
            className="rounded-lg p-4"
            style={{
              background: 'var(--paper-tint)',
              border: `1px dashed ${matchedUser.avatarColor || typeColor}50`,
            }}
          >
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: matchedUser.avatarColor || typeColor }}>
              {matchedUser.name.toLowerCase()}'s vibe
            </span>
            <p className="text-base mt-1 italic-serif leading-snug" style={{ color: 'var(--ink)' }}>
              "{matchedUser.vibe}"
            </p>
            <p className="font-mono text-[10px] tracking-wider uppercase mt-2" style={{ color: 'var(--ink-muted)' }}>
              {matchedUser.distance}ft away · {matchedUser.major}, {matchedUser.year}
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => onConnect(matchedUser, matchData)}
              className="w-full rounded-full py-4 font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                boxShadow: `0 14px 28px -12px ${typeColor}aa, 0 2px 0 var(--ink-soft)`,
              }}
            >
              <span className="font-mono tracking-widest uppercase">connect</span>
              <span style={{ color: typeColor, fontSize: 12 }}>—</span>
              <span className="italic-serif font-normal">get the icebreaker</span>
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => onGame(matchedUser, matchData)}
              className="w-full rounded-full py-3 font-semibold text-sm flex items-center justify-center gap-2"
              style={{
                background: 'var(--cream)',
                color: 'var(--ink)',
                border: '1.5px solid var(--line-strong)',
              }}
            >
              <Gamepad2 size={14} style={{ color: 'var(--ochre)' }} />
              <span>play a game instead</span>
            </motion.button>
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}
