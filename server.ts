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

initSchema()

const app = express()
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/perfiles', perfilRoutes)
app.use('/api/ferias', feriaRoutes)
app.use('/api/postulaciones', postulacionRoutes)
app.use('/api/participaciones', participacionRoutes)

// Servir el frontend build (en producción)
const distPath = path.resolve(process.cwd(), 'app/dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('/{*path}', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

const PORT = Number(process.env.PORT || 3000)
app.listen(PORT, () => console.log(`FeriaHub API en http://localhost:${PORT}`))
