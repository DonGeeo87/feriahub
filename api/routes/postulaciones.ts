import { Router } from 'express'
import { db } from '../_lib/db'
import { requireAuth, requireRol } from '../_lib/auth'

const router = Router()
router.use(requireAuth)

// Mis postulaciones (expositor)
router.get('/mias', (req, res) => {
  const perfil: any = db.prepare('SELECT id FROM perfiles WHERE usuario_id = ?').get(req.user!.id)
  if (!perfil) return res.json([])
  const rows = db.prepare(`
    SELECT p.*, f.nombre as feria_nombre, f.ciudad as feria_ciudad, f.fecha as feria_fecha
    FROM postulaciones p JOIN ferias f ON f.id = p.feria_id
    WHERE p.expositor_id = ? ORDER BY p.creado_at DESC`).all(perfil.id) as any[]
  rows.forEach(r => { try { r.snapshot = JSON.parse(r.snapshot || '{}') } catch { r.snapshot = {} } })
  res.json(rows)
})

// Postular a una feria (expositor) — guarda snapshot inmutable del perfil
router.post('/', (req, res) => {
  if (req.user!.rol !== 'expositor') return res.status(403).json({ error: 'Solo expositores pueden postular' })
  const { feriaId } = req.body || {}
  if (!feriaId) return res.status(400).json({ error: 'feriaId es obligatorio' })

  const feria: any = db.prepare('SELECT * FROM ferias WHERE id = ?').get(feriaId)
  if (!feria) return res.status(404).json({ error: 'Feria no encontrada' })
  if (feria.estado === 'cerrada') return res.status(400).json({ error: 'La feria está cerrada' })

  const perfil: any = db.prepare('SELECT * FROM perfiles WHERE usuario_id = ?').get(req.user!.id)
  if (!perfil) return res.status(400).json({ error: 'Completa tu perfil antes de postular' })
  if (perfil.pct_perfil < 60) return res.status(400).json({ error: 'Completa al menos 60% de tu perfil antes de postular' })

  const existe = db.prepare('SELECT id FROM postulaciones WHERE expositor_id = ? AND feria_id = ?').get(perfil.id, feriaId)
  if (existe) return res.status(409).json({ error: 'Ya postulaste a esta feria' })

  const snapshot = {
    nombre: req.user!.nombre,
    rubro: perfil.rubro,
    ciudad: perfil.ciudad,
    descripcion: perfil.descripcion,
    categorias: JSON.parse(perfil.categorias || '[]'),
  }
  const info = db.prepare('INSERT INTO postulaciones (expositor_id, feria_id, estado, snapshot) VALUES (?, ?, ?, ?)')
    .run(perfil.id, feriaId, 'recibida', JSON.stringify(snapshot))
  const nueva = db.prepare('SELECT * FROM postulaciones WHERE id = ?').get(info.lastInsertRowid)
  res.status(201).json(nueva)
})

// Listar postulaciones de las ferias del organizador (panel admin)
router.get('/panel', requireRol('organizador'), (req, res) => {
  const rows = db.prepare(`
    SELECT p.id, p.estado, p.creado_at, p.snapshot,
           f.nombre as feria_nombre, f.id as feria_id,
           u.nombre AS expositor_nombre, pe.rubro AS expositor_rubro, pe.ciudad AS expositor_ciudad
    FROM postulaciones p
    JOIN ferias f ON f.id = p.feria_id
    JOIN perfiles pe ON pe.id = p.expositor_id
    JOIN usuarios u ON u.id = pe.usuario_id
    WHERE f.organizador_id = ? ORDER BY p.creado_at DESC`).all(req.user!.id) as any[]
  const out = rows.map(r => {
    let snap = {}
    try { snap = JSON.parse(r.snapshot || '{}') } catch { snap = {} }
    return { ...r, snapshot: snap }
  })
  res.json(out)
})

// Cambiar estado de una postulación (organizador)
router.patch('/:id/estado', requireRol('organizador'), (req, res) => {
  const { estado, observacion } = req.body || {}
  const validos = ['recibida', 'en_revision', 'aceptada', 'rechazada', 'en_espera']
  if (!validos.includes(estado)) return res.status(400).json({ error: 'Estado inválido' })

  const post: any = db.prepare(`
    SELECT p.*, f.organizador_id FROM postulaciones p JOIN ferias f ON f.id = p.feria_id WHERE p.id = ?`).get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Postulación no encontrada' })
  if (post.organizador_id !== req.user!.id) return res.status(403).json({ error: 'No administras esta feria' })

  db.prepare('UPDATE postulaciones SET estado = ?, observacion = COALESCE(?, observacion) WHERE id = ?')
    .run(estado, observacion || null, post.id)

  // Si se acepta, crear participación
  if (estado === 'aceptada') {
    db.prepare('INSERT OR IGNORE INTO participaciones (expositor_id, feria_id) VALUES (?, ?)')
      .run(post.expositor_id, post.feria_id)
  }
  const actualizada = db.prepare('SELECT * FROM postulaciones WHERE id = ?').get(post.id)
  res.json(actualizada)
})

export default router
