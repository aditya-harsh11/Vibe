import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import DuoProof from './DuoProof'
import { VibeAvatar } from './VibeAvatar'

export default function IcebreakerModal({ currentUser, matchedUser, matchScore, connectionType, onBack }) {
  const [phase, setPhase] = useState('loading')
  const [icebreaker, setIcebreaker] = useState('')
  const [streamDone, setStreamDone] = useState(false)
  const abortRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    const run = async () => {
      try {
        const response = await fetch('/api/claude/icebreaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentUser, matchedUser, matchScore, connectionType }),
          signal: controller.signal,
        })

        setPhase('icebreaker')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const raw = decoder.decode(value, { stream: true })
          const lines = raw.split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') { setStreamDone(true); return }
            setIcebreaker(prev => prev + data.replace(/\\n/g, '\n'))
          }
        }
        setStreamDone(true)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIcebreaker("Looks like you two are both here for a reason — ask them about their project. That's always the right move.")
          setStreamDone(true)
          setPhase('icebreaker')
        }
      }
    }

    run()
    return () => controller.abort()
  }, [])

  if (phase === 'camera') {
    return (
      <DuoProof
        currentUser={currentUser}
        matchedUser={matchedUser}
        matchScore={matchScore}
        onBack={() => setPhase('icebreaker')}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'var(--paper)' }}
    >
      {/* Warm wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 30%, rgba(205,138,59,0.22), transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-3 flex-shrink-0">
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1.5"
          style={{ color: 'var(--ink-muted)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">back</span>
        </motion.button>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
          icebreaker · the opener
        </span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-8">
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2"
              style={{ borderColor: 'var(--terracotta)', borderTopColor: 'transparent' }}
            />
            <p className="italic-serif text-sm" style={{ color: 'var(--ink-muted)' }}>
              claude is crafting your opener…
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {phase === 'icebreaker' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-8 w-full max-w-md"
            >
              {/* Matched user */}
              <div className="flex flex-col items-center gap-2">
                {matchedUser.avatarConfig
                  ? <VibeAvatar config={matchedUser.avatarConfig} size={72} />
                  : <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: matchedUser.avatarColor, color: 'var(--cream)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 22,
                    }}>{matchedUser.avatar}</div>
                }
                <p className="font-display text-lg" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                  {matchedUser.name}
                </p>
                <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--ink-muted)' }}>
                  {matchedUser.distance}ft away · score {matchScore}
                </p>
              </div>

              {/* Instruction + quote */}
              <div className="w-full flex flex-col items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--terracotta)' }}>
                  &#x2014; walk up &amp; say &#x2014;
                </span>

                <div
                  className="relative w-full rounded-sm p-6"
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--line)',
                    borderLeft: '3px solid var(--terracotta)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {/* Pull-quote marks */}
                  <span className="font-display absolute top-2 left-4" style={{ fontSize: 40, color: 'var(--terracotta)', lineHeight: 1, opacity: 0.35 }}>
                    &ldquo;
                  </span>
                  <p
                    className="font-display leading-snug pl-4"
                    style={{
                      color: 'var(--ink)',
                      fontSize: 22,
                      fontWeight: 400,
                      fontVariationSettings: "'SOFT' 80, 'opsz' 36",
                    }}
                  >
                    {icebreaker}
                    {!streamDone && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block ml-0.5 align-middle"
                        style={{ background: 'var(--terracotta)', width: 2, height: 22 }}
                      />
                    )}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {streamDone && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setPhase('camera')}
                    className="w-full rounded-full py-4 font-bold text-sm flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--ink)',
                      color: 'var(--cream)',
                      boxShadow: '0 14px 28px -12px rgba(197,83,44,0.55), 0 2px 0 var(--ink-soft)',
                    }}
                  >
                    <Camera size={16} />
                    <span className="font-mono tracking-widest uppercase">capture duo proof</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
