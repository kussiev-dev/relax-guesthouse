import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'relax-guesthouse-secret-2024'

export interface AuthRequest extends Request {
  admin?: { username: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Не авторизован' })
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { username: string }
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Недействительный токен' })
  }
}

export { JWT_SECRET }
