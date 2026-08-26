import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

export const db = new DatabaseSync(path.join(DATA_DIR, 'feriahub.db'))

export function initSchema() {
  const schema = fs.readFileSync(path.resolve(process.cwd(), 'db/schema.sql'), 'utf8')
  db.exec(schema)
}
