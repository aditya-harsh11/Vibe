import { useState } from 'react'
import { motion } from 'framer-motion'
import { VibeAvatar, GRADIENT_COLORS } from './VibeAvatar'

const FLOAT_DURATION = { low: 4, medium: 2.8, high: 1.8 }

export default function VibeBubble({ user, streak = 0, onClick }) {
  const [hovered, setHovered] = useState(false)
  const duration = FLOAT_DURATION[user.energy] || 3
  const accentColor = user.avatarConfig
    ? GRADIENT_COLORS[user.avatarConfig.bgIndex ?? 0]
    : user.avatarColor || '#6366f1'

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: hovered ? 0 : [0, -10, 0],
      }}
      transition={{
        scale: { duration: 0.4, type: 'spring', damping: 16 },
        opacity: { duration: 0.3 },
        y: { repeat: Infinity, duration, ease: 'easeInOut' },
      }}
      style={{
        position: 'absolute',
        left: `${user.location.x * 100}%`,
        top: `${user.location.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: hovered ? 20 : 10,
        cursor: 'pointer',
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(user)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor}28 0%, transparent 70%)`,
          transform: 'scale(2.8)',
        }}
      />

      {/* Main bubble */}
      <div
        className="relative flex items-center gap-2 rounded-full select-none"
        style={{
          padding: '6px 12px 6px 6px',
          background: `${accentColor}14`,
          border: `1.5px solid ${accentColor}45`,
          backdropFilter: 'blur(10px)',
          maxWidth: hovered ? 260 : 210,
          transition: 'max-width 0.2s ease',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {/* Avatar */}
        {user.avatarConfig ? (
          <VibeAvatar config={user.avatarConfig} size={28} />
        ) : (
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: user.avatarColor, color: '#fff' }}
          >
            {user.avatar}
          </div>
        )}

        {/* Text */}
        <div className="flex flex-col min-w-0">
          {hovered && (
            <span className="text-xs font-bold" style={{ color: accentColor }}>
              {user.name} · {user.distance}ft
            </span>
          )}
          <span
            className="text-xs font-medium"
            style={{
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: hovered ? 180 : 140,
            }}
          >
            {hovered ? user.vibe : user.vibe.slice(0, 36) + (user.vibe.length > 36 ? '…' : '')}
          </span>
        </div>
      </div>

      {/* Streak badge */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
          style={{
            background: streak >= 7 ? 'linear-gradient(135deg, #f97316, #ef4444)' : 'linear-gradient(135deg, #f59e0b, #f97316)',
            boxShadow: `0 0 8px ${streak >= 7 ? '#ef4444' : '#f59e0b'}80`,
            fontSize: 9,
            fontWeight: 700,
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          🔥{streak}
        </motion.div>
      )}

      {/* Distance indicator (close proximity) */}
      {user.distance <= 10 && (
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
          style={{
            background: '#10b981',
            borderColor: 'var(--bg-primary)',
            boxShadow: '0 0 6px #10b981',
          }}
        />
      )}
    </motion.div>
  )
}
