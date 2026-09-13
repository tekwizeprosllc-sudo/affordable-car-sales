import { NextResponse } from 'next/server'
import { createLead, LEAD_TYPES } from '@/lib/db'

export const dynamic = 'force-dynamic'

const MAX = 2000

function clean(value, max = 200) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const type = clean(body.type, 40)
  const name = clean(body.name, 120)
  const email = clean(body.email, 160)
  const phone = clean(body.phone, 40)

  if (!LEAD_TYPES.includes(type)) {
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

  const lead = createLead({
    type,
    name,
    email,
    phone,
    message: clean(body.message, MAX),
    vehicleId: clean(body.vehicleId, 40),
    vehicleTitle: clean(body.vehicleTitle, 200),
    preferredDate: clean(body.preferredDate, 40),
    preferredTime: clean(body.preferredTime, 40),
    tradeDetails: clean(body.tradeDetails, MAX),
    creditRange: clean(body.creditRange, 60),
    source: clean(body.source, 120),
  })

  return NextResponse.json({ ok: true, id: lead.id })
}
