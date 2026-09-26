import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { listManualVehicles, createVehicle, updateVehicle, deleteVehicle, setOverride } from '@/lib/vehicles'
import { getInventory } from '@/lib/inventory'

export const dynamic = 'force-dynamic'

function guard() {
  return isAuthed() ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  const denied = guard()
  if (denied) return denied
  try {
    return NextResponse.json({ vehicles: await listManualVehicles() })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  const denied = guard()
  if (denied) return denied

  const body = await request.json().catch(() => ({}))
  if (!body.make || !body.model) {
    return NextResponse.json({ error: 'Make and model are required.' }, { status: 400 })
  }

  try {
    const vin = body.vin ? String(body.vin).trim().toUpperCase() : null
    if (vin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
      return NextResponse.json({ error: 'Enter a valid 17-character VIN.' }, { status: 400 })
    }
    if (vin) {
      const [manualResult, inventory] = await Promise.all([
        listManualVehicles(),
        getInventory().catch(() => ({ vehicles: [] })),
      ])
      const manual = Array.isArray(manualResult) ? manualResult : []
      const scraped = Array.isArray(inventory?.vehicles) ? inventory.vehicles : []
      if ([...manual, ...scraped].some((vehicle) => String(vehicle.vin || '').toUpperCase() === vin)) {
        return NextResponse.json({ error: 'This VIN is already in inventory.' }, { status: 409 })
      }
    }
    const vehicle = await createVehicle({
      year: Number(body.year) || null,
      make: String(body.make).slice(0, 60),
      model: String(body.model).slice(0, 60),
      trim: body.trim ? String(body.trim).slice(0, 60) : null,
      price: Number(body.price) || null,
      mileage: Number(body.mileage) || null,
      bodyType: body.bodyType || null,
      drive: body.drive || null,
      engine: body.engine || null,
      trans: body.trans || null,
      fuelType: body.fuelType || null,
      doors: Number(body.doors) || null,
      cylinders: Number(body.cylinders) || null,
      color: body.color || null,
      vin,
      stock: body.stock || null,
      purchaseCost: Number(body.purchaseCost) || null,
      reconditioningCost: Number(body.reconditioningCost) || null,
      dealerFees: Number(body.dealerFees) || null,
      warrantyCost: Number(body.warrantyCost) || null,
      interestRate: body.interestRate === '' || body.interestRate == null ? null : Number(body.interestRate),
      description: body.description ? String(body.description).slice(0, 4000) : null,
      badges: Array.isArray(body.badges) ? body.badges.slice(0, 6) : [],
      photos: Array.isArray(body.photos) ? body.photos.slice(0, 8) : [],
      status: body.status,
    })
    return NextResponse.json({ ok: true, vehicle })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  const denied = guard()
  if (denied) return denied

  const body = await request.json().catch(() => ({}))
  try {
    // Scraped rows carry the upstream id and can only take an override.
    if (body.scrapedId) {
      const row = await setOverride(body.scrapedId, { status: body.status, hidden: body.hidden })
      return NextResponse.json({ ok: true, override: row })
    }
    if (!body.id) return NextResponse.json({ error: 'Missing vehicle id.' }, { status: 400 })
    const vehicle = await updateVehicle(body.id, body)
    if (!vehicle) return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 })
    return NextResponse.json({ ok: true, vehicle })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  const denied = guard()
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing vehicle id.' }, { status: 400 })

  try {
    const removed = await deleteVehicle(id)
    return NextResponse.json({ ok: removed })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
