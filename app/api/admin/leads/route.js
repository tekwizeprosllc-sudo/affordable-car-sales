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

const NEXT_ACTIONS = ['Call', 'Text', 'Email', 'Follow Up', 'Schedule Test Drive', 'Send Photos', 'Confirm Availability', 'Other']

export async function PATCH(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status, notes, nextAction, nextActionDue, clearNextAction } = await request.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'Missing lead id.' }, { status: 400 })
  if (status && !LEAD_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Unknown status.' }, { status: 400 })
  }
  if (nextAction && !NEXT_ACTIONS.includes(nextAction)) {
    return NextResponse.json({ error: 'Unknown next action.' }, { status: 400 })
  }

  const lead = await updateLead(id, {
    status,
    notes: typeof notes === 'string' ? notes.slice(0, 2000) : undefined,
    nextAction: nextAction || undefined,
    nextActionDue: nextActionDue || undefined,
    clearNextAction: !!clearNextAction,
  })
  if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  return NextResponse.json({ ok: true, lead })
}
