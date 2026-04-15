const express = require('express')
const Anthropic = require('@anthropic-ai/sdk')

const router = express.Router()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// POST /api/claude/match
router.post('/match', async (req, res) => {
  const { currentUser, matchedUser } = req.body
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: "You are the social brain of Vibe, a spatial social app. Analyze two people's vibes and find genuine human connection points. Return ONLY valid JSON with no markdown wrapper, no code fences, no explanation. Be witty but real — never generic.",
      messages: [{
        role: 'user',
        content: `Analyze these two people meeting in the same physical space right now:

Person A: ${currentUser.name}, ${currentUser.major}
Their vibe today: "${currentUser.vibe}"
Interests: ${(currentUser.interests || []).join(', ')}

Person B: ${matchedUser.name}, ${matchedUser.major}
Their vibe today: "${matchedUser.vibe}"
Interests: ${(matchedUser.interests || []).join(', ')}

Return this exact JSON (no markdown, raw JSON only):
{
  "score": <integer 0-100>,
  "scoreLine": "<5-8 word punchy reason, e.g. 'Both drowning, different oceans'>",
  "crossover": "<2-3 sentences on the real intersection — be specific>",
  "hooks": ["<connection point 1>", "<connection point 2>"],
  "connectionType": "<one of: Study Ally | Creative Collab | Serendipity Clash | Energy Sync | Curiosity Bridge>"
}`,
      }],
    })
    const text = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Match error:', err)
    res.status(500).json({ error: 'Match analysis failed', detail: err.message })
  }
})

// POST /api/claude/icebreaker (SSE streaming)
router.post('/icebreaker', async (req, res) => {
  const { currentUser, matchedUser, matchScore, connectionType } = req.body
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: "You are the Vibe icebreaker engine. Generate ONE specific, witty opening line for two people meeting. Must reference their actual vibes — never generic. Max 2 sentences. Output text directly, no quotes, no preamble.",
      messages: [{
        role: 'user',
        content: `Two people just walked within 5 feet of each other. Vibe Score: ${matchScore} (${connectionType}).
${currentUser.name}'s vibe: "${currentUser.vibe}"
${matchedUser.name}'s vibe: "${matchedUser.vibe}"
Write the icebreaker ${currentUser.name} should say to ${matchedUser.name}. Specific, clever, not cringe.`,
      }],
    })
    stream.on('text', t => res.write(`data: ${t.replace(/\n/g, '\\n')}\n\n`))
    stream.on('finalMessage', () => { res.write('data: [DONE]\n\n'); res.end() })
    stream.on('error', () => { res.write('data: [DONE]\n\n'); res.end() })
  } catch (err) {
    res.write('data: [DONE]\n\n')
    res.end()
  }
})

// POST /api/claude/pulse-coach
router.post('/pulse-coach', async (req, res) => {
  const { draftVibe } = req.body
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      system: "You are Vibe's pulse coach. Take a raw vibe post and make it 30% more interesting and connectable — keep their voice. One sentence. Return raw JSON: { \"enhanced\": \"...\" } with no markdown.",
      messages: [{ role: 'user', content: `Original vibe: "${draftVibe}"\nMake it better — keep their voice.` }],
    })
    const text = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    res.json(JSON.parse(text))
  } catch (err) {
    res.status(500).json({ error: 'Pulse coach failed' })
  }
})

// POST /api/claude/trivia
// Returns: { questions: [{ q, options, answer, topic }] }
router.post('/trivia', async (req, res) => {
  const { currentUser, matchedUser } = req.body
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: "You generate trivia questions for two people to play together. Questions should span BOTH people's interests so each person has home turf and challenge rounds. Return ONLY raw JSON, no markdown.",
      messages: [{
        role: 'user',
        content: `Generate 5 trivia questions for these two people to play together:

Person A: ${currentUser.name} — interests: ${(currentUser.interests || []).join(', ')}, vibe: "${currentUser.vibe}"
Person B: ${matchedUser.name} — interests: ${(matchedUser.interests || []).join(', ')}, vibe: "${matchedUser.vibe}"

Mix questions from both their interests. Make them fun and specific — not generic trivia.
Return raw JSON only:
{
  "questions": [
    {
      "q": "<the question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "answer": <0-3 index of correct option>,
      "topic": "<short topic label, e.g. 'distributed systems'>"
    }
  ]
}`,
      }],
    })
    const text = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Trivia error:', err)
    res.status(500).json({ error: 'Trivia generation failed', detail: err.message })
  }
})

// POST /api/claude/hottakes
// Returns: { takes: ["<hot take 1>", ...] }
router.post('/hottakes', async (req, res) => {
  const { currentUser, matchedUser } = req.body
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: "You generate spicy but fun opinion statements tailored to two specific people. The hot takes should be relevant to their actual interests and vibes — not generic. Return ONLY raw JSON, no markdown.",
      messages: [{
        role: 'user',
        content: `Generate 5 spicy hot takes for these two people to agree/disagree on:

Person A: ${currentUser.name} — interests: ${(currentUser.interests || []).join(', ')}, vibe: "${currentUser.vibe}"
Person B: ${matchedUser.name} — interests: ${(matchedUser.interests || []).join(', ')}, vibe: "${matchedUser.vibe}"

Make the takes specific to their domains — not generic life advice. Provocative but not offensive. Fun to debate.
Return raw JSON only:
{
  "takes": [
    "<hot take 1>",
    "<hot take 2>",
    "<hot take 3>",
    "<hot take 4>",
    "<hot take 5>"
  ]
}`,
      }],
    })
    const text = response.content[0].text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    res.json(JSON.parse(text))
  } catch (err) {
    console.error('Hot takes error:', err)
    res.status(500).json({ error: 'Hot takes failed', detail: err.message })
  }
})

module.exports = router
