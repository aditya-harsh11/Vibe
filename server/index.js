require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')
const claudeRouter = require('./routes/claude')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/claude', claudeRouter)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Vibe server running on :${PORT}`)
})
