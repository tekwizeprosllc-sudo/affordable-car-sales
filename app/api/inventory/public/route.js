import { NextResponse } from 'next/server'
import { getPublicInventory } from '@/lib/inventory'

export const dynamic = 'force-dynamic'

// Trimmed shape for the Ava widget so she pitches cars that are actually on
// the lot. Keys match what her matcher expects (type/tags/price/miles).
function bodyToType(bodyType = '') {
  const t = bodyType.toLowerCase()
  if (t.includes('truck')) return 'truck'
  if (t.includes('suv') || t.includes('crossover')) return 'suv'
  if (t.includes('van') || t.includes('minivan')) return 'van'
  if (t.includes('coupe')) return 'coupe'
  if (t.includes('wagon')) return 'wagon'
  return 'sedan'
}

function tagsFor(v) {
  const tags = []
  const drive = (v.drive || '').toLowerCase()
  if (drive === '4wd' || drive === 'awd') tags.push(drive)
  if (v.mileage && v.mileage < 80000) tags.push('low miles')
  if (/v8/i.test(v.engine || '')) tags.push('v8')
  if (/turbo/i.test(v.engine || '')) tags.push('turbo')
  if (v.color) tags.push(v.color.toLowerCase())
  return tags
}

export async function GET() {
  const { vehicles } = await getPublicInventory()

  const cars = vehicles.map((v) => ({
    id: String(v.id),
    year: v.year,
    make: v.make,
    model: [v.model, v.trim].filter(Boolean).join(' '),
    price: v.price || 0,
    miles: v.mileage || 0,
    type: bodyToType(v.bodyType),
    tags: tagsFor(v),
    url: `/inventory/${v.id}`,
    // Built from the record, not written copy — she should not invent selling
    // points for a car nobody has described.
    hook: [
      v.drive && /4WD|AWD/i.test(v.drive) ? v.drive.toUpperCase() : null,
      v.mileage ? `${v.mileage.toLocaleString()} miles` : null,
      v.color ? v.color.toLowerCase() : null,
    ]
      .filter(Boolean)
      .join(', '),
  }))

  return NextResponse.json(
    { cars },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' } }
  )
}
