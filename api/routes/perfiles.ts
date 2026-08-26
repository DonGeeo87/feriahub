import { Router } from 'express'
import { db } from '../_lib/db'
import { requireAuth } from '../_lib/auth'

const router = Router()
router.use(requireAuth)

// Obtener mi perfil de expositor
router.get('/mio', (req, res) => {
  const perfil: any = db.prepare('SELECT * FROM perfiles WHERE usuario_id = ?').get(req.user!.id)
  if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' })
  perfil.categorias = JSON.parse(perfil.categorias || '[]')
  res.json(perfil)
})

// Actualizar perfil de expositor
router.put('/mio', (req, res) => {
  if (req.user!.rol !== 'expositor') return res.status(403).json({ error: 'Solo expositores tienen perfil' })

  const { rubro, ciudad, descripcion, foto, categorias } = req.body || {}
  const catArr = Array.isArray(categorias) ? categorias : []
  const perfil: any = db.prepare('SELECT * FROM perfiles WHERE usuario_id = ?').get(req.user!.id)
  if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' })

  const pct = calcularPct({ rubro, ciudad, descripcion, foto, categorias: catArr })
  db.prepare(`UPDATE perfiles SET rubro=?, ciudad=?, descripcion=?, foto=?, categorias=?, pct_perfil=? WHERE id=?`)
    .run(rubro ?? perfil.rubro, ciudad ?? perfil.ciudad, descripcion ?? perfil.descripcion, foto ?? perfil.foto, JSON.stringify(catArr), pct, perfil.id)

  const actualizado: any = db.prepare('SELECT * FROM perfiles WHERE id = ?').get(perfil.id)
  actualizado.categorias = JSON.parse(actualizado.categorias || '[]')
  res.json(actualizado)
})

function calcularPct(p: { rubro?: string; ciudad?: string; descripcion?: string; foto?: string; categorias: any[] }) {
  let pts = 0
  if (p.rubro) pts += 25
  if (p.ciudad) pts += 25
  if (p.foto) pts += 25
  if (p.descripcion) pts += 15
  if (p.categorias?.length) pts += 10
  return pts
}

export default router
