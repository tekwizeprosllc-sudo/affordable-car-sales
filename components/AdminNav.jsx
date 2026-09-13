'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Users, CalendarCheck, Car, BookOpen } from 'lucide-react';
import Logo from './Logo';

const SECTIONS = [
  { href: '/admin', label: 'Leads', icon: Users },
  { href: '/admin/test-drives', label: 'Test Drives', icon: CalendarCheck },
  { href: '/admin/inventory', label: 'Inventory', icon: Car },
  { href: '/admin/playbook', label: 'Playbook', icon: BookOpen },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
    >
      <Link href="/admin" className="shrink-0">
        <Logo className="h-9" />
      </Link>

      <nav className="flex flex-wrap items-center gap-1">
        {SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-[3px] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition ${
                active ? 'bg-crimson text-white' : 'hover:text-crimson'
              }`}
              style={active ? undefined : { color: 'var(--muted)' }}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/" className="btn-ghost py-2 text-[11px]">
          View Site
        </Link>
        <button onClick={logout} className="btn-ghost py-2 text-[11px]">
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </header>
  );
}
