'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Plus, LogOut, ChevronDown, ExternalLink, Menu, CalendarDays } from 'lucide-react';
import { useAdmin } from './AdminShell';

// Pages that render the leads workspace filter live as you type; anywhere
// else, Enter jumps to the Leads page with the same query already applied.
const LIVE_SEARCH_PATHS = ['/admin', '/admin/leads', '/admin/messenger'];

export default function AdminTopbar() {
  const { search, setSearch, counts, toggleSidebar, openNewLead } = useAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';
  const liveSearch = LIVE_SEARCH_PATHS.includes(pathname);
  const needsReply = counts?.needsReply || 0;

  const today = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <header
      className="relative z-20 flex h-[64px] shrink-0 items-center gap-3 px-4 md:gap-5 md:px-6"
      style={{ background: '#080b0d', borderBottom: '1px solid var(--admin-border)' }}
    >
      <button
        onClick={toggleSidebar}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[5px] text-[#c9d0d5] transition hover:text-white lg:hidden"
        style={{ border: '1px solid var(--admin-border)' }}
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      <form
        className="flex h-[42px] min-w-0 flex-1 items-center gap-3 rounded-[6px] px-3.5 transition focus-within:border-[rgba(242,13,13,0.5)] md:max-w-[580px]"
        style={{ background: '#0b0f12', border: '1px solid var(--admin-border-strong)' }}
        onSubmit={(e) => {
          e.preventDefault();
          if (!liveSearch) router.push('/admin/leads');
        }}
        role="search"
      >
        <Search size={18} strokeWidth={1.8} className="shrink-0 text-[#89939c]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads, customers, vehicles, or VIN..."
          aria-label="Search leads, customers, vehicles, or VIN"
          className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-[#6f7880]"
        />
      </form>

      <div className="ml-auto flex shrink-0 items-center gap-2.5 sm:gap-4 md:gap-6">
        <span className="hidden items-center gap-2.5 text-[14px] font-medium text-[#e6eaed] xl:flex" suppressHydrationWarning>
          <CalendarDays size={19} strokeWidth={1.7} className="text-[#aab3ba]" />
          {today}
        </span>

        <Link
          href="/admin/leads"
          className="relative grid h-9 w-9 place-items-center text-[#c9d0d5] transition hover:text-white"
          aria-label={`${needsReply} lead${needsReply === 1 ? '' : 's'} need a reply`}
          title={`${needsReply} lead${needsReply === 1 ? '' : 's'} need a reply`}
        >
          <Bell size={21} strokeWidth={1.7} />
          {needsReply > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10.5px] font-bold text-white"
              style={{ background: '#e10a07', boxShadow: '0 0 0 2px #080b0d' }}
            >
              {needsReply}
            </span>
          )}
        </Link>

        <button onClick={openNewLead} className="adm-btn adm-btn-red h-[40px] w-[40px] px-0 text-[14px] sm:h-[42px] sm:w-auto sm:px-5" aria-label="New Lead">
          <Plus size={17} strokeWidth={2.4} /> <span className="hidden sm:inline">New Lead</span>
        </button>

        <div className="hidden h-9 w-px md:block" style={{ background: 'var(--admin-border)' }} />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 rounded-[6px] py-1 pl-1 pr-1 text-left transition hover:bg-white/[0.03]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Staff menu"
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-full text-[13px] font-semibold text-white"
              style={{ background: '#161c20', border: '1px solid var(--admin-border-strong)' }}
            >
              ST
            </span>
            <span className="hidden leading-tight md:block">
              <span className="block text-[14px] font-semibold text-white">Staff</span>
              <span className="block text-[12px] text-[#89939c]">Lead Desk</span>
            </span>
            <ChevronDown size={16} className="hidden text-[#89939c] md:block" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-[6px] py-1"
                style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border-strong)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.8)' }}
              >
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-[#d5dade] transition hover:bg-white/[0.04] hover:text-white"
                >
                  <ExternalLink size={15} /> View Site
                </Link>
                <button
                  onClick={logout}
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] text-[#d5dade] transition hover:bg-white/[0.04] hover:text-white"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
