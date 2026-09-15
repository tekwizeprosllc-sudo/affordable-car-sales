import { neon } from '@neondatabase/serverless'

export const LEAD_TYPES = ['test_drive', 'vehicle_inquiry', 'financing', 'trade_in', 'vehicle_request', 'contact']
export const LEAD_STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'no-show', 'won', 'lost']

const CONNECTION_STRING =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

let client
let schemaReady

// Tests inject an embedded Postgres here; production always uses Neon.
export function __setClient(injected) {
  client = injected
  schemaReady = undefined
}

let devClientPromise

// Local dev with no Neon project: run embedded Postgres against a file in
// data/ so the admin is clickable. Same SQL as production, never used there.
async function getDevClient() {
  if (!devClientPromise) {
    devClientPromise = (async () => {
      const { PGlite } = await import('@electric-sql/pglite')
      const pg = new PGlite('./data/pgdata')
      return { query: (text, params) => pg.query(text, params) }
    })()
  }
  return devClientPromise
}

async function getClient() {
  if (client) return client
  if (!CONNECTION_STRING) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL is not set. Add your Neon connection string to the environment.')
    }
    client = await getDevClient()
    return client
  }
  client = neon(CONNECTION_STRING)
  return client
}

// Neon's http client returns a bare array; pglite returns { rows }.
async function query(text, params = []) {
  const db = await getClient()
  const result = await db.query(text, params)
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
      // Additive columns for the lead-desk next-action system. IF NOT EXISTS
      // keeps this safe to re-run against a database that predates them.
      await query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action TEXT')
      await query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_action_due TIMESTAMPTZ')

      await query(`
        CREATE TABLE IF NOT EXISTS lead_events (
          id SERIAL PRIMARY KEY,
          lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
          kind TEXT NOT NULL,
          text TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
      await query('CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON lead_events (lead_id, created_at)')

      await query(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
    })().catch((err) => {
      schemaReady = undefined
      throw err
    })
  }
  return schemaReady
}

let vehicleSchemaReady

export async function ensureVehicleSchema() {
  if (!vehicleSchemaReady) {
    vehicleSchemaReady = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          year INTEGER, make TEXT NOT NULL, model TEXT NOT NULL, trim TEXT,
          price INTEGER, mileage INTEGER, body_type TEXT, drive TEXT,
          engine TEXT, trans TEXT, color TEXT, vin TEXT, stock TEXT,
          description TEXT, badges TEXT, photos TEXT,
          status TEXT NOT NULL DEFAULT 'live',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
      await query(`
        CREATE TABLE IF NOT EXISTS vehicle_overrides (
          vehicle_id TEXT PRIMARY KEY,
          status TEXT,
          hidden BOOLEAN,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `)
    })().catch((err) => {
      vehicleSchemaReady = undefined
      throw err
    })
  }
  return vehicleSchemaReady
}

export { query }

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
  const lead = rows[0]
  await addLeadEvent(lead.id, 'created', input.message || null).catch(() => {})
  return lead
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

export async function updateLead(id, { status, notes, nextAction, nextActionDue, clearNextAction } = {}) {
  await ensureSchema()
  const before = status ? (await query('SELECT status FROM leads WHERE id = $1', [id]))[0] : null
  const rows = await query(
    `UPDATE leads
     SET status = COALESCE($2, status),
         notes = COALESCE($3, notes),
         next_action = CASE WHEN $5 THEN NULL ELSE COALESCE($4, next_action) END,
         next_action_due = CASE WHEN $5 THEN NULL ELSE COALESCE($6, next_action_due) END,
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, status ?? null, notes ?? null, nextAction ?? null, !!clearNextAction, nextActionDue ?? null]
  )
  const lead = rows[0] || null
  if (lead && status && before && before.status !== status) {
    await addLeadEvent(id, 'status_change', `${before.status} → ${status}`).catch(() => {})
  }
  return lead
}

