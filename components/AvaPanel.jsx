'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, Repeat, DollarSign, MapPin, User, Send } from 'lucide-react';
import { ASSETS, ROUTES } from '@/lib/site';

const ACTIONS = [
  { icon: Search, label: 'Search Inventory', href: ROUTES.inventory },
  { icon: Calendar, label: 'Schedule Test Drive', href: `${ROUTES.inventory}?intent=test-drive` },
  { icon: Repeat, label: 'Trade-In Review', href: ROUTES.tradeIn },
  { icon: DollarSign, label: 'Financing Questions', href: ROUTES.financing },
  { icon: MapPin, label: 'Hours & Location', href: ROUTES.contact },
  { icon: User, label: 'Talk to a Real Person', href: ROUTES.contact },
];

export default function AvaPanel() {
  const [question, setQuestion] = useState('');
  const href = question.trim()
    ? `${ROUTES.contact}?q=${encodeURIComponent(question.trim())}`
    : ROUTES.contact;

  return (
    <div
      className="relative overflow-hidden rounded-[6px] shadow-lift"
      style={{ background: 'var(--surface)', border: '1px solid rgba(225,6,0,0.45)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_85%_10%,rgba(225,6,0,0.22),transparent_65%)]" />

      <div className="relative grid grid-cols-[1fr_auto] items-start gap-3 p-5 pb-0">
        <div>
          <p className="font-script text-[34px] leading-none text-crimson">Ava</p>
          <p className="mt-1 font-display text-[13px] font-bold uppercase tracking-[0.14em]">
            Your Car Buying Concierge
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Online · Here to help
          </p>
        </div>
        <img
          src={ASSETS.ava}
          alt="Ava, car buying concierge"
          className="h-[120px] w-[92px] rounded-[4px] object-cover object-top"
        />
      </div>

      <div className="relative px-5 pt-4">
        <div className="rounded-[5px] p-3.5 text-[12.5px] leading-relaxed" style={{ background: 'var(--surface-2)' }}>
          <p className="font-semibold">Hi there! 👋</p>
          <p className="mt-1" style={{ color: 'var(--muted)' }}>
            I can help you find the right vehicle, answer questions, schedule a test drive, and more.
          </p>
          <p className="mt-2 font-semibold text-crimson">What would you like to do today?</p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 p-5">
        {ACTIONS.map(({ icon: Icon, label, href: to }) => (
          <Link
            key={label}
            href={to}
            className="flex items-center gap-2 rounded-[4px] px-3 py-2.5 text-[11.5px] font-semibold transition hover:text-crimson"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
          >
            <Icon size={13} className="shrink-0 text-crimson" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>

      <div className="relative flex gap-2 px-5 pb-5">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="field"
          placeholder="Ask Ava anything…"
          aria-label="Ask Ava a question"
        />
        <Link
          href={href}
          aria-label="Send question"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crimson text-white transition hover:bg-crimson-600"
        >
          <Send size={15} />
        </Link>
      </div>
    </div>
  );
}
