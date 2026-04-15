import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Shuffle } from 'lucide-react'
import { VibeAvatar, DEFAULT_AVATAR, buildAvatarUrl } from './VibeAvatar'

const ACCESSORIES = ['none', 'headphones', 'glasses', 'cap', 'star']
const ACCESSORY_LABELS = { none: '—', headphones: 'hph', glasses: 'gls', cap: 'cap', star: 'shd' }

// Warm editorial palette — each "aura" is a hand-tuned color family
const AURAS = [
  { name: 'terracotta',  primary: '#c5532c', tone: '#e8a488', label: 'clay' },
  { name: 'ochre',       primary: '#cd8a3b', tone: '#eec89b', label: 'honey' },
  { name: 'sage',        primary: '#6f8b5e', tone: '#b9cfa6', label: 'sage' },
  { name: 'cranberry',   primary: '#a23543', tone: '#d98a8e', label: 'rose' },
  { name: 'plum',        primary: '#7b3e52', tone: '#b889a0', label: 'plum' },
  { name: 'coral',       primary: '#e0775a', tone: '#f1b8aa', label: 'coral' },
  { name: 'olive',       primary: '#8a7a3a', tone: '#c9bd87', label: 'olive' },
  { name: 'clay-deep',   primary: '#8d3a1d', tone: '#c68466', label: 'rust' },
]

const makeSeeds = () => {
  const base = Math.random().toString(36).slice(2, 8)
  return Array.from({ length: 8 }, (_, i) => `${base}-${i}`)
}

