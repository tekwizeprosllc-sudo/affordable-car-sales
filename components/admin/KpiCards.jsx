import { Users, MessageCircle, CalendarDays, Trophy, ArrowUp, ArrowDown } from 'lucide-react';

function waitLabel(min) {
  if (min < 60) return `${min}m`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}h`;
  return `${Math.floor(min / 1440)}d`;
}

function monthDelta(current, previous) {
  if (!previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${Math.abs(pct)}%`, up: pct >= 0, arrow: true, sub: 'vs. last month' };
}

// Supporting lines are only shown when they come straight from the data —
// nothing here is estimated or padded.
function supportFor(counts) {
  const c = counts || {};
  return {
    total: monthDelta(c.createdThisMonth || 0, c.createdLastMonth || 0) || (c.today ? { text: `+${c.today}`, up: true, sub: 'today' } : null),
    needsReply: c.overdueActions
      ? { text: `${c.overdueActions}`, bad: true, sub: 'follow-ups overdue' }
      : c.needsReply && c.oldestNewMinutes != null
        ? { text: waitLabel(c.oldestNewMinutes), bad: c.oldestNewMinutes >= 60, up: c.oldestNewMinutes < 60, sub: 'oldest waiting' }
        : null,
    drives: c.drivesNext7Days ? { text: `${c.drivesNext7Days}`, up: true, sub: 'in the next 7 days' } : null,
    sold: monthDelta(c.soldThisMonth || 0, c.soldLastMonth || 0),
  };
}

function Card({ icon: Icon, label, value, support, glow }) {
  const tone = support ? (support.bad ? '#ff4a42' : support.up ? '#3ed986' : '#ff4a42') : null;
  const Arrow = support?.up ? ArrowUp : ArrowDown;
  return (
    <div className="adm-card relative flex min-h-[96px] flex-col items-start gap-2 overflow-hidden px-3.5 py-3.5 sm:flex-row sm:items-center sm:gap-3.5 sm:px-[18px] sm:py-4">
      {glow && (
        <>
          <div
            className="pointer-events-none absolute -bottom-10 right-0 h-24 w-3/4"
            style={{ background: 'radial-gradient(60% 60% at 80% 60%, rgba(242,13,13,0.32), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-3 h-[2px] w-2/3"
            style={{ background: 'linear-gradient(90deg, transparent, #f20d0d)', boxShadow: '0 0 12px rgba(242,13,13,0.9)' }}
          />
        </>
      )}
      <span
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-[52px] sm:w-[52px]"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(242,13,13,0.2), rgba(242,13,13,0.07))',
          border: '1px solid rgba(242,13,13,0.2)',
        }}
      >
        <Icon size={24} strokeWidth={1.8} style={{ color: '#ff2a22' }} />
      </span>
      <div className="relative min-w-0">
        <p className="text-[14.5px] font-medium leading-tight text-[#e6eaed] min-[1600px]:text-[15px]">{label}</p>
        <div className="mt-1 flex items-end gap-3">
          <span className="font-display text-[36px] font-bold leading-[0.85] text-white sm:text-[42px]">{value}</span>
          {support && (
            <span className="pb-0.5 leading-tight">
              <span className="flex items-center gap-1 text-[15px] font-bold" style={{ color: tone }}>
                {support.arrow && <Arrow size={15} strokeWidth={2.6} />}
                {support.text}
              </span>
              <span className="block text-[12px] text-[#89939c]">{support.sub}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KpiCards({ counts }) {
  const s = supportFor(counts);
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
      <Card icon={Users} label="Total Leads" value={counts?.total ?? 0} support={s.total} />
      <Card icon={MessageCircle} label="Needs Reply" value={counts?.needsReply ?? 0} support={s.needsReply} />
      <Card icon={CalendarDays} label="Scheduled Test Drives" value={counts?.scheduledTestDrives ?? 0} support={s.drives} />
      <Card icon={Trophy} label="Sold This Month" value={counts?.soldThisMonth ?? 0} support={s.sold} glow />
    </div>
  );
}
