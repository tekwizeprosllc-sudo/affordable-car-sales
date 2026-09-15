import { isAuthed } from '@/lib/auth'
import { listLeads, leadCounts } from '@/lib/db'
import { getSettingsWithDefaults } from '@/lib/settings'
import AdminLogin from '@/components/AdminLogin'
import AdminDashboard from '@/components/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Dashboard | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  if (!isAuthed()) return <AdminLogin />

  try {
    const [initialLeads, counts, settings] = await Promise.all([listLeads(), leadCounts(), getSettingsWithDefaults()])
    return <AdminDashboard initialLeads={initialLeads} counts={counts} settings={settings} />
  } catch (err) {
    return (
      <main className="grid min-h-screen place-items-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="panel max-w-md rounded-[6px] p-8">
          <h1 className="font-display text-xl font-black uppercase">Database not reachable</h1>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            The lead database could not be reached. Check that <code>DATABASE_URL</code> is set in this
            environment and that the Neon project is awake.
          </p>
          <p className="mt-3 break-words text-[12px]" style={{ color: 'var(--muted)' }}>
            {err.message}
          </p>
          <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--line)' }}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
              Dealer Tools
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <a href="/dealer-suite/messenger.html" target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold transition hover:text-crimson">
                → Messenger Simulator
              </a>
              <a href="/dealer-suite/board.html" target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold transition hover:text-crimson">
                → Lead &amp; Test-Drive Board
              </a>
              <a href="/dealer-suite/index.html" target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold transition hover:text-crimson">
                → Tools Hub
              </a>
            </div>
            <p className="mt-3 text-[11px]" style={{ color: 'var(--muted)' }}>
              These demo tools run without a database.
            </p>
          </div>
        </div>
      </main>
    )
  }
}
