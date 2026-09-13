import { query, ensureVehicleSchema } from './db'

export const VEHICLE_STATUSES = ['live', 'pending', 'sold']

function toVehicle(row) {
  return {
    id: `m${row.id}`,
    manualId: row.id,
    source: 'manual',
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    price: row.price,
    mileage: row.mileage,
    bodyType: row.body_type,
    drive: row.drive,
    engine: row.engine,
    trans: row.trans,
    color: row.color,
    vin: row.vin,
    stock: row.stock,
    description: row.description,
    badges: row.badges ? row.badges.split('|').filter(Boolean) : [],
    status: row.status,
    photos: row.photos ? row.photos.split('|').filter(Boolean) : [],
    image: row.photos ? row.photos.split('|').filter(Boolean)[0] || null : null,
  }
}

export async function listManualVehicles() {
  await ensureVehicleSchema()
  const rows = await query('SELECT * FROM vehicles ORDER BY created_at DESC, id DESC')
  return rows.map(toVehicle)
}

export async function createVehicle(input) {
  await ensureVehicleSchema()
  const rows = await query(
    `INSERT INTO vehicles (year, make, model, trim, price, mileage, body_type, drive,
       engine, trans, color, vin, stock, description, badges, status, photos)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      input.year || null,
      input.make || '',
      input.model || '',
      input.trim || null,
      input.price || null,
      input.mileage || null,
      input.bodyType || null,
      input.drive || null,
      input.engine || null,
      input.trans || null,
      input.color || null,
      input.vin || null,
      input.stock || null,
      input.description || null,
      (input.badges || []).join('|') || null,
      VEHICLE_STATUSES.includes(input.status) ? input.status : 'live',
      (input.photos || []).join('|') || null,
    ]
  )
  return toVehicle(rows[0])
}

export async function updateVehicle(id, patch) {
  await ensureVehicleSchema()
  const rows = await query(
    `UPDATE vehicles SET
       year = COALESCE($2, year), make = COALESCE($3, make), model = COALESCE($4, model),
       trim = COALESCE($5, trim), price = COALESCE($6, price), mileage = COALESCE($7, mileage),
       body_type = COALESCE($8, body_type), status = COALESCE($9, status),
       description = COALESCE($10, description), photos = COALESCE($11, photos),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [
      id,
      patch.year ?? null,
      patch.make ?? null,
      patch.model ?? null,
      patch.trim ?? null,
      patch.price ?? null,
      patch.mileage ?? null,
      patch.bodyType ?? null,
      VEHICLE_STATUSES.includes(patch.status) ? patch.status : null,
      patch.description ?? null,
      patch.photos ? patch.photos.join('|') : null,
    ]
  )
  return rows[0] ? toVehicle(rows[0]) : null
}

export async function deleteVehicle(id) {
  await ensureVehicleSchema()
  const rows = await query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id])
  return rows.length > 0
}

// Scraped vehicles are read-only upstream, so staff decisions about them live
// here as overrides keyed by the scrape's vehicle id.
export async function listOverrides() {
  await ensureVehicleSchema()
  const rows = await query('SELECT * FROM vehicle_overrides')
  return rows.reduce((acc, r) => {
    acc[r.vehicle_id] = { status: r.status, hidden: r.hidden }
    return acc
  }, {})
}

export async function setOverride(vehicleId, { status, hidden }) {
  await ensureVehicleSchema()
  const rows = await query(
    `INSERT INTO vehicle_overrides (vehicle_id, status, hidden, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (vehicle_id) DO UPDATE
       SET status = COALESCE(EXCLUDED.status, vehicle_overrides.status),
           hidden = COALESCE(EXCLUDED.hidden, vehicle_overrides.hidden),
           updated_at = now()
     RETURNING *`,
    [String(vehicleId), VEHICLE_STATUSES.includes(status) ? status : null, typeof hidden === 'boolean' ? hidden : null]
  )
  return rows[0] || null
}
