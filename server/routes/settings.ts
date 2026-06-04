import { Router, Request, Response } from 'express'
import multer from 'multer'
import { mkdirSync } from 'fs'
import { resolve, extname } from 'path'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = resolve('./uploads/site')
    mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } })

router.post('/upload', authMiddleware, upload.single('image'), (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined
  if (!file) return res.status(400).json({ error: 'Нет файла' })
  res.json({ url: `/uploads/site/${file.filename}` })
})

router.get('/:key', async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [req.params.key])
  if (!rows[0]) return res.status(404).json({ error: 'Настройки не найдены' })
  res.json(rows[0].value)
})

router.put('/:key', authMiddleware, async (req: Request, res: Response) => {
  await pool.query(
    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
    [req.params.key, JSON.stringify(req.body)]
  )
  res.json(req.body)
})

export default router
