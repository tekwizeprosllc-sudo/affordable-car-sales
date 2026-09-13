import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';
import Logo from './Logo';
import { NAV, DEALER, ROUTES } from '@/lib/site';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-crimson to-transparent opacity-70" />
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo className="h-12" />
          <div className="mt-6 space-y-2.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-crimson" />
              {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
            </p>
            <a href={DEALER.phoneHref} className="flex items-center gap-2 transition hover:text-crimson">
              <Phone size={14} className="text-crimson" /> {DEALER.phone}
            </a>
            <p className="flex items-center gap-2">
              <Clock size={14} className="text-crimson" /> {DEALER.hours}
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-[13px] font-bold uppercase tracking-[0.2em]">Shop</h4>
          <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            {NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="transition hover:text-crimson">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-[13px] font-bold uppercase tracking-[0.2em]">Visit</h4>
          <ul className="space-y-2.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            <li>
              <Link href={ROUTES.contact} className="transition hover:text-crimson">
                Get Directions
              </Link>
            </li>
            <li>
              <Link href={ROUTES.inventory} className="transition hover:text-crimson">
                Browse All Vehicles
              </Link>
            </li>
            <li>
              <Link href={ROUTES.financing} className="transition hover:text-crimson">
                Get Pre-Approved
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-6 text-[11px] uppercase tracking-[0.14em]"
        style={{ borderTop: '1px solid var(--line)', color: 'var(--muted)' }}
      >
        <p>
          &copy; {new Date().getFullYear()} {DEALER.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
          </span>
          <span>{DEALER.hours}</span>
          <Link href={ROUTES.privacy} className="underline-offset-2 transition hover:text-crimson hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
