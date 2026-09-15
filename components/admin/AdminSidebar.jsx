'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, MessageCircle, CalendarCheck, Car, BookOpen, Settings, MapPin, Phone, Clock } from 'lucide-react';
import Logo from '../Logo';
import { DEALER } from '@/lib/site';

function NavItem({ href, label, icon: Icon, badge, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-center gap-3 rounded-[5px] px-3 py-2.5 text-[13px] font-bold uppercase tracking-[0.06em] transition"
      style={
        active
          ? {
              background: 'linear-gradient(90deg, rgba(225,6,0,0.22), rgba(225,6,0,0.06))',
              borderLeft: '3px solid #E10600',
              boxShadow: '0 0 22px -10px rgba(225,6,0,0.9)',
              color: '#fff',
            }
          : { borderLeft: '3px solid transparent', color: 'var(--muted)' }
      }
    >
      <Icon size={16} className={active ? 'text-crimson' : 'transition group-hover:text-crimson'} />
      <span className="flex-1">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span
          className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold"
          style={active ? { background: '#E10600', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--muted)' }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar({ counts, onNavigate }) {
  const pathname = usePathname();

  const sections = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/leads', label: 'Leads', icon: Users, badge: counts?.needsReply },
    { href: '/admin/messenger', label: 'Messenger', icon: MessageCircle, badge: counts?.facebookNeedsReply },
    { href: '/admin/test-drives', label: 'Test Drives', icon: CalendarCheck },
    { href: '/admin/inventory', label: 'Inventory', icon: Car },
    { href: '/admin/playbook', label: 'Playbook', icon: BookOpen },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}>
      <div className="px-5 pb-4 pt-6">
        <Link href="/admin" onClick={onNavigate}>
          <Logo className="h-10" />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {sections.map((s) => (
          <NavItem
            key={s.href}
            href={s.href}
            label={s.label}
            icon={s.icon}
            badge={s.badge}
            active={s.exact ? pathname === s.href : pathname.startsWith(s.href)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-[6px] p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <p className="font-display text-[13px] font-black uppercase tracking-[0.08em]">{DEALER.name}</p>
          <div className="mt-3 space-y-1.5 text-[11.5px]" style={{ color: 'var(--muted)' }}>
            <p className="flex items-start gap-1.5">
              <MapPin size={12} className="mt-0.5 shrink-0 text-crimson" />
              {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
            </p>
            <a href={DEALER.phoneHref} className="flex items-center gap-1.5 transition hover:text-crimson">
              <Phone size={12} className="text-crimson" /> {DEALER.phone}
            </a>
            <p className="flex items-start gap-1.5">
              <Clock size={12} className="mt-0.5 shrink-0 text-crimson" />
              <span>
                {DEALER.hours}
                <br />
                {DEALER.hoursWeekend}
              </span>
            </p>
          </div>
          <p className="mt-3 border-t pt-3 text-[9.5px] font-extrabold uppercase leading-relaxed tracking-[0.12em]" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            Quality Vehicles.
            <br />
            Straight Answers.
            <br />
            Real People.
          </p>
        </div>
      </div>
    </div>
  );
}
