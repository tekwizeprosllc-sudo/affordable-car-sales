import { NextResponse } from 'next/server'
import { listLeads, updateLead, LEAD_STATUSES } from '@/lib/db'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const leads = await listLeads({
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
  })
  return NextResponse.json({ leads })
}

export async function PATCH(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, notes } = await request.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'Missing lead id.' }, { status: 400 })
  if (status && !LEAD_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Unknown status.' }, { status: 400 })
  }

  const lead = await updateLead(id, { status, notes: typeof notes === 'string' ? notes.slice(0, 2000) : undefined })
  if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, lead })
}
