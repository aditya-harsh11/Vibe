import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { mockUsers, defaultCurrentUser } from './data/mockUsers'
import AvatarBuilder from './components/AvatarBuilder'
import DailyPulse from './components/DailyPulse'
import SpatialRadar from './components/SpatialRadar'
import MatchPanel from './components/MatchPanel'
import IcebreakerModal from './components/IcebreakerModal'
import GameModal from './components/GameModal'
import CameraGate from './components/CameraGate'
import Leaderboard from './components/Leaderboard'

// Simulate existing streaks with each user (days)
const INITIAL_STREAKS = { u1: 5, u2: 0, u3: 3, u4: 0, u5: 12, u6: 2, u7: 0, u8: 1 }

export default function App() {
  const [view, setView] = useState('avatar') // 'avatar'|'pulse'|'radar'|'match'|'icebreaker'|'cameragate'|'game'|'leaderboard'
  const [prevView, setPrevView] = useState('radar')
  const [currentUser, setCurrentUser] = useState(defaultCurrentUser)
  const [selectedUser, setSelectedUser] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchScore, setMatchScore] = useState(0)
  const [connectionType, setConnectionType] = useState('')
  const [streaks, setStreaks] = useState(INITIAL_STREAKS)

  const goTo = (next) => {
    setPrevView(view)
    setView(next)
  }

  // Step 1: Avatar setup
  const handleAvatarDone = ({ config, name }) => {
    setCurrentUser(u => ({
      ...u,
      avatarConfig: config,
      name: name || 'You',
      avatar: name ? name.slice(0, 2).toUpperCase() : 'ME',
    }))
    goTo('pulse')
  }

  // Step 2: Post vibe
  const handleVibePost = (vibeText) => {
    setCurrentUser(u => ({ ...u, vibe: vibeText }))
    goTo('radar')
  }

  // Tap a bubble → match analysis
  const handleBubbleTap = async (user) => {
    setSelectedUser(user)
    setMatchData(null)
    setMatchLoading(true)
    goTo('match')

    try {
      const res = await fetch('/api/claude/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUser: { name: currentUser.name, vibe: currentUser.vibe, interests: currentUser.interests, major: currentUser.major },
          matchedUser: { name: user.name, vibe: user.vibe, interests: user.interests, major: user.major },
        }),
      })
      const data = await res.json()
      setMatchData(data)
      setMatchScore(data.score || 0)
      setConnectionType(data.connectionType || '')
    } catch {
      setMatchData({
        score: 72, scoreLine: 'Both building, different blueprints',
        crossover: "You're both deeply invested in what you're working on. That intensity is rare — worth a conversation.",
        hooks: ['You share a passion for building', 'Both in focus-mode right now'],
        connectionType: 'Curiosity Bridge',
      })
      setMatchScore(72)
      setConnectionType('Curiosity Bridge')
    } finally {
      setMatchLoading(false)
    }
  }

  // Connect → icebreaker (increments streak)
  const handleConnect = (user, data) => {
    setSelectedUser(user)
    if (data) { setMatchScore(data.score || matchScore); setConnectionType(data.connectionType || connectionType) }
    // Increment streak
    setStreaks(s => ({ ...s, [user.id]: (s[user.id] || 0) + 1 }))
    goTo('icebreaker')
  }

  // Play a game — first verify both people are physically together
  const handleGame = (user, data) => {
    setSelectedUser(user)
    if (data) { setMatchScore(data.score || matchScore); setConnectionType(data.connectionType || connectionType) }
    goTo('cameragate')
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <AnimatePresence mode="wait">
        {view === 'avatar' && (
          <AvatarBuilder key="avatar" onDone={handleAvatarDone} />
        )}

        {view === 'pulse' && (
          <DailyPulse key="pulse" currentUser={currentUser} onVibePost={handleVibePost} />
        )}

        {view === 'radar' && (
          <SpatialRadar
            key="radar"
            currentUser={currentUser}
            users={mockUsers}
            streaks={streaks}
            onBubbleTap={handleBubbleTap}
            onOpenLeaderboard={() => goTo('leaderboard')}
          />
        )}

        {view === 'match' && selectedUser && (
          <div key="match" style={{ position: 'absolute', inset: 0 }}>
            <SpatialRadar
              currentUser={currentUser}
              users={mockUsers}
              streaks={streaks}
              onBubbleTap={handleBubbleTap}
              onOpenLeaderboard={() => goTo('leaderboard')}
            />
            <MatchPanel
              currentUser={currentUser}
              matchedUser={selectedUser}
              matchData={matchData}
              streak={streaks[selectedUser.id] || 0}
              isLoading={matchLoading}
              onConnect={handleConnect}
              onGame={handleGame}
              onBack={() => goTo('radar')}
            />
          </div>
        )}

        {view === 'icebreaker' && selectedUser && (
          <IcebreakerModal
            key="icebreaker"
            currentUser={currentUser}
            matchedUser={selectedUser}
            matchScore={matchScore}
            connectionType={connectionType}
            onBack={() => goTo('match')}
          />
        )}

        {view === 'cameragate' && selectedUser && (
          <CameraGate
            key="cameragate"
            currentUser={currentUser}
            matchedUser={selectedUser}
            onVerified={() => goTo('game')}
            onBack={() => goTo('match')}
          />
        )}

        {view === 'game' && selectedUser && (
          <GameModal
            key="game"
            currentUser={currentUser}
            matchedUser={selectedUser}
            onBack={() => goTo('match')}
            onDone={() => goTo('radar')}
          />
        )}

        {view === 'leaderboard' && (
          <Leaderboard
            key="leaderboard"
            onBack={() => goTo(prevView === 'leaderboard' ? 'radar' : prevView)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
