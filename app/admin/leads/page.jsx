import { isAuthed } from '@/lib/auth'
import { listLeads, leadCounts } from '@/lib/db'
import { getSettingsWithDefaults } from '@/lib/settings'
import AdminLogin from '@/components/AdminLogin'
import LeadsWorkspace from '@/components/admin/LeadsWorkspace'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Leads | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default async function AdminLeadsPage() {
  if (!isAuthed()) return <AdminLogin />

  const [initialLeads, counts, settings] = await Promise.all([listLeads(), leadCounts(), getSettingsWithDefaults()])
  return <LeadsWorkspace initialLeads={initialLeads} counts={counts} settings={settings} />
}