export default function AvatarBuilder({ onDone }) {
  const [seeds, setSeeds] = useState(() => makeSeeds())
  const [config, setConfig] = useState({ ...DEFAULT_AVATAR, seed: seeds[0] })
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)

  const set = (key, val) => setConfig(c => ({ ...c, [key]: val }))
  const reshuffle = () => {
    const next = makeSeeds()
    setSeeds(next)
    setConfig(c => ({ ...c, seed: next[0] }))
  }

  const handleDone = () => onDone({ config, name: name.trim() || 'You' })

  const STEPS = [
    { n: '01', label: 'choose your likeness', sub: 'tap one. shuffle for more.' },
    { n: '02', label: 'pick your aura', sub: 'your glow on the radar' },
    { n: '03', label: 'one accessory', sub: 'optional flex' },
    { n: '04', label: 'and your name', sub: 'shown when you connect' },
  ]

  const aura = AURAS[config.bgIndex ?? 0]

  return (
    <div
      className="w-full h-full flex flex-col relative overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Ambient aura wash */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(ellipse 65% 50% at 50% 48%, ${aura.primary}22, transparent 65%)`,
        }}
      />

      {/* Folio */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
            style={{
              background: 'radial-gradient(circle at 35% 35%, var(--ochre-l), var(--terracotta))',
              color: 'var(--cream)',
            }}
          >
            ◉
          </div>
          <span className="font-display text-lg" style={{ color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.02em' }}>
            vibe
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-muted)' }}>
          step {STEPS[step].n} / 04
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          {/* Step title — editorial */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-1 text-center"
            >
              <h2
                className="font-display"
                style={{
                  color: 'var(--ink)',
                  fontSize: 'clamp(32px, 6vw, 44px)',
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}
              >
                {STEPS[step].label.split(' ').map((word, i) => (
                  <span key={i}>
                    {i === 1 ? <span className="italic-serif" style={{ color: aura.primary }}>{word}</span> : word}
                    {i < STEPS[step].label.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h2>
              <p className="italic-serif text-sm" style={{ color: 'var(--ink-muted)' }}>
                {STEPS[step].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Avatar preview */}
          <motion.div
            key={`${config.seed}-${config.bgIndex}-${config.accessory}`}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14 }}
          >
            <VibeAvatar config={config} size={130} />
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="face"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-3"
              >
                <div className="grid grid-cols-4 gap-2.5">
                  {seeds.map((s) => {
                    const selected = config.seed === s
                    return (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }}
                        onClick={() => set('seed', s)}
                        className="flex items-center justify-center p-1.5 transition-all"
                        style={{
                          background: selected ? 'var(--cream)' : 'var(--paper-raised)',
                          border: selected
                            ? `2px solid ${aura.primary}`
                            : '1px solid var(--line)',
                          borderRadius: 12,
                          boxShadow: selected ? `0 6px 20px -6px ${aura.primary}55` : 'none',
                        }}
                      >
                        <img
                          src={buildAvatarUrl({ ...config, seed: s }, 64)}
                          alt="variant" draggable={false}
                          style={{ width: 52, height: 52, borderRadius: '50%', display: 'block' }}
                        />
                      </motion.button>
                    )
                  })}
                </div>
                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={reshuffle}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--line-strong)',
                    color: 'var(--ink-soft)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <Shuffle size={12} /> shuffle variants
                </motion.button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="aura"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full"
              >
                <div className="grid grid-cols-4 gap-3">
                  {AURAS.map((a, i) => (
                    <motion.button
                      key={a.name}
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => set('bgIndex', i)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                      style={{
                        background: config.bgIndex === i ? 'var(--cream)' : 'transparent',
                        border: config.bgIndex === i
                          ? `2px solid ${a.primary}`
                          : '1px solid var(--line)',
                      }}
                    >
                      <div
                        className="w-full"
                        style={{
                          height: 40,
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${a.tone} 0%, ${a.primary} 100%)`,
                          boxShadow: config.bgIndex === i ? `0 6px 16px -6px ${a.primary}` : 'none',
                        }}
                      />
                      <span className="font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                        {a.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="accessory"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex gap-2 justify-center flex-wrap"
              >
                {ACCESSORIES.map((acc) => (
                  <motion.button
                    key={acc}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }}
                    onClick={() => set('accessory', acc)}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: config.accessory === acc ? 'var(--cream)' : 'transparent',
                      border: config.accessory === acc
                        ? `2px solid ${aura.primary}`
                        : '1px solid var(--line)',
                      minWidth: 62,
                    }}
                  >
                    <span className="font-mono text-xs font-bold tracking-wider" style={{ color: config.accessory === acc ? aura.primary : 'var(--ink-soft)' }}>
                      {ACCESSORY_LABELS[acc]}
                    </span>
                    <span className="text-[10px] lowercase" style={{ color: 'var(--ink-muted)' }}>
                      {acc === 'none' ? 'clean' : acc}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="name"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-2"
              >
                <input
                  autoFocus type="text" maxLength={20}
                  placeholder="your name…"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-4 text-2xl font-display text-center outline-none"
                  style={{
                    background: 'var(--cream)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line-strong)',
                    borderBottom: `3px solid ${aura.primary}`,
                    borderRadius: 4,
                    fontVariationSettings: "'SOFT' 80, 'opsz' 48",
                    letterSpacing: '-0.02em',
                  }}
                />
                <p className="font-mono text-[10px] tracking-widest uppercase text-center mt-1" style={{ color: 'var(--ink-whisper)' }}>
                  shown when you connect
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav */}
          <div className="flex gap-3 w-full">
            {step > 0 && (
              <motion.button
                whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-full text-sm font-semibold"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line-strong)',
                  color: 'var(--ink-muted)',
                }}
              >
                back
              </motion.button>
            )}
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => step < 3 ? setStep(s => s + 1) : handleDone()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold"
              style={{
                background: 'var(--ink)',
                color: 'var(--cream)',
                boxShadow: `0 10px 28px -10px ${aura.primary}, 0 2px 0 var(--ink-soft)`,
              }}
            >
              {step < 3 ? (<>continue <ChevronRight size={14} /></>) : (<>enter vibe ◉</>)}
            </motion.button>
          </div>

          {/* Step indicator */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className="rounded-full transition-all"
                style={{
                  width: i === step ? 24 : 6, height: 6,
                  background: i === step ? aura.primary : i < step ? 'var(--ink-whisper)' : 'var(--line-strong)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
