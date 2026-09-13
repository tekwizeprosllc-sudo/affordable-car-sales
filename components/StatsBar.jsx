import { Users, Star, ShieldCheck, Heart } from 'lucide-react';

const ITEMS = [
  { icon: Users, value: '500+', label: 'Happy Customers' },
  { icon: Star, value: '4.8', label: 'Google Rating', stars: true },
  { icon: ShieldCheck, value: '10+', label: 'Years in Business' },
  { icon: Heart, value: '100%', label: 'Customer Focused' },
];

export default function StatsBar() {
  return (
    <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-6 py-7 md:grid-cols-4">
        {ITEMS.map(({ icon: Icon, value, label, stars }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon size={22} className="shrink-0" style={{ color: 'var(--muted)' }} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-[26px] font-black leading-none text-crimson">{value}</span>
                {stars && (
                  <span className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="fill-crimson text-crimson" />
                    ))}
                  </span>
                )}
              </div>
              <div className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
