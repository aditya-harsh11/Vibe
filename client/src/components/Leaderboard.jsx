import { motion } from 'framer-motion'
import { ArrowLeft, Zap, Star, Camera } from 'lucide-react'
import { VibeAvatar, GRADIENT_COLORS } from './VibeAvatar'

const LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma',  avatarConfig: { seed: 'priya-sharma-02',  bgIndex: 2, accessory: 'star' },
    major: 'Marketing',            year: 'Senior',    xp: 3840, connections: 14, duoProofs: 9, streak: 12, badge: '✦ top connector' },
  { rank: 2, name: 'Alex Torres',   avatarConfig: { seed: 'alex-torres-05',   bgIndex: 5, accessory: 'glasses' },
    major: 'Economics',            year: 'Senior',    xp: 3210, connections: 11, duoProofs: 8, streak: 10, badge: '✶ good hang' },
  { rank: 3, name: 'Jordan Park',   avatarConfig: { seed: 'jordan-park-01',   bgIndex: 1, accessory: 'cap' },
    major: 'Kinesiology',          year: 'Sophomore', xp: 2750, connections: 9,  duoProofs: 7, streak: 8,  badge: '∴ energy sync' },
  { rank: 4, name: 'Maya Chen',     avatarConfig: { seed: 'maya-chen-00',     bgIndex: 0, accessory: 'glasses' },
    major: 'Film Studies',         year: 'Junior',    xp: 2300, connections: 8,  duoProofs: 5, streak: 7,  badge: null },
  { rank: 5, name: 'Devon Walsh',   avatarConfig: { seed: 'devon-walsh-04',   bgIndex: 7, accessory: 'star' },
    major: 'Graphic Design',       year: 'Sophomore', xp: 1980, connections: 7,  duoProofs: 6, streak: 5,  badge: null },
  { rank: 6, name: 'Sam Liu',       avatarConfig: { seed: 'sam-liu-07',       bgIndex: 4, accessory: 'headphones' },
    major: 'Music Production',     year: 'Freshman',  xp: 1640, connections: 6,  duoProofs: 4, streak: 6,  badge: null },
  { rank: 7, name: 'Riley Kim',     avatarConfig: { seed: 'riley-kim-06',     bgIndex: 6, accessory: 'none' },
    major: 'Psychology',           year: 'Junior',    xp: 1420, connections: 5,  duoProofs: 3, streak: 4,  badge: null },
  { rank: 8, name: 'Nico Reyes',    avatarConfig: { seed: 'nico-reyes-03',    bgIndex: 3, accessory: 'none' },
    major: 'English Lit',          year: 'Junior',    xp: 1100, connections: 4,  duoProofs: 2, streak: 3,  badge: null },
]

const ME = {
  rank: 24, name: 'You', avatarConfig: { seed: 'aditya-me-00', bgIndex: 0, accessory: 'none' },
  major: 'Computer Science', year: 'Junior',
  xp: 250, connections: 1, duoProofs: 0, streak: 1,
}

const REWARDS = [
  { rank: 'i',    reward: '$20 dining credit',   partner: 'campus market',   color: '#c5532c', bg: 'rgba(197,83,44,0.10)' },
  { rank: 'ii',   reward: '$10 dining credit',   partner: 'campus market',   color: '#cd8a3b', bg: 'rgba(205,138,59,0.10)' },
  { rank: 'iii',  reward: 'free coffee · any café', partner: 'campus cafés', color: '#6f8b5e', bg: 'rgba(111,139,94,0.10)' },
  { rank: 'top 10', reward: 'vibe pro + 500 xp', partner: 'vibe',            color: '#7b3e52', bg: 'rgba(123,62,82,0.10)' },
]

function XpBar({ xp, max = 4000, color = '#c5532c' }) {
  return (
    <div className="w-full h-[2px] overflow-hidden" style={{ background: 'rgba(31,23,18,0.08)' }}>
      <div
        className="h-full"
        style={{
          width: `${Math.min((xp / max) * 100, 100)}%`,
          background: color,
          transition: 'width 1s ease',
        }}
      />
    </div>
  )
}

