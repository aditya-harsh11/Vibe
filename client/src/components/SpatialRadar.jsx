import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Float } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { VibeAvatar, GRADIENT_COLORS } from './VibeAvatar'

const R = 9
function locToWorld(loc) {
  const x = (loc.x - 0.5) * 2 * R
  const z = (loc.y - 0.5) * 2 * R
  return [x, 0, z]
}

// ── Warm rotating radar sweep ───────────────────────────
function RadarSweep() {
  const ref = useRef()
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.85 })
  const geom = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.absarc(0, 0, R * 0.95, 0, Math.PI / 4, false)
    shape.lineTo(0, 0)
    return new THREE.ShapeGeometry(shape, 32)
  }, [])
  return (
    <mesh ref={ref} geometry={geom} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <meshBasicMaterial color="#cd8a3b" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

// ── Concentric warm rings on the ground ─────────────────
function RadarRings() {
  const rings = [0.28, 0.52, 0.76, 0.98]
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, 0, 0.02]}>
          <ringGeometry args={[R * r - 0.05, R * r, 96]} />
          <meshBasicMaterial color="#fff8ea" transparent opacity={0.35 + i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[R * 2, 0.035]} />
        <meshBasicMaterial color="#fff8ea" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.015]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[R * 2, 0.035]} />
        <meshBasicMaterial color="#fff8ea" transparent opacity={0.25} />
      </mesh>
    </group>
  )
}

// ── Distant trees ringing the quad — UW Madison greenspace ──
function CampusTrees() {
  const trees = useMemo(() => {
    const arr = []
    const ring1 = 26
    const ring2 = 32
    const count1 = 18
    const count2 = 14
    for (let i = 0; i < count1; i++) {
      const a = (i / count1) * Math.PI * 2 + 0.17
      const jit = (Math.sin(i * 2.3) + 1) / 2
      arr.push({
        x: Math.cos(a) * (ring1 + jit * 1.8),
        z: Math.sin(a) * (ring1 + jit * 1.8),
        scale: 0.85 + jit * 0.45,
        hue: i % 3,
      })
    }
    for (let i = 0; i < count2; i++) {
      const a = (i / count2) * Math.PI * 2 + 0.5
      const jit = (Math.sin(i * 3.7) + 1) / 2
      arr.push({
        x: Math.cos(a) * (ring2 + jit * 2.2),
        z: Math.sin(a) * (ring2 + jit * 2.2),
        scale: 1.1 + jit * 0.6,
        hue: (i + 1) % 3,
      })
    }
    return arr
  }, [])

  const foliage = ['#4e6d3a', '#5c7d44', '#426032']
  const trunk = '#5a3d26'

  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* Trunk */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 1, 8]} />
            <meshStandardMaterial color={trunk} roughness={0.95} />
          </mesh>
          {/* Foliage — two stacked blobs */}
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.95, 12, 10]} />
            <meshStandardMaterial color={foliage[t.hue]} roughness={0.95} />
          </mesh>
          <mesh position={[0.2, 2.1, -0.1]}>
            <sphereGeometry args={[0.65, 10, 8]} />
            <meshStandardMaterial color={foliage[(t.hue + 1) % 3]} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── 3D person body — simple humanoid placeholder ────────
function PersonBody({ accent, skin = '#d9b38a', pants = '#3a2a1e', tilt = 0 }) {
  return (
    <group rotation={[0, tilt, 0]}>
      {/* Left leg */}
      <mesh position={[-0.13, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 12]} />
        <meshStandardMaterial color={pants} roughness={0.9} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.13, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 12]} />
        <meshStandardMaterial color={pants} roughness={0.9} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.13, 0.04, 0.05]}>
        <boxGeometry args={[0.16, 0.08, 0.22]} />
        <meshStandardMaterial color="#1f1712" roughness={0.9} />
      </mesh>
      <mesh position={[0.13, 0.04, 0.05]}>
        <boxGeometry args={[0.16, 0.08, 0.22]} />
        <meshStandardMaterial color="#1f1712" roughness={0.9} />
      </mesh>
      {/* Torso (shirt in accent color) */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.5, 6, 16]} />
        <meshStandardMaterial color={accent} roughness={0.75} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.33, 1.15, 0]} rotation={[0, 0, 0.18]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 4, 10]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      <mesh position={[0.33, 1.15, 0]} rotation={[0, 0, -0.18]} castShadow>
        <capsuleGeometry args={[0.075, 0.55, 4, 10]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.26, 20, 18]} />
        <meshStandardMaterial color={skin} roughness={0.9} />
      </mesh>
    </group>
  )
}

// Deterministic variety per user
function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}
const SKIN_TONES = ['#f0d2b3', '#e8c5a0', '#d9a479', '#c48960', '#a66b47', '#8a4f2f']
const PANTS_TONES = ['#3a2a1e', '#2a3340', '#4a4034', '#5a4028', '#2d2a28']

