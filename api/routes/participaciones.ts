import { Router } from 'express'
import { db } from '../_lib/db'
import { requireAuth } from '../_lib/auth'

const router = Router()
router.use(requireAuth)

// Mis participaciones y trayectoria (expositor)
router.get('/mias', (req, res) => {
  const perfil: any = db.prepare('SELECT id FROM perfiles WHERE usuario_id = ?').get(req.user!.id)
  if (!perfil) return res.json([])
  const rows = db.prepare(`
    SELECT part.*, f.nombre AS feria_nombre, f.ciudad AS feria_ciudad, f.fecha AS feria_fecha
    FROM participaciones part JOIN ferias f ON f.id = part.feria_id
    WHERE part.expositor_id = ? ORDER BY f.fecha DESC`).all(perfil.id)
  res.json(rows)
})

export default router
