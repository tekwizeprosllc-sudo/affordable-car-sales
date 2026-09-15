import { NextResponse } from 'next/server'
import { getVehicle } from '@/lib/inventory'
import { listOverrides } from '@/lib/vehicles'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Unlike the public site, staff need to see a vehicle regardless of whether
// it's hidden or marked sold — that's exactly the state they're here to check
// or change. getVehicle() already ignores overrides, so we just attach the
// current override alongside it.
export async function GET(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  try {
    const vehicle = await getVehicle(id)
    if (!vehicle) return NextResponse.json({ vehicle: null })

    let status = vehicle.status || 'live'
    if (!String(id).startsWith('m')) {
      const overrides = await listOverrides().catch(() => ({}))
      status = overrides[id]?.status || 'live'
    }
    return NextResponse.json({ vehicle: { ...vehicle, status } })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
