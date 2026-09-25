import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { getInventory } from '@/lib/inventory'
import { listManualVehicles } from '@/lib/vehicles'

export const dynamic = 'force-dynamic'
const VALID_VIN = /^[A-HJ-NPR-Z0-9]{17}$/
const clean = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null)
const positiveInt = (value) => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

export async function GET(_request, { params }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const vin = String(params.vin || '').trim().toUpperCase()
  if (!VALID_VIN.test(vin)) {
    return NextResponse.json({ error: 'Enter a valid 17-character VIN. I, O, and Q are not valid VIN letters.' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
      { cache: 'no-store', signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'AffordableCarSalesDemo/1.0' } }
    )
    if (!response.ok) throw new Error(`NHTSA returned HTTP ${response.status}`)
    const row = (await response.json()).Results?.[0]
    if (!row) throw new Error('NHTSA returned no VIN result.')

    const [scraped, manual] = await Promise.all([
      getInventory().catch(() => []),
      listManualVehicles().catch(() => []),
    ])
    const duplicate = [...scraped, ...manual].find((vehicle) => String(vehicle.vin || '').toUpperCase() === vin)
    const engine = [
      clean(row.DisplacementL) && `${clean(row.DisplacementL)}L`,
      clean(row.EngineCylinders) && `${clean(row.EngineCylinders)} cyl`,
      clean(row.EngineModel),
    ].filter(Boolean).join(' ')

    return NextResponse.json({
      vin, year: positiveInt(row.ModelYear), make: clean(row.Make), model: clean(row.Model),
      trim: clean(row.Trim), bodyType: clean(row.BodyClass), drive: clean(row.DriveType),
      engine: engine || null, trans: clean(row.TransmissionStyle), fuelType: clean(row.FuelTypePrimary),
      doors: positiveInt(row.Doors), cylinders: positiveInt(row.EngineCylinders),
      duplicate: duplicate ? { id: duplicate.id, title: [duplicate.year, duplicate.make, duplicate.model].filter(Boolean).join(' ') } : null,
      warning: row.ErrorCode && row.ErrorCode !== '0' ? row.ErrorText : null,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'VIN decoding failed.' }, { status: 502 })
  }
}