export default function Leaderboard({ onBack }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute inset-0 z-40 flex flex-col overflow-hidden"
      style={{ background: 'var(--paper)' }}
    >
      {/* Warm header wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(205,138,59,0.16), transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4"
        style={{ borderBottom: '1px solid var(--line)' }}>
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1.5"
          style={{ color: 'var(--ink-muted)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">back</span>
        </motion.button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
            the social board
          </span>
          <span className="font-display italic-serif" style={{ color: 'var(--ink)', fontSize: 20, fontWeight: 500 }}>
            this week
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--ink-muted)' }}>
          resets mon
        </span>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto">
        {/* Rewards */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--terracotta)' }}>
              weekly rewards
            </span>
            <span className="italic-serif text-xs" style={{ color: 'var(--ink-muted)' }}>
              · campus market partnership
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {REWARDS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-sm p-3 flex flex-col gap-0.5"
                style={{
                  background: r.bg,
                  border: `1px solid ${r.color}40`,
                  borderLeft: `3px solid ${r.color}`,
                }}
              >
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: r.color }}>
                  {r.rank}
                </span>
                <span className="font-display text-sm leading-tight" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                  {r.reward}
                </span>
                <span className="italic-serif text-[11px]" style={{ color: 'var(--ink-muted)' }}>{r.partner}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* XP legend */}
        <div className="flex items-center gap-4 px-6 py-3"
          style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
            <Zap size={10} style={{ color: 'var(--terracotta)' }} /> connect · 250
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
            <Camera size={10} style={{ color: 'var(--plum)' }} /> proof · 100
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
            <Star size={10} style={{ color: 'var(--ochre)' }} /> streak
          </div>
        </div>

        {/* Rankings */}
        <div className="flex flex-col px-6 py-4 gap-2">
          {LEADERBOARD.map((person, i) => {
            const accent = GRADIENT_COLORS[person.avatarConfig.bgIndex]
            const isTop = person.rank <= 3
            return (
              <motion.div
                key={person.rank}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.1 }}
                className="flex items-center gap-3 rounded-sm p-3"
                style={{
                  background: isTop ? 'var(--cream)' : 'transparent',
                  border: isTop ? `1px solid ${accent}40` : '1px solid var(--line)',
                  borderLeft: isTop ? `3px solid ${accent}` : '1px solid var(--line)',
                  boxShadow: isTop ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {/* Rank */}
                <span
                  className="font-display tabular-nums w-7 text-center flex-shrink-0"
                  style={{
                    color: isTop ? accent : 'var(--ink-muted)',
                    fontSize: isTop ? 22 : 16,
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {person.rank}
                </span>

                <VibeAvatar config={person.avatarConfig} size={40} ring={false} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-display text-sm truncate" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                      {person.name}
                    </span>
                    {person.badge && (
                      <span className="italic-serif text-[11px] flex-shrink-0" style={{ color: accent }}>
                        {person.badge}
                      </span>
                    )}
                  </div>
                  <XpBar xp={person.xp} color={accent} />
                  <div className="flex gap-2 mt-1 font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                    <span>{person.connections} connects</span>
                    <span>·</span>
                    <span>{person.duoProofs} proofs</span>
                    <span>·</span>
                    <span>{person.streak}d streak</span>
                  </div>
                </div>

                {/* XP */}
                <div className="flex-shrink-0 text-right">
                  <div className="font-display tabular-nums" style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 500, lineHeight: 1 }}>
                    {person.xp.toLocaleString()}
                  </div>
                  <div className="font-mono text-[9px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--ink-muted)' }}>xp</div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center gap-1 py-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'var(--ink-whisper)' }} />
          ))}
        </div>

        {/* YOU row */}
        <div className="px-6 pb-8 pt-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 rounded-sm p-3"
            style={{
              background: 'var(--cream)',
              border: '1px solid var(--terracotta)',
              borderLeft: '3px solid var(--terracotta)',
              boxShadow: '0 8px 20px -10px rgba(197,83,44,0.35)',
            }}
          >
            <span className="font-display w-7 text-center flex-shrink-0 tabular-nums"
              style={{ color: 'var(--terracotta)', fontSize: 16, fontWeight: 500, lineHeight: 1 }}>
              {ME.rank}
            </span>
            <VibeAvatar config={ME.avatarConfig} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-display text-sm" style={{ color: 'var(--ink)', fontWeight: 500 }}>you</span>
                <span className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-[1px] rounded-full"
                  style={{
                    background: 'rgba(197,83,44,0.15)',
                    color: 'var(--terracotta)',
                  }}>
                  just posted
                </span>
              </div>
              <XpBar xp={ME.xp} />
              <div className="flex gap-2 mt-1 font-mono text-[9px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                <span>{ME.connections} connects</span>
                <span>·</span>
                <span>{ME.duoProofs} proofs</span>
                <span>·</span>
                <span>{ME.streak}d streak</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="font-display tabular-nums" style={{ color: 'var(--terracotta)', fontSize: 18, fontWeight: 500, lineHeight: 1 }}>
                {ME.xp.toLocaleString()}
              </div>
              <div className="font-mono text-[9px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--ink-muted)' }}>xp</div>
            </div>
          </motion.div>

          <p className="italic-serif text-sm text-center mt-4" style={{ color: 'var(--ink-muted)' }}>
            make a connection to earn 250 xp and climb the board
          </p>
        </div>
      </div>
    </motion.div>
  )
}
