import { NextResponse } from 'next/server'
import { createLead, LEAD_TYPES } from '@/lib/db'

export const dynamic = 'force-dynamic'

const MAX = 2000

function clean(value, max = 200) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function typeFromIntent(intent) {
  const t = intent.toLowerCase()
  if (!t) return ''
  if (t.includes('trade')) return 'trade_in'
  if (t.includes('financ') || t.includes('approv') || t.includes('credit')) return 'financing'
  if (t.includes('drive') || t.includes('appointment') || t.includes('schedule')) return 'test_drive'
  if (t.includes('vehicle') || t.includes('car')) return 'vehicle_inquiry'
  return 'contact'
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 160)
  const phone = clean(body.phone, 40)

  // The Ava plugin posts {intent, vehicleLabel} rather than our {type,
  // vehicleTitle}. Accept both so dropping in a new build of the widget does
  // not need the vendor file edited.
  const intent = clean(body.intent, 120)
  const type = LEAD_TYPES.includes(clean(body.type, 40)) ? clean(body.type, 40) : typeFromIntent(intent)

  if (!type) {
    return NextResponse.json({ error: 'Unknown request type.' }, { status: 400 })
  }
  if (name.length < 2) {
    return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  }
  if (!email && !phone) {
    return NextResponse.json({ error: 'Add an email or a phone number so we can reach you.' }, { status: 400 })
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'That email address looks incomplete.' }, { status: 400 })
  }

  try {
    const lead = await createLead({
      type,
      name,
      email,
      phone,
      message: clean(body.message, MAX) || (intent ? `Asked Ava about: ${intent}` : ''),
      vehicleId: clean(body.vehicleId, 40),
      vehicleTitle: clean(body.vehicleTitle, 200) || clean(body.vehicleLabel, 200),
      preferredDate: clean(body.preferredDate, 40),
      preferredTime: clean(body.preferredTime, 40),
      tradeDetails: clean(body.tradeDetails, MAX),
      creditRange: clean(body.creditRange, 60),
      source: clean(body.source, 120),
    })
    return NextResponse.json({ ok: true, id: lead.id })
  } catch (err) {
    console.error('Lead save failed:', err)
    return NextResponse.json(
      { error: `We couldn’t save that just now. Please call us at (513) 424-0304.` },
      { status: 500 }
    )
  }
}
