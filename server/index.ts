import express from 'express'
import cors from 'cors'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'
import roomsRoutes from './routes/rooms.js'
import bookingsRoutes from './routes/bookings.js'

const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

app.use(cors({
  origin: IS_PROD
    ? process.env.ALLOWED_ORIGIN || true
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'],
}))
app.use(express.json())
app.use('/uploads', express.static(resolve('./uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

if (IS_PROD) {
  const distPath = resolve('./dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next()
      res.sendFile(resolve(distPath, 'index.html'))
    })
  }
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🏡 Relax Server: http://localhost:${PORT} [${IS_PROD ? 'production' : 'dev'}]\n`)
    })
  })
  .catch(err => {
    console.error('❌ DB init failed:', err.message)
    process.exit(1)
  })
