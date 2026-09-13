import { isAuthed } from '@/lib/auth'
import { listLeads, leadCounts } from '@/lib/db'
import AdminLogin from '@/components/AdminLogin'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Leads | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  if (!isAuthed()) return <AdminLogin />

  return <AdminDashboard initialLeads={listLeads()} counts={leadCounts()} />
}
