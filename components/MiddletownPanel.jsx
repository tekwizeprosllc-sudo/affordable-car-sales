import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DEALER, ROUTES } from '@/lib/site';

export default function MiddletownPanel() {
  return (
    <aside className="relative isolate flex flex-col justify-between overflow-hidden px-7 py-10" style={{ background: 'var(--surface)' }}>
      <div className="absolute inset-0 -z-10 opacity-50">
        <svg viewBox="0 0 340 560" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="1" opacity="0.25" fill="none">
            <path d="M-20 110 L360 74" /><path d="M-20 196 L360 164" />
            <path d="M-20 280 L360 268" /><path d="M-20 366 L360 372" />
            <path d="M-20 452 L360 470" />
            <path d="M58 -20 L32 580" /><path d="M146 -20 L136 580" />
            <path d="M234 -20 L246 580" /><path d="M318 -20 L340 580" />
          </g>
          <g stroke="#E10600" strokeWidth="1.4" opacity="0.45" fill="none">
            <path d="M-20 280 L360 268" /><path d="M146 -20 L136 580" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_45%_at_42%_48%,rgba(225,6,0,0.2),transparent_70%)]" />

      <div className="flex items-start justify-between gap-4">
        <div className="relative mt-1 h-3 w-3">
          <span className="absolute inset-0 rounded-full bg-crimson" />
          <span className="absolute inset-0 animate-ping2 rounded-full bg-crimson" />
        </div>
        <div className="text-right">
          <div className="font-display text-[15px] font-bold uppercase tracking-[0.2em]">{DEALER.city}</div>
          <div className="font-display text-[15px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
            Ohio
          </div>
        </div>
      </div>

      <p className="my-8 -rotate-2 font-script text-[42px] leading-[0.95]">
        We&rsquo;re
        <br />
        From Here.
      </p>

      <div className="space-y-4">
        <div className="text-[11px] font-semibold tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
          {DEALER.coords.lat}
          <br />
          {DEALER.coords.lon}
        </div>
        <p className="font-display text-[15px] font-bold uppercase leading-snug tracking-[0.08em]">
          Real cars. Real people.
          <br />
          Same streets.
        </p>
        <Link href={ROUTES.about} className="btn-red w-full">
          Our Story <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
