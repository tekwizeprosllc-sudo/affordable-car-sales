import { getInventory } from './inventory'
import { listManualVehicles } from './vehicles'

// Small id → {stock, vin} map so the lead table can show a stock number under
// each vehicle and search can match stock/VIN. Leads only store vehicle_id and
// a title; this avoids a per-row lookup. The scrape is already cached upstream.
export async function getVehicleIndex() {
  const index = {}
  const [scraped, manual] = await Promise.all([
    getInventory().then((r) => r.vehicles).catch(() => []),
    listManualVehicles().catch(() => []),
  ])
  for (const v of [...scraped, ...manual]) {
    index[String(v.id)] = { stock: v.stock || null, vin: v.vin || null }
  }
  return index
}
