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

router.post('/change-password', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Не авторизован' })

  let username: string
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET) as { username: string }
    username = payload.username
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' })
  }

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Заполните все поля' })
  if (newPassword.length < 6) return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' })

  const { rows } = await pool.query('SELECT * FROM admin WHERE username = $1', [username])
  if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' })

  const valid = await bcrypt.compare(currentPassword, rows[0].passwordHash)
  if (!valid) return res.status(400).json({ error: 'Текущий пароль неверен' })

  const hash = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE admin SET "passwordHash" = $1 WHERE username = $2', [hash, username])
  res.json({ success: true })
})

export default router
