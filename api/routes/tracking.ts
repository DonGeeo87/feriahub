import { Router } from 'express'
import { db } from '../_lib/db'

const router = Router()

// Registro de evento de la landing (anónimo, sin auth)
router.post('/', (req, res) => {
  const { evento, extra = '' } = req.body || {}
  if (!evento || typeof evento !== 'string') return res.status(400).json({ error: 'evento es obligatorio' })
  db.prepare('INSERT INTO tracking_landing (evento, extra) VALUES (?, ?)').run(evento.slice(0, 60), String(extra).slice(0, 200))
  res.status(201).json({ ok: true })
})

export default router