// Remove demo rows created by the "Simulate FB Reply" button. They carry a
// "(demo)" marker in source so real Facebook leads are never touched.
export async function deleteDemoLeads() {
  await ensureSchema()
  const rows = await query(`DELETE FROM leads WHERE source ILIKE '%(demo)%' RETURNING id`)
  return rows.length
}

export async function addLeadEvent(leadId, kind, text) {
  await ensureSchema()
  const rows = await query(
    `INSERT INTO lead_events (lead_id, kind, text) VALUES ($1, $2, $3) RETURNING *`,
    [leadId, kind, text ?? null]
  )
  return rows[0]
}

export async function listLeadEvents(leadId) {
  await ensureSchema()
  return query('SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at ASC, id ASC', [leadId])
}

export async function getSettings() {
  await ensureSchema()
  const rows = await query('SELECT key, value FROM settings')
  return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {})
}

export async function setSetting(key, value) {
  await ensureSchema()
  const rows = await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
     RETURNING *`,
    [key, value ?? null]
  )
  return rows[0]
}

export async function leadCounts() {
  await ensureSchema()
  const [totals] = await query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today,
            COUNT(*) FILTER (WHERE status = 'new')::int AS needs_reply,
            FLOOR(EXTRACT(EPOCH FROM now() - MIN(created_at) FILTER (WHERE status = 'new')) / 60)::int AS oldest_new_minutes,
            COUNT(*) FILTER (WHERE status = 'new' AND source ILIKE '%facebook%')::int AS facebook_needs_reply,
            COUNT(*) FILTER (
              WHERE status = 'scheduled' AND (type = 'test_drive' OR preferred_date IS NOT NULL)
            )::int AS scheduled_test_drives,
            COUNT(*) FILTER (
              WHERE status = 'won' AND date_trunc('month', updated_at) = date_trunc('month', now())
            )::int AS sold_this_month,
            COUNT(*) FILTER (
              WHERE status = 'won' AND date_trunc('month', updated_at) = date_trunc('month', now() - interval '1 month')
            )::int AS sold_last_month,
            COUNT(*) FILTER (WHERE date_trunc('month', created_at) = date_trunc('month', now()))::int AS created_this_month,
            COUNT(*) FILTER (
              WHERE date_trunc('month', created_at) = date_trunc('month', now() - interval '1 month')
            )::int AS created_last_month,
            COUNT(*) FILTER (
              WHERE next_action_due < now() AND status NOT IN ('won', 'lost')
            )::int AS overdue_actions,
            COUNT(*) FILTER (
              WHERE status = 'scheduled'
                AND preferred_date >= to_char(CURRENT_DATE, 'YYYY-MM-DD')
                AND preferred_date < to_char(CURRENT_DATE + 7, 'YYYY-MM-DD')
            )::int AS drives_next_7_days
     FROM leads`
  )
  const byStatus = await query('SELECT status, COUNT(*)::int AS n FROM leads GROUP BY status')
  const byType = await query('SELECT type, COUNT(*)::int AS n FROM leads GROUP BY type')
  return {
    total: totals?.total ?? 0,
    today: totals?.today ?? 0,
    needsReply: totals?.needs_reply ?? 0,
    oldestNewMinutes: totals?.oldest_new_minutes ?? null,
    facebookNeedsReply: totals?.facebook_needs_reply ?? 0,
    scheduledTestDrives: totals?.scheduled_test_drives ?? 0,
    soldThisMonth: totals?.sold_this_month ?? 0,
    soldLastMonth: totals?.sold_last_month ?? 0,
    createdThisMonth: totals?.created_this_month ?? 0,
    createdLastMonth: totals?.created_last_month ?? 0,
    overdueActions: totals?.overdue_actions ?? 0,
    drivesNext7Days: totals?.drives_next_7_days ?? 0,
    byStatus,
    byType,
  }
}
