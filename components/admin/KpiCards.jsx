import { Users, MessageSquare, CalendarCheck, Trophy } from 'lucide-react';

export default function KpiCards({ counts }) {
  const cards = [
    { icon: Users, label: 'Total Leads', value: counts?.total ?? 0, sub: counts?.today ? `+${counts.today} today` : null, accent: '#E10600' },
    { icon: MessageSquare, label: 'Needs Reply', value: counts?.needsReply ?? 0, sub: null, accent: '#E10600' },
    { icon: CalendarCheck, label: 'Scheduled Test Drives', value: counts?.scheduledTestDrives ?? 0, sub: null, accent: '#3D8BE8' },
    { icon: Trophy, label: 'Sold This Month', value: counts?.soldThisMonth ?? 0, sub: null, accent: '#2FA96B' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ icon: Icon, label, value, sub, accent }) => (
        <div key={label} className="panel flex items-center gap-3 rounded-[6px] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[5px]" style={{ background: `${accent}1a`, color: accent }}>
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[26px] font-black leading-none">{value}</p>
            <p className="mt-1 truncate text-[10.5px] font-extrabold uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>
              {label}
            </p>
            {sub && (
              <p className="mt-0.5 text-[10.5px] font-bold" style={{ color: '#2FA96B' }}>
                {sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
