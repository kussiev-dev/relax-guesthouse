import { Router, Request, Response } from 'express'
import db, { parseRoom } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM rooms').all() as Record<string, unknown>[]
  res.json(rows.map(parseRoom))
})

router.get('/:id', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined
  if (!row) return res.status(404).json({ error: 'Номер не найден' })
  res.json(parseRoom(row))
})

router.put('/:id', authMiddleware, (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Номер не найден' })

  const body = req.body
  const fields: string[] = []
  const values: unknown[] = []

  const allowed = ['type','name','description','shortDescription','area','capacity','floor',
    'priceMin','priceMax','priceLabel','available','totalRooms']

  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = ?`)
      values.push(key === 'available' ? (body[key] ? 1 : 0) : body[key])
    }
  }
  if ('amenities' in body) { fields.push('amenities = ?'); values.push(JSON.stringify(body.amenities)) }
  if ('furniture' in body) { fields.push('furniture = ?'); values.push(JSON.stringify(body.furniture)) }
  if ('images' in body)    { fields.push('images = ?');    values.push(JSON.stringify(body.images)) }

  if (fields.length === 0) return res.status(400).json({ error: 'Нет полей для обновления' })

  values.push(req.params.id)
  db.prepare(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id) as Record<string, unknown>
  res.json(parseRoom(updated))
})

export default router
