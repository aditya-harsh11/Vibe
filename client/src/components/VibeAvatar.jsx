// Bitmoji-style avatars via DiceBear Avataaars, warm editorial palette.

// DiceBear SVG background gradients — paired tones from the warm palette
const BG_COLORS = [
  'f3c5ab,e8a488,dd8466',  // terracotta
  'f7dfb0,eec89b,e3a858',  // honey/ochre
  'd4e0c6,b9cfa6,9cb788',  // sage
  'f4cfd2,d98a8e,c06069',  // rose/cranberry
  'e6cfda,c49bb2,a87289',  // plum
  'f9d7cc,f1b8aa,e0775a',  // coral
  'ece5c0,d9cd9a,c2b26d',  // olive
  'edccb9,d5a480,b57c5a',  // rust
]

// Primary accent per index (used for rings, shadows, borders around avatars)
export const GRADIENT_COLORS = [
  '#c5532c', // terracotta
  '#cd8a3b', // ochre
  '#6f8b5e', // sage
  '#a23543', // cranberry
  '#7b3e52', // plum
  '#e0775a', // coral
  '#8a7a3a', // olive
  '#8d3a1d', // clay-deep / rust
]

// Gradient pairs for broader surfaces (used in MatchPanel buttons)
export const GRADIENTS = [
  'linear-gradient(135deg, #e8a488, #c5532c)',
  'linear-gradient(135deg, #eec89b, #cd8a3b)',
  'linear-gradient(135deg, #b9cfa6, #6f8b5e)',
  'linear-gradient(135deg, #d98a8e, #a23543)',
  'linear-gradient(135deg, #b889a0, #7b3e52)',
  'linear-gradient(135deg, #f1b8aa, #e0775a)',
  'linear-gradient(135deg, #c9bd87, #8a7a3a)',
  'linear-gradient(135deg, #c68466, #8d3a1d)',
]

// Legacy compat
export const EMOJIS = ['🦊','🐼','🐙','🦋','🐉','🦄','🐨','🦁','🎮','🧠','🎵','⚡','🌙','🔮','🌊','🎯']
export const ACCESSORY_MAP = { none: null, headphones: '🎧', glasses: '👓', cap: '🧢', star: '⭐' }

export const DEFAULT_AVATAR = {
  seed: 'vibe-default',
  bgIndex: 0,
  accessory: 'none',
}

export function buildAvatarUrl(config = DEFAULT_AVATAR, size = 96) {
  const seed = encodeURIComponent(config.seed || 'vibe')
  const bg = BG_COLORS[config.bgIndex ?? 0]
  const params = new URLSearchParams({
    seed,
    size: String(size * 2),
    backgroundColor: bg,
    backgroundType: 'gradientLinear',
    radius: '50',
  })

  const accessoryMap = {
    none: 'blank',
    headphones: 'blank',
    glasses: 'prescription02',
    cap: 'prescription01',
    star: 'sunglasses',
  }
  const acc = accessoryMap[config.accessory ?? 'none']
  if (acc && acc !== 'blank') {
    params.set('accessories', acc)
    params.set('accessoriesProbability', '100')
  }
  if (config.accessory === 'cap') {
    params.set('top', 'winterHat1,winterHat02,winterHat03,winterHat04')
  }
  return `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`
}

function HeadphonesOverlay({ accent, size }) {
  return (
    <svg
      viewBox="0 0 100 60"
      style={{
        position: 'absolute',
        top: '2%',
        left: '8%',
        width: '84%',
        height: '46%',
        pointerEvents: 'none',
        filter: `drop-shadow(0 ${size * 0.02}px ${size * 0.04}px rgba(31,23,18,0.35))`,
      }}
    >
      {/* Band */}
      <path
        d="M 14 42 Q 50 -4 86 42"
        stroke={accent}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      {/* Inner highlight on band */}
      <path
        d="M 20 38 Q 50 4 80 38"
        stroke="#fff8ea"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Left cup */}
      <rect x="6"  y="32" width="16" height="22" rx="5" fill={accent} stroke="#1f1712" strokeWidth="0.8" />
      <circle cx="14" cy="43" r="3" fill="#1f1712" opacity="0.45" />
      {/* Right cup */}
      <rect x="78" y="32" width="16" height="22" rx="5" fill={accent} stroke="#1f1712" strokeWidth="0.8" />
      <circle cx="86" cy="43" r="3" fill="#1f1712" opacity="0.45" />
    </svg>
  )
}

export function VibeAvatar({ config = DEFAULT_AVATAR, size = 48, ring = true }) {
  const url = buildAvatarUrl(config, size)
  const accent = GRADIENT_COLORS[config.bgIndex ?? 0]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        position: 'relative',
        flexShrink: 0,
        userSelect: 'none',
        boxShadow: ring
          ? `0 6px 18px -4px ${accent}55, 0 0 0 2px #fff8ea, 0 0 0 3.5px ${accent}70`
          : `0 6px 18px -4px ${accent}55`,
        background: '#fff8ea',
        overflow: 'hidden',
      }}
    >
      <img
        src={url}
        alt="avatar"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {config.accessory === 'headphones' && (
        <HeadphonesOverlay accent={accent} size={size} />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.28) 0%, transparent 42%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
