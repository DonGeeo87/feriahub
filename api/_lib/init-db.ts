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

// Seed: expositor demo con perfil completo (para "ver demo sin registrarme")
const expo = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('expo@feriahub.cl')
if (!expo) {
  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run('expo@feriahub.cl', hash, 'expositor', 'Valentina Rojas')
  const expoId = Number(info.lastInsertRowid)
  db.prepare('INSERT INTO perfiles (usuario_id, rubro, ciudad, descripcion, foto, categorias, pct_perfil) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(expoId, 'Cerámica artesanal', 'Valparaíso', 'Cerámica hecha a mano en gres y porcelana. Piezas utilitarias y decorativas.', 'VR', JSON.stringify(['Cerámica', 'Arte', 'Decoración']), 100)
  console.log('Seed: expositor demo creado (expo@feriahub.cl)')
}

console.log('DB lista. Demo org: org@feriahub.cl / demo1234 · Expo: expo@feriahub.cl / demo1234')
