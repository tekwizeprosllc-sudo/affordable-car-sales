import { isAuthed } from '@/lib/auth'
import { listLeads } from '@/lib/db'
import AdminLogin from '@/components/AdminLogin'
import AdminTestDrives from '@/components/AdminTestDrives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Test Drives | Affordable Car Sales',
  robots: { index: false, follow: false },
}

const SCHEDULING_STATUSES = ['scheduled', 'showed', 'no-show']

export default async function TestDrivesPage() {
  if (!isAuthed()) return <AdminLogin />

  let leads = []
  let dbError = ''
  try {
    const all = await listLeads({ limit: 500 })
    leads = all.filter(
      (l) => l.type === 'test_drive' || SCHEDULING_STATUSES.includes(l.status) || /test drive/i.test(l.message || '')
    )
  } catch (err) {
    dbError = err.message
  }

  return <AdminTestDrives initialLeads={leads} dbError={dbError} />
}
