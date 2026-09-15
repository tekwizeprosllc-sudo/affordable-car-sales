import { isAuthed } from '@/lib/auth'
import { getSettingsWithDefaults } from '@/lib/settings'
import AdminLogin from '@/components/AdminLogin'
import AdminSettings from '@/components/admin/AdminSettings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default async function SettingsPage() {
  if (!isAuthed()) return <AdminLogin />

  const settings = await getSettingsWithDefaults()
  return <AdminSettings initialSettings={settings} />
}
