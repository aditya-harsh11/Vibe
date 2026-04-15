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
          <ringGeometry args={[R * r - 0.06, R * r, 96]} />
          <meshBasicMaterial color="#c5532c" transparent opacity={0.22 + i * 0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[R * 2, 0.04]} />
        <meshBasicMaterial color="#c5532c" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 0, 0.015]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[R * 2, 0.04]} />
        <meshBasicMaterial color="#c5532c" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

// ── Warm terrain ridges — desert mesa silhouettes ───────
function TerrainRidges() {
  const peaks = useMemo(() => {
    const arr = []
    const rings = 2
    for (let r = 0; r < rings; r++) {
      const radius = 16 + r * 6
      const count = 22 + r * 4
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + (r * 0.3)
        const jitter = (Math.sin(i * 1.7 + r * 3.3) + 1) / 2
        const h = 1.4 + jitter * 3 + r * 0.5
        arr.push({
          x: Math.cos(a) * (radius + jitter * 1.5),
          z: Math.sin(a) * (radius + jitter * 1.5),
          h,
          hueIdx: i % 5,
          r,
        })
      }
    }
    return arr
  }, [])

  // Warm palette cycled across the ridges — sienna, ochre, rust, sage-olive, plum
  const colors = ['#9e4422', '#b76a36', '#8d3a1d', '#7a6b3a', '#6f5747']

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={[p.x, p.h / 2, p.z]}>
          <coneGeometry args={[0.9 + (i % 3) * 0.3, p.h, 5]} />
          <meshStandardMaterial
            color={colors[p.hueIdx]}
            roughness={0.9}
            metalness={0}
            emissive="#4a2610"
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── "YOU" beam — terracotta pillar ──────────────────────
function YouBeam() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime()
      ref.current.material.opacity = 0.4 + Math.sin(t * 2) * 0.2
    }
  })
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color="#c5532c" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 3, 16]} />
        <meshStandardMaterial color="#c5532c" emissive="#e8a488" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh ref={ref} position={[0, 4, 0]}>
        <cylinderGeometry args={[0.05, 0.4, 8, 16, 1, true]} />
        <meshBasicMaterial color="#e0775a" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html position={[0, 3.4, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          color: '#c5532c',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: 3,
          textShadow: '0 1px 0 #fff8ea, 0 0 10px rgba(197,83,44,0.4)',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}>
          you
        </div>
      </Html>
    </group>
  )
}

// ── Floating avatar bubble ──────────────────────────────
function UserAvatar({ user, streak, onClick }) {
  const floatHeight = user.energy === 'high' ? 2.6 : user.energy === 'low' ? 1.8 : 2.2
  const floatSpeed = user.energy === 'high' ? 2.2 : user.energy === 'low' ? 1.1 : 1.6
  const [hovered, setHovered] = useState(false)
  const accent = user.avatarConfig
    ? GRADIENT_COLORS[user.avatarConfig.bgIndex ?? 0]
    : user.avatarColor || '#c5532c'
  const worldPos = locToWorld(user.location)

  return (
    <group position={worldPos}>
      {/* Ground shadow / pin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.22} />
      </mesh>

      <Float speed={floatSpeed} rotationIntensity={0} floatIntensity={0.6}>
        <group position={[0, floatHeight, 0]}>
          <Html
            center distanceFactor={7} zIndexRange={[0, 10]}
            style={{ pointerEvents: 'auto' }}
          >
            <motion.div
              whileHover={{ scale: 1.08, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHovered(true)}
              onHoverEnd={() => setHovered(false)}
              onClick={(e) => { e.stopPropagation(); onClick(user) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px 6px 6px',
                borderRadius: 999,
                background: '#fdf6e9',
                border: `1.5px solid ${accent}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                position: 'relative',
                boxShadow: `0 10px 28px -8px ${accent}99, 0 1px 0 rgba(255,248,234,0.8) inset`,
                fontFamily: "'Geist', sans-serif",
              }}
            >
              {user.avatarConfig
                ? <VibeAvatar config={user.avatarConfig} size={44} ring={false} />
                : <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: user.avatarColor, color: '#fff8ea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14,
                  }}>{user.avatar}</div>
              }
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  color: accent, fontSize: 10, fontWeight: 700,
                  fontFamily: "'Geist Mono', monospace", letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {user.name.split(' ')[0]} · {user.distance}ft
                </span>
                <span style={{
                  color: '#1f1712',
                  fontSize: 12,
                  fontWeight: 500,
                  maxWidth: hovered ? 230 : 155,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'max-width 0.2s',
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                }}>
                  {hovered ? user.vibe : user.vibe.slice(0, 30) + (user.vibe.length > 30 ? '…' : '')}
                </span>
              </div>

              {streak > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -8, right: -6,
                  padding: '2px 7px',
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

          {/* Tether */}
          <mesh position={[0, -floatHeight / 2, 0]}>
            <cylinderGeometry args={[0.015, 0.015, floatHeight, 8]} />
            <meshBasicMaterial color={accent} transparent opacity={0.45} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

// ── Warm ground with subtle grid ────────────────────────
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial color="#e8d5b5" roughness={1} metalness={0} />
      </mesh>
      <gridHelper args={[40, 40, '#b8895e', '#d9bd91']} position={[0, 0, 0]} />
      {/* Soft central warmth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[11, 64]} />
        <meshBasicMaterial color="#cd8a3b" transparent opacity={0.12} />
      </mesh>
    </>
  )
}

// ── Warm sky dome — sunset gradient ─────────────────────
function SkyDome() {
  const uniforms = useMemo(() => ({
    top:    { value: new THREE.Color('#f7efe1') },
    middle: { value: new THREE.Color('#f1c79c') },
    bottom: { value: new THREE.Color('#e8a478') },
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
        <color attach="background" args={['#f7efe1']} />
        <fog attach="fog" args={['#f1c79c', 20, 48]} />

        <ambientLight intensity={0.7} color="#fff1d9" />
        <directionalLight position={[8, 15, 8]} intensity={1.2} color="#ffd9a8" castShadow />
        <pointLight position={[0, 4, 0]} intensity={1.4} color="#e8a478" distance={20} />

        <Suspense fallback={null}>
          <SkyDome />
          <Ground />
          <RadarRings />
          <RadarSweep />
          <TerrainRidges />
          <YouBeam />
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
