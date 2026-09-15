'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, CalendarDays, Car, BookOpen, Settings, MapPin, Phone, Clock } from 'lucide-react';
import { ASSETS, DEALER } from '@/lib/site';

function NavItem({ href, label, icon: Icon, badge, active, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className="group relative flex h-[50px] items-center gap-3.5 rounded-[6px] px-4 text-[15px] font-medium transition"
      style={
        active
          ? {
              color: '#fff',
              background: 'linear-gradient(90deg, rgba(242,13,13,0.26), rgba(120,6,6,0.22) 55%, rgba(60,4,4,0.28))',
              border: '1px solid #f20d0d',
              boxShadow: '0 0 22px -4px rgba(242,13,13,0.55), inset 0 0 20px -8px rgba(242,13,13,0.55)',
            }
          : { color: '#c9d0d5', border: '1px solid transparent' }
      }
    >
      <Icon
        size={20}
        strokeWidth={1.8}
        className={active ? '' : 'transition group-hover:text-white'}
        style={{ color: active ? '#ff2a22' : '#aab3ba' }}
      />
      <span className="flex-1 transition group-hover:text-white">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span
          className="grid h-[22px] min-w-[22px] place-items-center rounded-full px-1.5 text-[11.5px] font-bold text-white"
          style={{ background: '#e10a07', boxShadow: '0 0 12px -2px rgba(242,13,13,0.7)' }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar({ counts, onNavigate }) {
  const pathname = usePathname() || '';

  const sections = [
    { href: '/admin', label: 'Dashboard', icon: Home, exact: true },
    { href: '/admin/leads', label: 'Leads', icon: Users, badge: counts?.needsReply },
    { href: '/admin/messenger', label: 'Messenger', icon: MessageCircle, badge: counts?.facebookNeedsReply },
    { href: '/admin/test-drives', label: 'Test Drives', icon: CalendarDays },
    { href: '/admin/inventory', label: 'Inventory', icon: Car },
    { href: '/admin/playbook', label: 'Playbook', icon: BookOpen },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className="adm-scroll flex h-full flex-col overflow-y-auto"
      style={{ background: 'var(--admin-sidebar)', borderRight: '1px solid var(--admin-border)' }}
    >
      <div className="px-5 pb-7 pt-6">
        <Link href="/admin" onClick={onNavigate} className="block" aria-label={`${DEALER.name} dashboard`}>
          <img src={ASSETS.logoDark} alt={DEALER.name} className="h-auto w-[214px] max-w-full" />
        </Link>
        <p className="mt-1.5 whitespace-nowrap pl-0.5 text-[7.5px] font-semibold tracking-[0.13em] text-[#aab3ba]">
          QUALITY VEHICLES. STRAIGHT ANSWERS.
        </p>
      </div>

      <nav className="flex flex-col gap-1.5 px-4" aria-label="Admin">
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

      <div className="mt-auto px-4 pb-6 pt-8">
        <div className="rounded-[7px] p-4" style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
          <div className="flex gap-3">
            <MapPin size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: '#ff2a22' }} />
            <div className="text-[13px] leading-snug">
              <p className="font-semibold text-white">{DEALER.name}</p>
              <p className="mt-0.5 text-[#c9d0d5]">{DEALER.address}</p>
              <p className="text-[#c9d0d5]">
                {DEALER.city}, {DEALER.state} {DEALER.zip}
              </p>
            </div>
          </div>
          <a href={DEALER.phoneHref} className="mt-4 flex items-center gap-3 text-[15px] font-bold text-white transition hover:text-[#ff4a42]">
            <Phone size={18} strokeWidth={1.8} style={{ color: '#ff2a22' }} />
            {DEALER.phone}
          </a>
          <div className="mt-4 flex gap-3 text-[12.5px] leading-snug text-[#c9d0d5]">
            <Clock size={18} strokeWidth={1.8} className="mt-0.5 shrink-0" style={{ color: '#ff2a22' }} />
            <div>
              <p>
                {DEALER.hoursDays} {DEALER.hoursTime}
              </p>
              <p>{DEALER.hoursWeekend}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 px-2">
          <div className="mb-4 h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(242,13,13,0.7), rgba(242,13,13,0))' }} />
          <p className="text-[12px] font-semibold leading-[1.9] tracking-[0.28em] text-[#d5dade]">
            QUALITY VEHICLES.
            <br />
            STRAIGHT ANSWERS.
            <br />
            REAL PEOPLE.
          </p>
        </div>
      </div>
    </aside>
  );
}
