import { Router } from 'express'
import { db } from '../_lib/db'
import { requireAuth, requireRol } from '../_lib/auth'

const router = Router()
router.use(requireAuth)

// Listar ferias (públicas para autenticados). Filtros básicos por rubro/ciudad/estado
router.get('/', (req, res) => {
  const { rubro, ciudad, estado } = req.query
  let sql = 'SELECT * FROM ferias WHERE 1=1'
  const params: any[] = []
  if (estado) { sql += ' AND estado = ?'; params.push(estado) }
  if (ciudad) { sql += ' AND ciudad LIKE ?'; params.push(`%${ciudad}%`) }
  const rows = db.prepare(sql).all(...params) as any[]
  const resultado = rows.map(f => {
    f.rubros = JSON.parse(f.rubros || '[]')
    const count = db.prepare('SELECT COUNT(*) as n FROM postulaciones WHERE feria_id = ?').get(f.id) as any
    f.postulados = count.n
    if (rubro) {
      // filtra por rubro en JSON
      if (!f.rubros.includes(rubro)) return null
    }
    return f
  }).filter(Boolean)
  res.json(resultado)
})

// Detalle de una feria
router.get('/:id', (req, res) => {
  const f: any = db.prepare('SELECT * FROM ferias WHERE id = ?').get(req.params.id)
  if (!f) return res.status(404).json({ error: 'Feria no encontrada' })
  f.rubros = JSON.parse(f.rubros || '[]')
  const count = db.prepare('SELECT COUNT(*) as n FROM postulaciones WHERE feria_id = ?').get(f.id) as { n: number }
  f.postulados = count?.n ?? 0
  res.json(f)
})

// Crear feria (solo organizador)
router.post('/', requireRol('organizador'), (req, res) => {
  const { nombre, ciudad, fecha, lugar, rubros, estado, cupos, requisitos } = req.body || {}
  if (!nombre) return res.status(400).json({ error: 'nombre es obligatorio' })
  const rubArr = Array.isArray(rubros) ? rubros : []
  const info = db.prepare(`INSERT INTO ferias (organizador_id, nombre, ciudad, fecha, lugar, rubros, estado, cupos, requisitos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user!.id, nombre, ciudad || '', fecha || '', lugar || '', JSON.stringify(rubArr), estado || 'abierta', cupos || 0, requisitos || '')
  const creada: any = db.prepare('SELECT * FROM ferias WHERE id = ?').get(info.lastInsertRowid)
  creada.rubros = JSON.parse(creada.rubros || '[]')
  res.status(201).json(creada)
})

export default router