// ── "YOU" — your 3D self on the quad ────────────────────
function YouAvatar({ currentUser }) {
  const accent = currentUser.avatarConfig
    ? GRADIENT_COLORS[currentUser.avatarConfig.bgIndex ?? 0]
    : '#c5532c'
  const seedHash = hashCode(currentUser.name || 'you')
  const skin = SKIN_TONES[seedHash % SKIN_TONES.length]
  const pants = PANTS_TONES[(seedHash >> 3) % PANTS_TONES.length]

  return (
    <group position={[0, 0, 0]}>
      {/* Pulsing ground ring */}
      <PulseRing color={accent} />

      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#1f1712" transparent opacity={0.28} />
      </mesh>

      <PersonBody accent={accent} skin={skin} pants={pants} />

      {/* Face billboard — your avatar as the head */}
      <Html position={[0, 1.78, 0.26]} center distanceFactor={7} style={{ pointerEvents: 'none' }} zIndexRange={[20, 30]}>
        {currentUser.avatarConfig
          ? <VibeAvatar config={currentUser.avatarConfig} size={46} ring={false} />
          : null}
      </Html>

      {/* "YOU" label above head */}
      <Html position={[0, 2.45, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <span style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          color: accent,
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: 3,
          textTransform: 'uppercase',
          background: 'rgba(255,248,234,0.92)',
          padding: '3px 9px',
          borderRadius: 999,
          border: `1px solid ${accent}`,
          whiteSpace: 'nowrap',
          boxShadow: `0 4px 10px -4px ${accent}70`,
        }}>
          you
        </span>
      </Html>
    </group>
  )
}

function PulseRing({ color }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() % 2.5) / 2.5
    ref.current.scale.set(1 + t * 2, 1 + t * 2, 1)
    ref.current.material.opacity = 0.45 * (1 - t)
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[0.55, 0.66, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  )
}

