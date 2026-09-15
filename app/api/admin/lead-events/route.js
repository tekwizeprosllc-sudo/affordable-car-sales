import { NextResponse } from 'next/server'
import { listLeadEvents, addLeadEvent } from '@/lib/db'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const KINDS = ['note', 'auto_reply', 'vehicle_status_change']

export async function GET(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const leadId = Number(searchParams.get('leadId'))
  if (!leadId) return NextResponse.json({ error: 'Missing leadId.' }, { status: 400 })
  const events = await listLeadEvents(leadId)
  return NextResponse.json({ events })
}

export async function POST(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { leadId, kind, text } = await request.json().catch(() => ({}))
  if (!leadId) return NextResponse.json({ error: 'Missing leadId.' }, { status: 400 })
  if (!KINDS.includes(kind)) return NextResponse.json({ error: 'Unknown event kind.' }, { status: 400 })
  if (!text || !String(text).trim()) return NextResponse.json({ error: 'Text is required.' }, { status: 400 })

  const event = await addLeadEvent(leadId, kind, String(text).slice(0, 2000))
  return NextResponse.json({ ok: true, event })
}
