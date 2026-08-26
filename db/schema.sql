-- FeriaHub — Schema SQLite (MVP concierge)
-- Usuarios, perfiles de expositor, ferias/convocatorias, postulaciones, participaciones

PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'expositor' CHECK (rol IN ('expositor','organizador','admin')),
  nombre TEXT NOT NULL,
  creado_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS perfiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  rubro TEXT NOT NULL DEFAULT '',
  ciudad TEXT NOT NULL DEFAULT '',
  descripcion TEXT NOT NULL DEFAULT '',
  foto TEXT NOT NULL DEFAULT '',
  categorias TEXT NOT NULL DEFAULT '[]',      -- JSON array
  pct_perfil INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ferias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizador_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  ciudad TEXT NOT NULL DEFAULT '',
  fecha TEXT NOT NULL DEFAULT '',
  lugar TEXT NOT NULL DEFAULT '',
  rubros TEXT NOT NULL DEFAULT '[]',          -- JSON array
  estado TEXT NOT NULL DEFAULT 'abierta' CHECK (estado IN ('abierta','cerrada','proxima')),
  cupos INTEGER NOT NULL DEFAULT 0,
  requisitos TEXT NOT NULL DEFAULT '',
  creado_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS postulaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expositor_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  feria_id INTEGER NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'recibida' CHECK (estado IN ('recibida','en_revision','aceptada','rechazada','en_espera')),
  snapshot TEXT NOT NULL DEFAULT '{}',        -- snapshot inmutable del perfil al postular
  observacion TEXT NOT NULL DEFAULT '',
  creado_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (expositor_id, feria_id)
);

CREATE TABLE IF NOT EXISTS participaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expositor_id INTEGER NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  feria_id INTEGER NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  asistio INTEGER NOT NULL DEFAULT 0,
  confirmada_por INTEGER REFERENCES usuarios(id),
  confirmada_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (expositor_id, feria_id)
);
