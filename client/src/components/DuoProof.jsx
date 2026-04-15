import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, Download } from 'lucide-react'

export default function DuoProof({ currentUser, matchedUser, matchScore, onBack }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        setStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      } catch (err) {
        setCameraError(true)
      }
    }
    startCamera()
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [])

  useEffect(() => {
    if (stream && videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  const handleCapture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth || 400
    canvas.height = video.videoHeight || 300
    const ctx = canvas.getContext('2d')

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Warm paper wash at bottom
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    grad.addColorStop(0, 'rgba(247,239,225,0)')
    grad.addColorStop(0.65, 'rgba(31,23,18,0.25)')
    grad.addColorStop(1, 'rgba(31,23,18,0.85)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Terracotta rule
    ctx.fillStyle = '#c5532c'
    ctx.fillRect(20, canvas.height - 90, 48, 2)

    // Names — Fraunces-styled
    ctx.fillStyle = '#fff8ea'
    ctx.font = `500 ${Math.round(canvas.width * 0.058)}px "Fraunces", Georgia, serif`
    ctx.fillText(`${currentUser.name} × ${matchedUser.name}`, 20, canvas.height - 58)

    // Meta
    ctx.font = `${Math.round(canvas.width * 0.028)}px "Geist Mono", ui-monospace, monospace`
    ctx.fillStyle = 'rgba(255,248,234,0.75)'
    ctx.fillText(`VIBE SCORE ${matchScore} · GATES HALL`, 20, canvas.height - 34)

    const now = new Date()
    ctx.fillText(
      now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
      20, canvas.height - 14
    )

    // Logo
    ctx.fillStyle = '#cd8a3b'
    ctx.font = `italic 500 ${Math.round(canvas.width * 0.038)}px "Fraunces", Georgia, serif`
    ctx.textAlign = 'right'
    ctx.fillText('vibe', canvas.width - 18, canvas.height - 14)

    setPhoto(canvas.toDataURL('image/jpeg', 0.92))
    if (stream) stream.getTracks().forEach(t => t.stop())
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = photo
    a.download = `vibe-${currentUser.name.toLowerCase().replace(' ', '-')}-x-${matchedUser.name.toLowerCase().replace(' ', '-')}.jpg`
    a.click()
  }

  const handleReset = () => {
    setPhoto(null)
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        setStream(s)
      } catch (e) { setCameraError(true) }
    }
    startCamera()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: 'var(--paper)' }}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-6 pb-3 flex-shrink-0"
        style={{ background: 'linear-gradient(to bottom, rgba(31,23,18,0.55), transparent)' }}
      >
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-1.5"
          style={{ color: 'var(--cream)' }}
        >
          <ArrowLeft size={14} />
          <span className="font-mono text-[11px] tracking-widest uppercase">back</span>
        </motion.button>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--cream)' }}>
          duo proof · the keepsake
        </span>
        <div className="w-14" />
      </div>

      {/* Camera / photo */}
      <div className="flex-1 relative overflow-hidden">
        {!photo ? (
          <>
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8"
                style={{ background: 'var(--paper)' }}>
                <Camera size={36} style={{ color: 'var(--ink-muted)' }} />
                <p className="italic-serif text-sm text-center" style={{ color: 'var(--ink-muted)' }}>
                  camera access denied. allow camera in browser settings to capture your duo proof.
                </p>
                <div
                  className="w-72 h-44 rounded-sm flex flex-col items-end justify-end p-4"
                  style={{
                    background: 'var(--cream)',
                    border: '1px solid var(--line)',
                    borderLeft: '3px solid var(--terracotta)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  <p className="font-display text-sm" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                    {currentUser.name} × {matchedUser.name}
                  </p>
                  <p className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--ink-muted)' }}>
                    vibe score {matchScore} · gates hall
                  </p>
                  <p className="italic-serif text-xs" style={{ color: 'var(--ochre)' }}>vibe</p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: 'scaleX(-1)',
                  filter: 'brightness(1.02) contrast(1.02) sepia(0.1) saturate(1.08)',
                }}
              />
            )}
            {/* Capture controls */}
            <div
              className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center gap-4"
              style={{ background: 'linear-gradient(to top, rgba(31,23,18,0.7), transparent)' }}
            >
              <p className="italic-serif text-sm text-center" style={{ color: 'var(--cream)' }}>
                face the camera together and capture the moment
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cameraError ? handleCapture : handleCapture}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--cream)',
                  border: '3px solid var(--terracotta)',
                  boxShadow: '0 10px 24px -8px rgba(197,83,44,0.7)',
                }}
              >
                <Camera size={22} style={{ color: 'var(--terracotta)' }} />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-5"
            style={{ background: 'var(--paper)' }}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: -1.2 }}
              transition={{ type: 'spring', damping: 18 }}
              className="relative p-3 pb-10"
              style={{
                background: 'var(--cream)',
                border: '1px solid var(--line)',
                boxShadow: '0 22px 40px -16px rgba(31,23,18,0.35), 0 2px 0 var(--ink-soft)',
              }}
            >
              <img
                src={photo}
                alt="Duo Proof"
                className="max-w-full max-h-64 object-cover block"
                style={{ filter: 'sepia(0.05)' }}
              />
              <span className="absolute bottom-2.5 left-4 font-mono text-[9px] tracking-[0.3em] uppercase"
                style={{ color: 'var(--ink-muted)' }}>
                polaroid nº{String(Math.abs(matchScore)).padStart(3, '0')}
              </span>
              <span className="absolute bottom-2.5 right-4 italic-serif text-[11px]"
                style={{ color: 'var(--terracotta)' }}>
                vibe
              </span>
            </motion.div>

            <div className="flex flex-col items-center gap-1 mt-2">
              <p className="font-display text-lg" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                duo proof captured
              </p>
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--ink-muted)' }}>
                anchored to gates hall · {new Date().toLocaleDateString()}
              </p>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 12 }}
              className="px-4 py-2 rounded-full font-mono text-[11px] font-bold tracking-widest uppercase flex items-center gap-2"
              style={{
                background: 'rgba(205,138,59,0.15)',
                border: '1px solid var(--ochre)',
                color: 'var(--ochre)',
              }}
            >
              ✦ +250 social xp
            </motion.div>

            <div className="flex gap-3 w-full max-w-xs">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                className="flex-1 rounded-full py-3 font-mono text-[11px] tracking-widest uppercase"
                style={{
                  background: 'var(--cream)',
                  color: 'var(--ink-muted)',
                  border: '1.5px solid var(--line-strong)',
                }}
              >
                retake
              </motion.button>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                className="flex-1 rounded-full py-3 font-mono text-[11px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                style={{
                  background: 'var(--ink)',
                  color: 'var(--cream)',
                  boxShadow: '0 14px 28px -12px rgba(197,83,44,0.5), 0 2px 0 var(--ink-soft)',
                }}
              >
                <Download size={13} />
                save
              </motion.button>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  )
}
