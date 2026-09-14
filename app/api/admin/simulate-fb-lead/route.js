import { NextResponse } from 'next/server'
import { createLead } from '@/lib/db'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Demo helper: drops a realistic Facebook Messenger lead into the CRM so staff
// can show, live, how an auto-reply capture lands on the board and calendar.
// These are real rows (source=facebook) tagged in notes so they're easy to spot
// and clear later. This is a simulator — nothing here talks to Meta.

const PEOPLE = [
  { name: 'Marcus Webb', phone: '(513) 555-0142' },
  { name: 'Renee Alvarez', phone: '(513) 555-0177' },
  { name: 'Darnell Price', phone: '(513) 555-0119' },
  { name: 'Sofia Nguyen', phone: '(513) 555-0188' },
  { name: 'Terry Coleman', phone: '(513) 555-0134' },
]

const VEHICLES = [
  { id: '155443', title: '2023 Chevrolet Malibu LS' },
  { id: '185887', title: '2017 GMC Yukon SLT' },
  { id: '010895', title: '2019 Hyundai Tucson SE' },
  { id: '204411', title: '2020 Ford F-150 XLT' },
]

const ASKS = [
  'Is it still available?',
  'Can I test drive it Saturday?',
  "What's the out-the-door price?",
  'Do you take trade-ins on this one?',
]

const TIMES = ['Morning', 'Midday', 'Afternoon', 'Evening']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// A date in the next 1-6 days, as YYYY-MM-DD so it lands on the calendar.
function soonDate() {
  const d = new Date()
  d.setDate(d.getDate() + 1 + Math.floor(Math.random() * 6))
  return d.toISOString().slice(0, 10)
}

export async function POST() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const person = pick(PEOPLE)
  const vehicle = pick(VEHICLES)
  const ask = pick(ASKS)

  const lead = await createLead({
    type: 'test_drive',
    name: person.name,
    phone: person.phone,
    message: ask,
    vehicleId: vehicle.id,
    vehicleTitle: vehicle.title,
    preferredDate: soonDate(),
    preferredTime: pick(TIMES),
    source: 'facebook',
  })

  return NextResponse.json({ ok: true, lead })
}
