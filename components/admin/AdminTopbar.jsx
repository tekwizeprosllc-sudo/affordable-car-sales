'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Plus, LogOut, ChevronDown, ExternalLink, Menu } from 'lucide-react';
import { useAdminSidebarToggle } from './AdminShell';

export default function AdminTopbar({ search, onSearch, searchPlaceholder, needsReplyCount, onNewLead }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const toggleSidebar = useAdminSidebarToggle();

  const today = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 md:px-6"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
    >
      <button
        onClick={toggleSidebar}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] transition hover:text-crimson lg:hidden"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
        aria-label="Toggle navigation"
      >
        <Menu size={16} />
      </button>

      <div
        className="flex min-w-0 flex-1 items-center gap-2 rounded-[5px] px-3"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
      >
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <input
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={searchPlaceholder || 'Search leads, customers, vehicles, or VIN…'}
          aria-label="Search"
          className="w-full bg-transparent py-2.5 text-[13px] outline-none placeholder:text-[color:var(--muted)]"
        />
      </div>

      <span className="hidden shrink-0 items-center gap-1.5 text-[12px] font-semibold md:flex" style={{ color: 'var(--muted)' }} suppressHydrationWarning>
        {today}
      </span>

      <button
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[4px] transition hover:text-crimson"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
        aria-label={`${needsReplyCount || 0} leads need a reply`}
        title={`${needsReplyCount || 0} leads need a reply`}
      >
        <Bell size={16} />
        {needsReplyCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-crimson px-1 text-[9px] font-extrabold text-white">
            {needsReplyCount}
          </span>
        )}
      </button>

      <button onClick={onNewLead} className="btn-red hidden shrink-0 py-2 text-[11px] sm:inline-flex">
        <Plus size={14} /> New Lead
      </button>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-[4px] py-1.5 pl-1.5 pr-2 transition hover:text-crimson"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson text-[11px] font-extrabold text-white">ST</span>
          <span className="hidden text-left text-[11px] font-bold uppercase tracking-[0.08em] sm:block" style={{ color: 'var(--muted)' }}>
            Staff
          </span>
          <ChevronDown size={13} style={{ color: 'var(--muted)' }} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-[5px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
            >
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-semibold transition hover:text-crimson"
                style={{ color: 'var(--muted)' }}
              >
                <ExternalLink size={13} /> View Site
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[12px] font-semibold transition hover:text-crimson"
                style={{ color: 'var(--muted)', borderTop: '1px solid var(--line)' }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
