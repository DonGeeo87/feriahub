import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db } from '../_lib/db'
import { firmarToken } from '../_lib/auth'

const router = Router()

// Registro de usuario (expositor u organizador)
router.post('/register', (req, res) => {
  const { email, password, nombre, rol = 'expositor' } = req.body || {}
  if (!email || !password || !nombre) return res.status(400).json({ error: 'email, password y nombre son obligatorios' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Email inválido' })
  if (password.length < 6) return res.status(400).json({ error: 'Password debe tener al menos 6 caracteres' })
  if (!['expositor', 'organizador'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' })

  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email)
  if (exists) return res.status(409).json({ error: 'El email ya está registrado' })

  const hash = bcrypt.hashSync(password, 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run(email, hash, rol, nombre)
  const userId = Number(info.lastInsertRowid)

  // Si es expositor, crear perfil vacío inicial
  if (rol === 'expositor') {
    db.prepare('INSERT INTO perfiles (usuario_id) VALUES (?)').run(userId)
  }

  const token = firmarToken({ id: userId, email, rol, nombre })
  res.status(201).json({ token, user: { id: userId, email, rol, nombre } })
})

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const row: any = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email)
  if (!row || !bcrypt.compareSync(password || '', row.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' })
  }
  const user = { id: row.id, email: row.email, rol: row.rol, nombre: row.nombre }
  const token = firmarToken(user)
  res.json({ token, user })
})

// Datos del usuario autenticado
router.get('/me', (req, res) => {
  const u: any = db.prepare('SELECT id, email, rol, nombre FROM usuarios WHERE id = ?').get(req.user!.id)
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado' })

  if (u.rol === 'expositor') {
    const perfil: any = db.prepare('SELECT * FROM perfiles WHERE usuario_id = ?').get(u.id)
    if (perfil) {
      perfil.categorias = JSON.parse(perfil.categorias || '[]')
      u.perfil = perfil
    }
  }
  res.json(u)
})

export default router
