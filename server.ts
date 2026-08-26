import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import { initSchema } from './api/_lib/db'
import authRoutes from './api/routes/auth'
import perfilRoutes from './api/routes/perfiles'
import feriaRoutes from './api/routes/ferias'
import postulacionRoutes from './api/routes/postulaciones'
import participacionRoutes from './api/routes/participaciones'
import trackingRoutes from './api/routes/tracking'

initSchema()

const app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// Proxy de la encuesta → backend de codigoguerrero.dev (evita CORS desde el origen feriahub)
const LEADS_TARGET = process.env.LEADS_TARGET || 'https://codigoguerrero.dev/api/leads'
app.post('/api/leads', async (req, res) => {
  try {
    const upstream = await fetch(LEADS_TARGET, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })
    const data = await upstream.json().catch(() => ({}))
    res.status(upstream.status).json(data)
  } catch {
    res.status(502).json({ error: 'No se pudo contactar el servidor de respuestas.' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/perfiles', perfilRoutes)
app.use('/api/ferias', feriaRoutes)
app.use('/api/postulaciones', postulacionRoutes)
app.use('/api/participaciones', participacionRoutes)
app.use('/api/tracking', trackingRoutes)

// Servir el frontend build (en producción)
const distPath = path.resolve(process.cwd(), 'app/dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  // catch-all para SPA (Express 4): sirve index.html para cualquier ruta no-API
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

const PORT = Number(process.env.PORT || 3000)
app.listen(PORT, () => console.log(`FeriaHub API en http://localhost:${PORT}`))
