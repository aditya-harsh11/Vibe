import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Check, ShieldCheck, Users } from 'lucide-react'
import { VibeAvatar } from './VibeAvatar'

export default function CameraGate({ currentUser, matchedUser, onVerified, onBack }) {
  const videoRef = useRef(null)
  const [state, setState] = useState('loading')
  const [err, setErr] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let stream = null
    let cancelled = false
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }, audio: false,
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setState('streaming')
      } catch (e) {
        setErr(e.message || 'camera access denied')
        setState('error')
      }
    }
    start()
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (state !== 'scanning') return
    const start = Date.now()
    const duration = 2400
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration)
      setProgress(p)
      if (p < 1) requestAnimationFrame(tick)
      else setState('verified')
    }
    requestAnimationFrame(tick)
  }, [state])

  useEffect(() => {
    if (state !== 'verified') return
    const t = setTimeout(() => onVerified(), 900)
    return () => clearTimeout(t)
  }, [state, onVerified])

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Live video with warm sepia wash */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: 'scaleX(-1)',
          filter: state === 'error'
            ? 'brightness(0.3) sepia(0.4)'
            : 'brightness(0.9) contrast(1.05) sepia(0.18) saturate(1.1)',
        }}
      />

      {/* Warm vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(247,239,225,0.15) 30%, rgba(31,23,18,0.55) 100%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-6 pt-6 pb-4 flex-shrink-0">
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1.5"
          style={{ color: 'var(--cream)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">back</span>
        </motion.button>
        <div className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{ background: 'rgba(255,248,234,0.9)', border: '1px solid var(--sage)' }}>
          <ShieldCheck size={11} style={{ color: 'var(--sage)' }} />
          <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--sage)' }}>
            irl check
          </span>
        </div>
      </div>

      {/* Avatar pair */}
      <div className="relative z-10 flex items-center justify-center gap-4 px-6 pb-3">
        <div className="flex flex-col items-center gap-1">
          <VibeAvatar config={currentUser.avatarConfig} size={52} />
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--cream)' }}>
            {currentUser.name.split(' ')[0]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              className="w-1 h-1 rounded-full"
              style={{ background: 'var(--cream)' }}
            />
          ))}
          <Users size={13} style={{ color: 'var(--cream)', margin: '0 3px' }} />
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: (2 - i) * 0.2 }}
              className="w-1 h-1 rounded-full"
              style={{ background: 'var(--cream)' }}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-1">
          <VibeAvatar config={matchedUser.avatarConfig} size={52} />
          <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--cream)' }}>
            {matchedUser.name.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Face-detection rings */}
      <div className="relative z-10 flex-1 flex items-center justify-center gap-8 px-8">
        <FaceTarget
          label={currentUser.name.split(' ')[0]}
          active={state === 'scanning' || state === 'verified'}
          verified={state === 'verified'}
          color="#c5532c"
        />
        <FaceTarget
          label={matchedUser.name.split(' ')[0]}
          active={state === 'scanning' || state === 'verified'}
          verified={state === 'verified'}
          color="#7b3e52"
          delay={0.3}
        />
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-8 pt-4 flex-shrink-0 flex flex-col items-center gap-4">
        {state === 'loading' && (
          <p className="italic-serif text-sm" style={{ color: 'var(--cream)' }}>
            opening camera…
          </p>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center gap-3">
            <p className="italic-serif text-sm" style={{ color: 'var(--coral)' }}>
              camera blocked — {err}
            </p>
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={onVerified}
              className="rounded-full px-6 py-3 font-mono text-xs tracking-widest uppercase"
              style={{ background: 'var(--ink)', color: 'var(--cream)' }}
            >
              skip for demo
            </motion.button>
          </div>
        )}

        {state === 'streaming' && (
          <>
            <p className="font-display text-center max-w-xs italic-serif"
              style={{ color: 'var(--cream)', fontSize: 18, lineHeight: 1.3 }}>
              both of you need to be <span style={{ color: 'var(--ochre)' }}>in frame</span> to start the game
            </p>
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => setState('scanning')}
              className="flex items-center gap-2 rounded-full px-6 py-3.5"
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                boxShadow: '0 14px 28px -12px rgba(197,83,44,0.6), 0 2px 0 var(--ink-soft)',
              }}
            >
              <Camera size={15} />
              <span className="font-mono text-[11px] tracking-widest uppercase">we're together — verify</span>
            </motion.button>
          </>
        )}

        {state === 'scanning' && (
          <div className="w-full max-w-xs flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-3.5 h-3.5 rounded-full border-2"
                style={{ borderColor: 'var(--ochre)', borderTopColor: 'transparent' }}
              />
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--ochre)' }}>
                verifying co-presence…
              </p>
            </div>
            <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,248,234,0.2)' }}>
              <div
                className="h-full"
                style={{
                  width: `${progress * 100}%`,
                  background: 'linear-gradient(90deg, var(--ochre), var(--terracotta))',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
          </div>
        )}

        {state === 'verified' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 rounded-full px-5 py-2.5"
            style={{
              background: 'var(--sage)',
              boxShadow: '0 0 30px rgba(111,139,94,0.6)',
            }}
          >
            <Check size={14} color="#fff8ea" />
            <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--cream)' }}>
              verified — loading game
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function FaceTarget({ label, active, verified, color, delay = 0 }) {
  const activeColor = verified ? '#6f8b5e' : color
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative flex flex-col items-center gap-2"
    >
      <div
        className="relative"
        style={{
          width: 140,
          height: 180,
          border: `2px dashed ${activeColor}`,
          borderRadius: '50% 50% 50% 50% / 42% 42% 58% 58%',
          boxShadow: active ? `0 0 24px ${activeColor}70` : 'none',
          transition: 'all 0.3s',
        }}
      >
        {active && !verified && (
          <motion.div
            animate={{ y: [0, 160, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute left-2 right-2 h-[2px] rounded-full"
            style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          />
        )}
        {verified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 44, height: 44, background: 'var(--sage)', boxShadow: '0 0 20px rgba(111,139,94,0.7)' }}
            >
              <Check size={24} color="#fff8ea" strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </div>
      <span className="font-mono text-[10px] font-bold tracking-widest uppercase"
        style={{ color: activeColor }}>
        {label}
      </span>
    </motion.div>
  )
}
