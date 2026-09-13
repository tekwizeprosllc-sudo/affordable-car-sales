// Verifies lib/db.js against a real Postgres engine (embedded PGlite), no network needed.
import { PGlite } from '@electric-sql/pglite'
import { __setClient, createLead, listLeads, updateLead, leadCounts } from '../lib/db.js'

const pg = new PGlite()
__setClient({ query: (text, params) => pg.query(text, params) })

let failures = 0
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n      expected ${JSON.stringify(expected)}\n      got      ${JSON.stringify(actual)}`}`)
}

const a = await createLead({
  type: 'test_drive',
  name: 'Dana Reyes',
  phone: '513-555-0142',
  email: 'dana@example.com',
  vehicleId: '24231537',
  vehicleTitle: '2012 Chevrolet Captiva Sport LTZ',
  preferredDate: '2026-09-20',
  preferredTime: 'Afternoon (12PM-4PM)',
  message: 'Check the brakes please',
  source: 'VDP 24231537',
})
check('insert returns row with id', typeof a.id === 'number' && a.id > 0, true)
check('insert defaults status to new', a.status, 'new')
check('insert keeps vehicle title', a.vehicle_title, '2012 Chevrolet Captiva Sport LTZ')
check('unset optional column is null', a.notes, null)
check('created_at populated', a.created_at instanceof Date || typeof a.created_at === 'string', true)

await createLead({ type: 'financing', name: 'Marcus Webb', phone: '513-555-0199', creditRange: 'Fair (600-659)' })
await createLead({ type: 'trade_in', name: 'Priya Shah', email: 'priya@example.com', tradeDetails: '2014 Accord' })

check('list returns all leads', (await listLeads()).length, 3)
check('filter by type', (await listLeads({ type: 'financing' })).map((l) => l.name), ['Marcus Webb'])
check('filter by status', (await listLeads({ status: 'new' })).length, 3)
check('limit is applied', (await listLeads({ limit: 2 })).length, 2)

const updated = await updateLead(a.id, { status: 'scheduled' })
check('update changes status', updated.status, 'scheduled')
check('update preserves other fields', updated.name, 'Dana Reyes')
check('update of missing id returns null', await updateLead(99999, { status: 'won' }), null)

const notesOnly = await updateLead(a.id, { notes: 'Called, left voicemail' })
check('notes-only update keeps status', [notesOnly.status, notesOnly.notes], ['scheduled', 'Called, left voicemail'])

const withoutStatus = await updateLead(a.id, {})
check('empty update is a no-op', [withoutStatus.status, withoutStatus.notes], ['scheduled', 'Called, left voicemail'])

check('status filter reflects update', (await listLeads({ status: 'scheduled' })).length, 1)

const counts = await leadCounts()
check('counts total', counts.total, 3)
check('counts today', counts.today, 3)
check('counts by status', counts.byStatus.sort((x, y) => x.status.localeCompare(y.status)), [
  { status: 'new', n: 2 },
  { status: 'scheduled', n: 1 },
])

const ordered = await listLeads()
check('newest first ordering', ordered[0].name, 'Priya Shah')

await pg.close()
console.log(failures === 0 ? '\nAll database checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
