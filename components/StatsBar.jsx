import { MapPin, HeartHandshake, ShieldCheck, Clock } from 'lucide-react';
import { DEALER } from '@/lib/site';

// Numbers we cannot source do not go on the page. "4.8 Google", "500+ happy
// customers" and "10+ years" were all unlinked claims; if the dealer supplies a
// review URL and real figures, these swap back to numbers with a citation.
const ITEMS = [
  { icon: MapPin, value: DEALER.city + ', OH', label: 'Family-run lot on Elliot Dr' },
  { icon: ShieldCheck, value: 'Inspected', label: 'Every car checked before it lists' },
  { icon: HeartHandshake, value: 'All Credit', label: 'Considered, subject to lender' },
  { icon: Clock, value: 'Mon–Sat', label: DEALER.hours.replace('Mon – Sat: ', '') },
];

export default function StatsBar() {
  return (
    <section
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-6 py-7 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={22} className="shrink-0" style={{ color: 'var(--muted)' }} />
            <div className="min-w-0">
              <div className="font-display text-[20px] font-black uppercase leading-none text-crimson">{value}</div>
              <div className="mt-1.5 text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
