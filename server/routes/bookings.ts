import { Router, Request, Response } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Public: create booking
router.post('/', async (req: Request, res: Response) => {
  const { guestName, phone, email, roomId, roomName, checkIn, checkOut, adults, children, comment } = req.body
  if (!guestName || !phone || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Заполните обязательные поля' })
  }
  if (new Date(checkIn) >= new Date(checkOut)) {
    return res.status(400).json({ error: 'Дата выезда должна быть позже даты заезда' })
  }
  const { rows: roomRows } = await pool.query('SELECT available FROM rooms WHERE id = $1', [parseInt(roomId)])
  if (!roomRows[0] || !roomRows[0].available) {
    return res.status(400).json({ error: 'Этот номер временно недоступен для бронирования' })
  }
  const totalDays = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  const id = generateId()
  await pool.query(
    `INSERT INTO bookings (id, "guestName", phone, email, "roomId", "roomName", "checkIn", "checkOut",
      adults, children, comment, status, "totalDays", "createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'pending',$12,$13)`,
    [id, guestName, phone, email || '', parseInt(roomId), roomName, checkIn, checkOut,
     parseInt(adults) || 1, parseInt(children) || 0, comment || '', totalDays, new Date().toISOString()]
  )
  res.status(201).json({ success: true, bookingId: id, message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' })
})

// Admin: get all bookings
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { status, roomId, search } = req.query
  const conditions: string[] = []
  const values: unknown[] = []
  let i = 1

  if (status)  { conditions.push(`status = $${i++}`); values.push(status) }
  if (roomId)  { conditions.push(`"roomId" = $${i++}`); values.push(parseInt(roomId as string)) }
  if (search) {
    conditions.push(`("guestName" ILIKE $${i} OR phone ILIKE $${i} OR email ILIKE $${i})`)
    values.push(`%${search}%`); i++
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await pool.query(`SELECT * FROM bookings ${where} ORDER BY "createdAt" DESC`, values)
  res.json(rows)
})

// Admin: calendar data
router.get('/calendar/data', authMiddleware, async (_req: Request, res: Response) => {
  const { rows } = await pool.query(
    `SELECT id, "roomId", "roomName", "checkIn", "checkOut", "guestName", status
     FROM bookings WHERE status IN ('confirmed', 'pending')`
  )
  res.json(rows)
})

// Admin: get one booking
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: 'Бронирование не найдено' })
  res.json(rows[0])
})

// Admin: update status
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const { status } = req.body
  if (!['pending','confirmed','cancelled','completed'].includes(status)) {
    return res.status(400).json({ error: 'Недопустимый статус' })
  }
  const { rowCount } = await pool.query(
    `UPDATE bookings SET status = $1, "updatedAt" = $2 WHERE id = $3`,
    [status, new Date().toISOString(), req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Бронирование не найдено' })
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
  res.json(rows[0])
})

// Admin: update booking
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { guestName, phone, email, roomId, roomName, checkIn, checkOut, adults, children, comment, status } = req.body
  const { rowCount } = await pool.query(
    `UPDATE bookings SET "guestName"=$1, phone=$2, email=$3, "roomId"=$4, "roomName"=$5,
      "checkIn"=$6, "checkOut"=$7, adults=$8, children=$9, comment=$10, status=$11, "updatedAt"=$12
     WHERE id = $13`,
    [guestName, phone, email, roomId, roomName, checkIn, checkOut,
     adults, children, comment, status, new Date().toISOString(), req.params.id]
  )
  if (!rowCount) return res.status(404).json({ error: 'Бронирование не найдено' })
  const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id])
  res.json(rows[0])
})

// Admin: delete booking
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { rowCount } = await pool.query('DELETE FROM bookings WHERE id = $1', [req.params.id])
  if (!rowCount) return res.status(404).json({ error: 'Бронирование не найдено' })
  res.json({ success: true })
})

export default router
