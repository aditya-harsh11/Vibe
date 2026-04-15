import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Send, Clock } from 'lucide-react'

const PLACEHOLDER_VIBES = [
  'just got out of class and my brain is offline — pull me to chipotle',
  '70 degrees on the terrace and i refuse to be productive today',
  'new album dropped and i am emotionally unwell, need a walking buddy',
  'craving a specific kind of chaos — willing to negotiate',
  'badgers game tonight, trying to rally a crew',
]

function getWindowInfo() {
  const now = new Date()
  const totalMins = now.getHours() * 60 + now.getMinutes()
  const windowStart = 9 * 60
  const windowSize = 120
  const elapsed = ((totalMins - windowStart) % windowSize + windowSize) % windowSize
  const remaining = windowSize - elapsed
  const windowNum = Math.floor(((totalMins - windowStart) % (24 * 60) + (24 * 60)) % (24 * 60) / windowSize)
  const windowStartHour = (9 + windowNum * 2) % 24
  const windowEndHour = (windowStartHour + 2) % 24
  const fmt = (h) => `${h % 12 || 12}${h >= 12 ? 'pm' : 'am'}`
  return {
    remainingMins: remaining,
    remainingSecs: remaining * 60,
    windowLabel: `${fmt(windowStartHour)}–${fmt(windowEndHour)}`,
    isOpen: true,
  }
}

