import { Router, Request, Response } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// Public: create booking request
router.post('/', (req: Request, res: Response) => {
  const { guestName, phone, email, roomId, roomName, checkIn, checkOut, adults, children, comment } = req.body
  if (!guestName || !phone || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Заполните обязательные поля' })
  }
  if (new Date(checkIn) >= new Date(checkOut)) {
    return res.status(400).json({ error: 'Дата выезда должна быть позже даты заезда' })
  }
  const totalDays = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
  const id = generateId()
  db.prepare(`
    INSERT INTO bookings (id, guestName, phone, email, roomId, roomName, checkIn, checkOut,
      adults, children, comment, status, totalDays, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(id, guestName, phone, email || '', parseInt(roomId), roomName, checkIn, checkOut,
         parseInt(adults) || 1, parseInt(children) || 0, comment || '', totalDays, new Date().toISOString())

  res.status(201).json({ success: true, bookingId: id, message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.' })
})

// Admin: get all bookings with filters
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const { status, roomId, search } = req.query
  let sql = 'SELECT * FROM bookings WHERE 1=1'
  const params: unknown[] = []

  if (status)  { sql += ' AND status = ?';  params.push(status) }
  if (roomId)  { sql += ' AND roomId = ?';  params.push(parseInt(roomId as string)) }
  if (search) {
    const s = `%${search}%`
    sql += ' AND (guestName LIKE ? OR phone LIKE ? OR email LIKE ?)'
    params.push(s, s, s)
  }
  sql += ' ORDER BY createdAt DESC'

  res.json(db.prepare(sql).all(...params))
})

// Admin: get booking by id
router.get('/calendar/data', authMiddleware, (_req: Request, res: Response) => {
  const rows = db.prepare(`
    SELECT id, roomId, roomName, checkIn, checkOut, guestName, status
    FROM bookings WHERE status IN ('confirmed', 'pending')
  `).all()
  res.json(rows)
})

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)
  if (!booking) return res.status(404).json({ error: 'Бронирование не найдено' })
  res.json(booking)
})

// Admin: update status
router.patch('/:id/status', authMiddleware, (req: Request, res: Response) => {
  const { status } = req.body
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Недопустимый статус' })

  const result = db.prepare(
    'UPDATE bookings SET status = ?, updatedAt = ? WHERE id = ?'
  ).run(status, new Date().toISOString(), req.params.id)

  if (result.changes === 0) return res.status(404).json({ error: 'Бронирование не найдено' })
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id))
})

// Admin: update booking
router.put('/:id', authMiddleware, (req: Request, res: Response) => {
  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Бронирование не найдено' })

  const { guestName, phone, email, roomId, roomName, checkIn, checkOut, adults, children, comment, status } = req.body
  db.prepare(`
    UPDATE bookings SET guestName=?, phone=?, email=?, roomId=?, roomName=?, checkIn=?, checkOut=?,
      adults=?, children=?, comment=?, status=?, updatedAt=? WHERE id=?
  `).run(guestName, phone, email, roomId, roomName, checkIn, checkOut,
         adults, children, comment, status, new Date().toISOString(), req.params.id)

  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id))
})

// Admin: delete booking
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Бронирование не найдено' })
  res.json({ success: true })
})

export default router
