import { neon } from '@neondatabase/serverless'

export const LEAD_TYPES = ['test_drive', 'vehicle_inquiry', 'financing', 'trade_in', 'contact']
export const LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'won', 'closed']

const CONNECTION_STRING =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

let client
let schemaReady

// Tests inject an embedded Postgres here; production always uses Neon.
export function __setClient(injected) {
  client = injected
  schemaReady = undefined
}

function getClient() {
  if (client) return client
  if (!CONNECTION_STRING) {
    throw new Error('DATABASE_URL is not set. Add your Neon connection string to the environment.')
  }
  client = neon(CONNECTION_STRING)
  return client
}

// Neon's http client returns a bare array; pglite returns { rows }.
async function query(text, params = []) {
  const result = await getClient().query(text, params)
  return Array.isArray(result) ? result : result.rows
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
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
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
      await query('CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC, id DESC)')
      await query('CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)')
    })().catch((err) => {
      schemaReady = undefined
      throw err
    })
  }
  return schemaReady
}

export async function createLead(input) {
  await ensureSchema()
  const rows = await query(
    `INSERT INTO leads (type, name, email, phone, message, vehicle_id, vehicle_title,
       preferred_date, preferred_time, trade_details, credit_range, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      input.type,
      input.name,
      input.email || null,
      input.phone || null,
      input.message || null,
      input.vehicleId || null,
      input.vehicleTitle || null,
      input.preferredDate || null,
      input.preferredTime || null,
      input.tradeDetails || null,
      input.creditRange || null,
      input.source || null,
    ]
  )
  return rows[0]
}

export async function listLeads({ status, type, limit = 200 } = {}) {
  await ensureSchema()
  const conditions = []
  const params = []

  if (status) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }
  if (type) {
    params.push(type)
    conditions.push(`type = $${params.length}`)
  }
  params.push(limit)

  // id breaks ties: created_at defaults to now(), which is identical for rows
  // written in the same transaction, leaving plain timestamp ordering arbitrary.
  return query(
    `SELECT * FROM leads
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
     ORDER BY created_at DESC, id DESC
     LIMIT $${params.length}`,
    params
  )
}

export async function updateLead(id, { status, notes } = {}) {
  await ensureSchema()
  const rows = await query(
    `UPDATE leads
     SET status = COALESCE($2, status),
         notes = COALESCE($3, notes),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, status ?? null, notes ?? null]
  )
  return rows[0] || null
}

export async function leadCounts() {
  await ensureSchema()
  const [totals] = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today
     FROM leads`
  )
  const byStatus = await query('SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status')
  const byType = await query('SELECT type, COUNT(*)::int AS n FROM leads GROUP BY type')
  return { total: totals?.total ?? 0, today: totals?.today ?? 0, byStatus, byType }
}
