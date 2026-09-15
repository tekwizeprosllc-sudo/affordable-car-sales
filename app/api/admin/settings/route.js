import { NextResponse } from 'next/server'
import { getSettings, setSetting } from '@/lib/db'
import { isAuthed } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const KEYS = ['facebookAutomationEnabled', 'defaultUnknownReply', 'testDriveLinkPattern', 'websiteBaseUrl']

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const entries = Object.entries(body).filter(([key]) => KEYS.includes(key))
  if (!entries.length) return NextResponse.json({ error: 'No recognized settings in request.' }, { status: 400 })

  for (const [key, value] of entries) {
    await setSetting(key, value === null || value === undefined ? null : String(value).slice(0, 500))
  }
  const settings = await getSettings()
  return NextResponse.json({ ok: true, settings })
}