export default function DailyPulse({ currentUser, onVibePost }) {
  const [text, setText] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_VIBES[0])
  const [windowInfo] = useState(getWindowInfo())
  const [windowSecsLeft, setWindowSecsLeft] = useState(getWindowInfo().remainingSecs)

  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      i = (i + 1) % PLACEHOLDER_VIBES.length
      setPlaceholder(PLACEHOLDER_VIBES[i])
    }, 2800)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setWindowSecsLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(iv)
  }, [])

  const handleEnhance = async () => {
    if (!text.trim()) return
    setIsEnhancing(true)
    try {
      const res = await fetch('/api/claude/pulse-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftVibe: text }),
      })
      const data = await res.json()
      if (data.enhanced) setText(data.enhanced)
    } catch (e) { console.error(e) }
    finally { setIsEnhancing(false) }
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    onVibePost(text.trim())
  }

  const winH = Math.floor(windowSecsLeft / 3600)
  const winM = String(Math.floor((windowSecsLeft % 3600) / 60)).padStart(2, '0')
  const winS = String(windowSecsLeft % 60).padStart(2, '0')
  const windowTotal = windowInfo.remainingMins * 60
  const windowProgress = windowSecsLeft / windowTotal
  const windowUrgent = windowSecsLeft < 600

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Warm radial glow — sunrise through window */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 18% 20%, rgba(224,119,90,0.22), transparent 65%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(205,138,59,0.15), transparent 60%)',
        }}
      />

      {/* Decorative folio marks — top-left issue number */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-0.5" style={{ color: 'var(--ink-muted)' }}>
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase">vibe · issue nº{Math.floor(Math.random() * 900) + 100}</span>
        <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'var(--ink-whisper)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase()}
        </span>
      </div>

      {/* Window clock — top right */}
      <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-1">
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: windowUrgent ? 'rgba(162,53,67,0.1)' : 'rgba(197,83,44,0.08)',
            border: `1px solid ${windowUrgent ? 'rgba(162,53,67,0.35)' : 'rgba(197,83,44,0.25)'}`,
          }}
        >
          <Clock size={11} style={{ color: windowUrgent ? 'var(--cranberry)' : 'var(--terracotta)' }} />
          <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: windowUrgent ? 'var(--cranberry)' : 'var(--terracotta)' }}>
            {winH > 0 ? `${winH}:` : ''}{winM}:{winS}
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--ink-whisper)' }}>
          window · {windowInfo.windowLabel}
        </span>
      </div>

      {/* Main content — centered, editorial layout */}
      <div className="flex-1 flex items-center justify-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
          className="w-full max-w-lg flex flex-col gap-10"
        >
          {/* Masthead */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', damping: 14 }}
              className="flex items-center justify-center"
              style={{
                width: 56, height: 56,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, var(--ochre-l), var(--terracotta) 70%, var(--sienna))',
                boxShadow: '0 8px 28px rgba(197,83,44,0.35), inset 0 -4px 12px rgba(163,64,31,0.5), inset 0 2px 8px rgba(255,248,234,0.35)',
              }}
            >
              <span style={{ color: 'var(--cream)', fontSize: 22, fontWeight: 900, lineHeight: 1 }}>◉</span>
            </motion.div>

            <h1
              className="font-display text-center"
              style={{
                color: 'var(--ink)',
                fontSize: 'clamp(56px, 12vw, 96px)',
                fontWeight: 500,
                lineHeight: 0.92,
                letterSpacing: '-0.04em',
                fontVariationSettings: "'SOFT' 100, 'opsz' 144",
              }}
            >
              what's your
              <br />
              <span className="italic-serif" style={{ color: 'var(--terracotta)', fontWeight: 400 }}>vibe</span>
              <span style={{ color: 'var(--ink-whisper)' }}>?</span>
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span
                className="font-mono text-[10px] tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: 'var(--paper-tint)',
                  border: '1px solid var(--line-strong)',
                  color: 'var(--sienna)',
                }}
              >
                2-hour window
              </span>
              <span className="text-xs italic-serif" style={{ color: 'var(--ink-muted)' }}>
                post now or miss the room
              </span>
            </div>
          </div>

          {/* Textarea — large editorial input */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--ink-muted)' }}>
                &#x2014; your pulse
              </span>
              <span className="font-mono text-[10px] tabular-nums" style={{ color: text.length > 120 ? 'var(--cranberry)' : 'var(--ink-whisper)' }}>
                {text.length} / 140
              </span>
            </div>

            <textarea
              className="w-full p-5 text-lg font-medium resize-none outline-none rounded-sm transition-colors"
              style={{
                background: 'var(--cream)',
                color: 'var(--ink)',
                border: '1px solid var(--line-strong)',
                borderBottom: '3px solid var(--terracotta)',
                minHeight: 120,
                fontFamily: "'Fraunces', serif",
                fontVariationSettings: "'SOFT' 50, 'opsz' 28",
                lineHeight: 1.35,
                boxShadow: 'inset 0 1px 2px rgba(60,36,18,0.05)',
              }}
              placeholder={placeholder}
              value={text}
              onChange={e => setText(e.target.value.slice(0, 140))}
            />

            {/* Ambient window progress — under textarea, like a printer's mark */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--paper-sunk)' }}>
                <motion.div
                  className="h-full"
                  style={{
                    width: `${windowProgress * 100}%`,
                    background: windowUrgent
                      ? 'linear-gradient(90deg, var(--cranberry), var(--coral))'
                      : 'linear-gradient(90deg, var(--terracotta), var(--ochre))',
                    transition: 'width 1s linear',
                  }}
                />
              </div>
              <span className="font-mono text-[10px] tracking-wider uppercase flex-shrink-0" style={{ color: 'var(--ink-muted)' }}>
                342 posted · {windowUrgent ? 'closing soon' : 'window open'}
              </span>
            </div>
          </div>

          {/* Actions — side-by-side, refined */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={handleEnhance}
              disabled={isEnhancing || !text.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-opacity"
              style={{
                background: 'transparent',
                color: 'var(--ink)',
                border: '1.5px solid var(--ink)',
                opacity: !text.trim() ? 0.35 : 1,
              }}
            >
              <Sparkles size={14} strokeWidth={2.3} />
              {isEnhancing ? 'sharpening…' : 'sharpen with claude'}
            </motion.button>

            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !text.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all"
              style={{
                background: text.trim() ? 'var(--ink)' : 'var(--paper-sunk)',
                color: text.trim() ? 'var(--cream)' : 'var(--ink-whisper)',
                boxShadow: text.trim() ? '0 10px 28px -10px rgba(31,23,18,0.5)' : 'none',
                cursor: text.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={14} strokeWidth={2.3} />
              {isSubmitting ? 'posting…' : 'post & unlock radar'}
            </motion.button>
          </div>

          <p className="text-xs text-center italic-serif" style={{ color: 'var(--ink-muted)', lineHeight: 1.6 }}>
            your vibe is live for this 2-hour window.
            <br />
            next window resets automatically.
          </p>
        </motion.div>
      </div>

      {/* Bottom tagline / footer mark */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--line)' }}>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
          everyone, or no one
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
          {currentUser?.name ? `hi, ${currentUser.name.toLowerCase()}` : 'room 2023'}
        </span>
      </div>
    </div>
  )
}
