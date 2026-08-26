import jwt from 'jsonwebtoken'
import { db } from './db'

export const JWT_SECRET = process.env.JWT_SECRET || 'feriahub-dev-secret'

export type AuthUser = { id: number; email: string; rol: string; nombre: string }

// Ampliar el tipo Request de Express con req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

// Middleware: valida el token JWT y adjunta el usuario autenticado
export function requireAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' })
  }
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; email: string; rol: string; nombre: string }
    req.user = { id: Number(decoded.sub), email: decoded.email, rol: decoded.rol, nombre: decoded.nombre }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Middleware: solo permite cierto rol
export function requireRol(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' })
    if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'Sin permisos' })
    next()
  }
}

export function firmarToken(u: { id: number; email: string; rol: string; nombre: string }) {
  return jwt.sign({ sub: String(u.id), email: u.email, rol: u.rol, nombre: u.nombre }, JWT_SECRET, { expiresIn: '7d' })
}
