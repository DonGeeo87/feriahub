import { initSchema, db } from './db'
import bcrypt from 'bcryptjs'

initSchema()
console.log('Schema inicializado')

// ── Organizador demo + muchas ferias realistas (para que las demos se aprecien) ──
const org = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('org@feriahub.cl')
let orgId: number
if (org) {
  orgId = org.id as number
} else {
  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run('org@feriahub.cl', hash, 'organizador', 'FeriaHub Demo')
  orgId = Number(info.lastInsertRowid)
}

// Insertar ferias variadas (solo si no existen aún)
const feriasDemo = [
  { nombre: 'Feria Artesanal de Valparaíso', ciudad: 'Valparaíso', fecha: '2026-11-14', lugar: 'Paseo Yugoslavo', rubros: ['Artesanía', 'Cerámica', 'Textil'], estado: 'abierta', cupos: 60 },
  { nombre: 'Mercado de Diseño Providencia', ciudad: 'Santiago', fecha: '2026-11-22', lugar: 'Plaza de la Constitución', rubros: ['Diseño', 'Moda', 'Artesanía'], estado: 'abierta', cupos: 80 },
  { nombre: 'Feria Costumbrista de Pomaire', ciudad: 'Melipilla', fecha: '2026-11-28', lugar: 'Pueblo de Pomaire', rubros: ['Greda', 'Alfarería', 'Cocina'], estado: 'abierta', cupos: 100 },
  { nombre: 'Feria Navideña del Bicentenario', ciudad: 'Santiago', fecha: '2026-12-10', lugar: 'Parque Bicentenario', rubros: ['Regalos', 'Artesanía', 'Gastronomía'], estado: 'abierta', cupos: 120 },
  { nombre: 'Mercado de La Costa', ciudad: 'Viña del Mar', fecha: '2026-12-19', lugar: 'Costanera de Viña', rubros: ['Artesanía', 'Gastronomía', 'Textil'], estado: 'abierta', cupos: 60 },
  { nombre: 'Feria de Fiestas Patrias', ciudad: 'Valparaíso', fecha: '2026-09-18', lugar: 'Costanera', rubros: ['Cocina', 'Artesanía'], estado: 'cerrada', cupos: 90 },
  { nombre: 'Feria de Primavera de La Serena', ciudad: 'La Serena', fecha: '2026-10-25', lugar: 'Plaza de Armas', rubros: ['Floristería', 'Artesanía'], estado: 'cerrada', cupos: 50 },
  { nombre: 'Feria del Emprendimiento de Concepción', ciudad: 'Concepción', fecha: '2027-01-09', lugar: 'Plaza Independencia', rubros: ['Emprendimiento', 'Artesanía', 'Diseño'], estado: 'proxima', cupos: 100 },
  { nombre: 'Feria Gastronómica del Sur', ciudad: 'Temuco', fecha: '2027-02-13', lugar: 'Parque Estadio', rubros: ['Gastronomía', 'Cocina', 'Cerveza artesanal'], estado: 'proxima', cupos: 80 },
]

const countFerias = (db.prepare('SELECT COUNT(*) as n FROM ferias').get() as { n: number }).n
if (countFerias === 0) {
  const ins = db.prepare('INSERT INTO ferias (organizador_id, nombre, ciudad, fecha, lugar, rubros, estado, cupos, requisitos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  for (const f of feriasDemo) {
    ins.run(orgId, f.nombre, f.ciudad, f.fecha, f.lugar, JSON.stringify(f.rubros), f.estado, f.cupos, '')
  }
  console.log(`Seed: ${feriasDemo.length} ferias creadas`)
}

