import { isAuthed } from '@/lib/auth'
import { leadCounts } from '@/lib/db'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }) {
  // Unauthenticated renders the bare login screen with no staff chrome.
  if (!isAuthed()) return children

  let counts = null
  try {
    counts = await leadCounts()
  } catch {
    counts = null
  }

  return <AdminShell counts={counts}>{children}</AdminShell>
}
