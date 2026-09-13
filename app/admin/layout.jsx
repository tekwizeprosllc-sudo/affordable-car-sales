import { isAuthed } from '@/lib/auth'
import AdminNav from '@/components/AdminNav'

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }) {
  // Unauthenticated renders the bare login screen with no staff chrome.
  if (!isAuthed()) return children

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <AdminNav />
      {children}
    </div>
  )
}
