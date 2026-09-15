import { isAuthed } from '@/lib/auth'
import { listLeads, leadCounts } from '@/lib/db'
import { getSettingsWithDefaults } from '@/lib/settings'
import AdminLogin from '@/components/AdminLogin'
import AdminMessenger from '@/components/admin/AdminMessenger'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Messenger | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default async function MessengerPage() {
  if (!isAuthed()) return <AdminLogin />

  const [initialLeads, counts, settings] = await Promise.all([listLeads(), leadCounts(), getSettingsWithDefaults()])
  return <AdminMessenger initialLeads={initialLeads} counts={counts} settings={settings} />
}
