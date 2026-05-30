import express from 'express'
import cors from 'cors'
import { resolve } from 'path'
import { existsSync } from 'fs'
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

// Serve uploaded images
app.use('/uploads', express.static(resolve('./uploads')))

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }))

// In production — serve the Vue build from Express
if (IS_PROD) {
  const distPath = resolve('./dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath))
    // SPA fallback — all non-API routes go to index.html
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next()
      res.sendFile(resolve(distPath, 'index.html'))
    })
  }
}

app.listen(PORT, () => {
  console.log(`\n🏡 Relax Server запущен: http://localhost:${PORT} [${IS_PROD ? 'production' : 'dev'}]\n`)
})
