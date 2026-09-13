import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
let db

function init() {
  if (db) return db
  fs.mkdirSync(DATA_DIR, { recursive: true })
  db = new Database(path.join(DATA_DIR, 'crm.db'))
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      vehicle_id TEXT,
      vehicle_title TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      trade_details TEXT,
      credit_range TEXT,
      source TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
  `)
  return db
}

export const LEAD_TYPES = ['test_drive', 'vehicle_inquiry', 'financing', 'trade_in', 'contact']
export const LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'won', 'closed']

export function createLead(input) {
  const d = init()
  const now = new Date().toISOString()
  const row = {
    type: input.type,
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    message: input.message || null,
    vehicle_id: input.vehicleId || null,
    vehicle_title: input.vehicleTitle || null,
    preferred_date: input.preferredDate || null,
    preferred_time: input.preferredTime || null,
    trade_details: input.tradeDetails || null,
    credit_range: input.creditRange || null,
    source: input.source || null,
    created_at: now,
    updated_at: now,
  }
  const stmt = d.prepare(`
    INSERT INTO leads (type, name, email, phone, message, vehicle_id, vehicle_title,
      preferred_date, preferred_time, trade_details, credit_range, source, created_at, updated_at)
    VALUES (@type, @name, @email, @phone, @message, @vehicle_id, @vehicle_title,
      @preferred_date, @preferred_time, @trade_details, @credit_range, @source, @created_at, @updated_at)
  `)
  const info = stmt.run(row)
  return { id: info.lastInsertRowid, ...row }
}

export function listLeads({ status, type, limit = 200 } = {}) {
  const d = init()
  const where = []
  const params = {}
  if (status) {
    where.push('status = @status')
    params.status = status
  }
  if (type) {
    where.push('type = @type')
    params.type = type
  }
  const sql = `SELECT * FROM leads ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT @limit`
  return d.prepare(sql).all({ ...params, limit })
}

export function updateLead(id, { status, notes }) {
  const d = init()
  const current = d.prepare('SELECT * FROM leads WHERE id = ?').get(id)
  if (!current) return null
  d.prepare('UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?').run(
    status ?? current.status,
    notes ?? current.notes,
    new Date().toISOString(),
    id
  )
  return d.prepare('SELECT * FROM leads WHERE id = ?').get(id)
}

export function leadCounts() {
  const d = init()
  const byStatus = d.prepare('SELECT status, COUNT(*) n FROM leads GROUP BY status').all()
  const byType = d.prepare('SELECT type, COUNT(*) n FROM leads GROUP BY type').all()
  const total = d.prepare('SELECT COUNT(*) n FROM leads').get().n
  const today = d
    .prepare("SELECT COUNT(*) n FROM leads WHERE date(created_at) = date('now')")
    .get().n
  return { total, today, byStatus, byType }
}
