import { Router, Request, Response } from 'express'
import multer from 'multer'
import { mkdirSync, unlinkSync } from 'fs'
import { resolve, extname } from 'path'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = resolve('./uploads/rooms')
    mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase()
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

router.get('/', async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM rooms ORDER BY id')
  res.json(rows)
})

router.get('/:id', async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Номер не найден' })
  res.json(rows[0])
})

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const body = req.body
  const sets: string[] = []
  const values: unknown[] = []
  let i = 1

  const scalar = ['type','name','description','shortDescription','area','capacity','floor',
    'priceMin','priceMax','priceLabel','available','totalRooms']
  const json = ['amenities','furniture','images']

  for (const key of scalar) {
    if (key in body) { sets.push(`"${key}" = $${i++}`); values.push(body[key]) }
  }
  for (const key of json) {
    if (key in body) { sets.push(`"${key}" = $${i++}`); values.push(JSON.stringify(body[key])) }
  }

  if (sets.length === 0) return res.status(400).json({ error: 'Нет полей для обновления' })
  values.push(req.params.id)

  await pool.query(`UPDATE rooms SET ${sets.join(', ')} WHERE id = $${i}`, values)
  const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id])
  res.json(rows[0])
})

router.post('/:id/images', authMiddleware, upload.array('images', 20), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files?.length) return res.status(400).json({ error: 'Нет файлов' })

  const { rows } = await pool.query('SELECT images FROM rooms WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Номер не найден' })

  const existing: string[] = rows[0].images || []
  const newImages = files.map(f => `/uploads/rooms/${f.filename}`)
  const updated = [...existing, ...newImages]

  await pool.query('UPDATE rooms SET images = $1 WHERE id = $2', [JSON.stringify(updated), req.params.id])
  res.json({ images: updated })
})

router.delete('/:id/images', authMiddleware, async (req: Request, res: Response) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'Не указан url' })

  const { rows } = await pool.query('SELECT images FROM rooms WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Номер не найден' })

  const images: string[] = (rows[0].images || []).filter((img: string) => img !== url)
  await pool.query('UPDATE rooms SET images = $1 WHERE id = $2', [JSON.stringify(images), req.params.id])

  try {
    const filename = url.replace('/uploads/rooms/', '')
    unlinkSync(resolve(`./uploads/rooms/${filename}`))
  } catch {}

  res.json({ images })
})

export default router
