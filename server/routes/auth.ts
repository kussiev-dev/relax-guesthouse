import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import { JWT_SECRET } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Введите логин и пароль' })

  const { rows } = await pool.query('SELECT * FROM admin WHERE username = $1', [username])
  const admin = rows[0] as { username: string; passwordHash: string; name: string } | undefined
  if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль' })

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Неверный логин или пароль' })

  const token = jwt.sign({ username: admin.username, name: admin.name }, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, name: admin.name })
})

router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Не авторизован' })
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string; name: string }
    res.json({ username: payload.username, name: payload.name })
  } catch {
    res.status(401).json({ error: 'Недействительный токен' })
  }
})

export default router
