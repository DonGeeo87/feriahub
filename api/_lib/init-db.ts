import { initSchema, db } from './db'
import bcrypt from 'bcryptjs'

initSchema()
console.log('Schema inicializado')

// Seed: organizador demo + ferias demo para que el MVP no arranque vacío
const org = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('org@feriahub.cl')
if (!org) {
  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run('org@feriahub.cl', hash, 'organizador', 'FeriaHub Demo')
  const orgId = info.lastInsertRowid

  db.prepare('INSERT INTO ferias (organizador_id, nombre, ciudad, fecha, lugar, rubros, estado, cupos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(orgId, 'Feria Artesanal de Valparaíso', 'Valparaíso', '2026-11-14', 'Paseo Yugoslavo', JSON.stringify(['Artesanía', 'Cerámica', 'Textil']), 'abierta', 60)
  db.prepare('INSERT INTO ferias (organizador_id, nombre, ciudad, fecha, lugar, rubros, estado, cupos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(orgId, 'Mercado de Diseño Providencia', 'Santiago', '2026-12-05', 'Plaza de la Constitución', JSON.stringify(['Diseño', 'Moda', 'Artesanía']), 'abierta', 80)
  console.log('Seed: organizador demo + 2 ferias creados')
}

console.log('DB lista. Demo org: org@feriahub.cl / demo1234')