// ── Expositor demo + varios perfiles extra (para que la demo de postulaciones se vea rica) ──
const expo = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('expo@feriahub.cl')
let expoId: number
if (expo) {
  expoId = expo.id as number
} else {
  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run('expo@feriahub.cl', hash, 'expositor', 'Valentina Rojas')
  expoId = Number(info.lastInsertRowid)
  db.prepare('INSERT INTO perfiles (usuario_id, rubro, ciudad, descripcion, foto, categorias, pct_perfil) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(expoId, 'Cerámica artesanal', 'Valparaíso', 'Cerámica hecha a mano en gres y porcelana. Piezas utilitarias y decorativas.', 'VR', JSON.stringify(['Cerámica', 'Arte', 'Decoración']), 100)
  console.log('Seed: expositor demo creado (expo@feriahub.cl)')
}

// Perfiles extra de postulantes para que el panel organizador se vea real
const extraPerfiles = [
  { nombre: 'Marcela Ibáñez', rubro: 'Textil y tejido', ciudad: 'Santiago', cat: ['Textil', 'Tejido'], desc: 'Tejidos en lana natural, ponchos y accesorios.' },
  { nombre: 'Pedro Salinas', rubro: 'Alfarería en greda', ciudad: 'Valparaíso', cat: ['Greda', 'Alfarería'], desc: 'Cerámica tradicional chilena de Pomaire.' },
  { nombre: 'Camila Fuentes', rubro: 'Joyería artesanal', ciudad: 'Santiago', cat: ['Joyería', 'Arte'], desc: 'Joyas hechas a mano en cobre y plata.' },
]

for (const p of extraPerfiles) {
  const ex = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(`${p.nombre.toLowerCase().replace(/[^a-z]+/g,'')}@demo.cl`)
  if (ex) continue
  const hash = bcrypt.hashSync('demo1234', 10)
  const info = db.prepare('INSERT INTO usuarios (email, password_hash, rol, nombre) VALUES (?, ?, ?, ?)')
    .run(`${p.nombre.toLowerCase().replace(/[^a-z]+/g,'')}@demo.cl`, hash, 'expositor', p.nombre)
  const id = Number(info.lastInsertRowid)
  db.prepare('INSERT INTO perfiles (usuario_id, rubro, ciudad, descripcion, foto, categorias, pct_perfil) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, p.rubro, p.ciudad, p.desc, p.nombre.slice(0,2).toUpperCase(), JSON.stringify(p.cat), 90)
}
console.log('Seed: perfiles extra listos')

// ── Postulaciones demo en distintos estados (para que el organizador vea el flujo completo) ──
const feriasIds = db.prepare('SELECT id FROM ferias ORDER BY id').all() as { id: number }[]
const expositores = db.prepare(`SELECT p.id, u.nombre, p.rubro, p.ciudad, p.descripcion, p.foto, p.categorias
  FROM perfiles p JOIN usuarios u ON u.id = p.usuario_id`).all() as { id: number; nombre: string; rubro: string; ciudad: string; descripcion: string; foto: string; categorias: string }[]

// eliminar postulaciones demo previas para re-sembrar limpias
db.prepare('DELETE FROM postulaciones WHERE expositor_id IN (SELECT id FROM perfiles)').run()
db.prepare('DELETE FROM participaciones WHERE expositor_id IN (SELECT id FROM perfiles)').run()

const estadosSeq = ['aceptada', 'recibida', 'en_revision', 'rechazada', 'en_espera']
const insPost = db.prepare('INSERT INTO postulaciones (expositor_id, feria_id, estado, snapshot) VALUES (?, ?, ?, ?)')

expositores.forEach((ex, i) => {
  const feria = feriasIds[i % feriasIds.length] // rotar por ferias
  const estado = estadosSeq[i % estadosSeq.length]
  const snapshot = JSON.stringify({
    nombre: ex.nombre,
    rubro: ex.rubro,
    ciudad: ex.ciudad,
    descripcion: ex.descripcion,
    foto: ex.foto,
    categorias: JSON.parse(ex.categorias || '[]'),
  })
  insPost.run(ex.id, feria.id, estado, snapshot)

  // si está aceptada, generar una participación
  if (estado === 'aceptada') {
    db.prepare("INSERT INTO participaciones (expositor_id, feria_id, asistio, confirmada_at) VALUES (?, ?, 1, datetime('now'))")
      .run(ex.id, feria.id)
  }
})
console.log('Seed: postulaciones demo en todos los estados creadas')

console.log('DB lista. Demo org: org@feriahub.cl / demo1234 · Expo: expo@feriahub.cl / demo1234')