// ── 3D person standing on the quad ──────────────────────
function UserAvatar({ user, streak, onClick }) {
  const [hovered, setHovered] = useState(false)
  const accent = user.avatarConfig
    ? GRADIENT_COLORS[user.avatarConfig.bgIndex ?? 0]
    : user.avatarColor || '#c5532c'
  const worldPos = locToWorld(user.location)
  const seedHash = hashCode(user.id || user.name || 'u')
  const skin = SKIN_TONES[seedHash % SKIN_TONES.length]
  const pants = PANTS_TONES[(seedHash >> 3) % PANTS_TONES.length]
  const tilt = ((seedHash % 360) / 360) * Math.PI * 2
  const bodyRef = useRef()

  // Idle sway
  useFrame(({ clock }) => {
    if (!bodyRef.current) return
    const t = clock.getElapsedTime() + seedHash * 0.01
    const ampl = user.energy === 'high' ? 0.06 : user.energy === 'low' ? 0.02 : 0.04
    bodyRef.current.position.y = Math.sin(t * 1.3) * ampl
    bodyRef.current.rotation.y = Math.sin(t * 0.5) * 0.08
  })

  return (
    <group position={worldPos}>
      {/* Ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#1f1712" transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.42, 0.5, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={hovered ? 0.7 : 0.4} />
      </mesh>

      {/* 3D body with idle sway — click target wraps it */}
      <group
        ref={bodyRef}
        onClick={(e) => { e.stopPropagation(); onClick(user) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      >
        <PersonBody accent={accent} skin={skin} pants={pants} tilt={tilt} />
      </group>

      {/* Face billboard — avatar as head overlay */}
      <Html position={[0, 1.78, 0.27]} center distanceFactor={7} style={{ pointerEvents: 'none' }} zIndexRange={[20, 30]}>
        {user.avatarConfig
          ? <VibeAvatar config={user.avatarConfig} size={44} ring={false} />
          : null}
      </Html>

      {/* Name + vibe pill floating above head */}
      <Html position={[0, 2.5, 0]} center distanceFactor={7} style={{ pointerEvents: 'auto' }} zIndexRange={[10, 20]}>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={(e) => { e.stopPropagation(); onClick(user) }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '4px 12px 5px',
            borderRadius: 999,
            background: 'rgba(255,248,234,0.96)',
            border: `1.5px solid ${accent}`,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            position: 'relative',
            boxShadow: `0 8px 20px -8px ${accent}99`,
            fontFamily: "'Geist', sans-serif",
          }}
        >
          <span style={{
            color: accent, fontSize: 9, fontWeight: 700,
            fontFamily: "'Geist Mono', monospace", letterSpacing: 1.5, textTransform: 'uppercase',
          }}>
            {user.name.split(' ')[0]} · {user.distance}ft
          </span>
          <span style={{
            color: '#1f1712',
            fontSize: 11,
            fontWeight: 500,
            maxWidth: hovered ? 220 : 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'max-width 0.2s',
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
          }}>
            {hovered ? user.vibe : user.vibe.slice(0, 28) + (user.vibe.length > 28 ? '…' : '')}
          </span>

          {streak > 0 && (
            <div style={{
              position: 'absolute',
              top: -7, right: -6,
              padding: '2px 6px',
              borderRadius: 999,
              background: streak >= 7
                ? 'linear-gradient(135deg, #c5532c, #a23543)'
                : 'linear-gradient(135deg, #cd8a3b, #c5532c)',
              color: '#fff8ea',
              fontSize: 9,
              fontWeight: 800,
              fontFamily: "'Geist Mono', monospace",
              letterSpacing: 0.5,
              boxShadow: `0 4px 10px ${streak >= 7 ? '#a23543' : '#cd8a3b'}aa`,
            }}>
              {streak}d
            </div>
          )}
        </motion.div>
      </Html>
    </group>
  )
}

// ── Grass ground — UW Madison quad ──────────────────────
function Ground() {
  return (
    <>
      {/* Base grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[90, 90, 1, 1]} />
        <meshStandardMaterial color="#6f9354" roughness={1} metalness={0} />
      </mesh>
      {/* Softer grass patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <circleGeometry args={[22, 64]} />
        <meshBasicMaterial color="#8ba96d" transparent opacity={0.45} />
      </mesh>
      {/* Warmer sunny patch under you */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshBasicMaterial color="#cbd982" transparent opacity={0.35} />
      </mesh>
      {/* Faint grid — like pathways on the quad */}
      <gridHelper args={[44, 22, '#4f6b3a', '#5c7d44']} position={[0, 0.002, 0]} />
    </>
  )
}

// ── Daylight sky dome — soft campus afternoon ───────────
function SkyDome() {
  const uniforms = useMemo(() => ({
    top:    { value: new THREE.Color('#b8d3e0') },
    middle: { value: new THREE.Color('#e8ddc2') },
    bottom: { value: new THREE.Color('#d1cd9a') },
  }), [])

  return (
    <mesh>
      <sphereGeometry args={[60, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 top;
          uniform vec3 middle;
          uniform vec3 bottom;
          varying vec3 vPos;
          void main() {
            float h = normalize(vPos).y;
            vec3 color;
            if (h > 0.15) {
              color = mix(middle, top, smoothstep(0.15, 0.7, h));
            } else {
              color = mix(bottom, middle, smoothstep(-0.2, 0.15, h));
            }
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function SlowOrbit() {
  const ref = useRef()
  useFrame(() => { if (ref.current) ref.current.autoRotateSpeed = 0.35 })
  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      enableZoom={true}
      minDistance={12}
      maxDistance={28}
      minPolarAngle={Math.PI / 5}
      maxPolarAngle={Math.PI / 2.35}
      autoRotate
      target={[0, 1, 0]}
    />
  )
}

export default function SpatialRadar({ currentUser, users, streaks = {}, onBubbleTap, onOpenLeaderboard }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--paper)' }}>
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between px-6 py-4 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(247,239,225,0.92) 30%, rgba(247,239,225,0) 100%)' }}>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
            style={{
              background: 'radial-gradient(circle at 35% 35%, var(--ochre-l), var(--terracotta))',
              color: 'var(--cream)',
              boxShadow: '0 4px 12px -2px rgba(197,83,44,0.45)',
            }}
          >
            ◉
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg" style={{ color: 'var(--ink)', fontWeight: 500, letterSpacing: '-0.02em' }}>
              vibe
            </span>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--ink-whisper)' }}>
              radar · live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--terracotta)' }}>
              your vibe
            </span>
            <span className="italic-serif text-xs max-w-44 text-right truncate" style={{ color: 'var(--ink-soft)' }}>
              {currentUser.vibe ? `"${currentUser.vibe}"` : '—'}
            </span>
          </div>
          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.95 }}
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              background: 'var(--cream)',
              border: '1px solid var(--ochre)',
              color: 'var(--sienna)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Trophy size={13} />
            <span className="font-mono text-xs font-bold tracking-wider uppercase">board</span>
          </motion.button>
        </div>
      </div>

      {/* 3D scene */}
      <Canvas
        shadows
        camera={{ position: [0, 10, 18], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#e8ddc2']} />
        <fog attach="fog" args={['#d8e3c6', 22, 50]} />

        <ambientLight intensity={0.85} color="#fff4da" />
        <directionalLight position={[8, 16, 6]} intensity={1.1} color="#fff0cc" castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.9} color="#f3d99a" distance={22} />

        <Suspense fallback={null}>
          <SkyDome />
          <Ground />
          <RadarRings />
          <RadarSweep />
          <CampusTrees />
          <YouAvatar currentUser={currentUser} />
          {users.map(u => (
            <UserAvatar
              key={u.id}
              user={u}
              streak={streaks[u.id] || 0}
              onClick={onBubbleTap}
            />
          ))}
        </Suspense>

        <SlowOrbit />
      </Canvas>

      {/* Bottom status strip */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(247,239,225,0.95) 55%, rgba(247,239,225,0) 100%)' }}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--sage)', boxShadow: '0 0 6px var(--sage)' }}
          />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: 'var(--ink-muted)' }}>
            {users.length} nearby · drag to look around
          </span>
        </div>
        <span className="italic-serif text-xs" style={{ color: 'var(--ink-muted)' }}>
          tap a bubble to read the room
        </span>
      </div>
    </div>
  )
}
