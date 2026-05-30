import { Router, Request, Response } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

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

export default router
