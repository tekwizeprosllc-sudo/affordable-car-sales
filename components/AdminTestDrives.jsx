'use client';
import { useMemo, useState } from 'react';
import { Phone, Car, CalendarCheck, Loader2, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react';
import { CHANNELS, leadChannel } from '@/lib/leads';

const STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'no-show'];

const STATUS_COLORS = {
  new: '#E10600',
  contacted: '#E8A33D',
  scheduled: '#3D8BE8',
  showed: '#2FA96B',
  'no-show': '#7A7F87',
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function when(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Local YYYY-MM-DD, matching what an <input type="date"> stores (no timezone shift).
function isoDay(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function prettyDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function AdminTestDrives({ initialLeads, dbError }) {
  const [leads, setLeads] = useState(initialLeads || []);
  const [busy, setBusy] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [view, setView] = useState('calendar');
  const [cursor, setCursor] = useState(() => new Date());
  const todayIso = isoDay(new Date());
  const [selected, setSelected] = useState(todayIso);

  const byDay = useMemo(() => {
    const map = {};
    for (const l of leads) {
      if (l.preferred_date) (map[l.preferred_date] ||= []).push(l);
    }
    return map;
  }, [leads]);

  const undated = leads.filter((l) => !l.preferred_date).length;

  async function patch(id, body) {
    setBusy(id);
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    if (res.ok) {
      const { lead } = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
    }
    setBusy(null);
  }

  // Staff can type a time the customer did not pick; it is kept in notes so the
  // customer's own request stays intact.
  async function schedule(id) {
    const val = (drafts[id] || '').trim();
    if (!val) return;
    await patch(id, { status: 'scheduled', notes: `Scheduled: ${val}` });
    setDrafts((d) => ({ ...d, [id]: '' }));
  }

  // 6-week grid covering the cursor's month.
  const weeks = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
    return cells;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedLeads = byDay[selected] || [];

  function LeadCard({ lead }) {
    const ch = CHANNELS[leadChannel(lead.source)];
    return (
      <article className="panel rounded-[5px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-[2px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white"
                style={{ background: STATUS_COLORS[lead.status] || '#7A7F87' }}
              >
                {lead.status}
              </span>
              <span
                className="rounded-[2px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white"
                style={{ background: ch.color }}
              >
                {ch.label}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                requested {when(lead.created_at)}
              </span>
            </div>

            <h3 className="mt-2 font-display text-[19px] font-bold uppercase">{lead.name}</h3>

            {lead.phone && (
              <a
                href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                className="mt-1 flex items-center gap-1.5 text-[13px] transition hover:text-crimson"
              >
                <Phone size={13} className="text-crimson" /> {lead.phone}
              </a>
            )}

            {lead.vehicle_title && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold">
                <Car size={13} className="text-crimson" /> {lead.vehicle_title}
              </p>
            )}

            <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
              Customer asked for:{' '}
              {[lead.preferred_date, lead.preferred_time].filter(Boolean).join(' · ') || 'no time given'}
            </p>
            {lead.notes && <p className="mt-1 text-[12.5px] font-semibold text-accent">{lead.notes}</p>}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={busy === lead.id || lead.status === s}
                  onClick={() => patch(lead.id, { status: s })}
                  className="rounded-[3px] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] transition disabled:opacity-40"
                  style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={drafts[lead.id] || ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [lead.id]: e.target.value }))}
                className="field h-9 w-52 text-[12px]"
                placeholder="Sat 2pm"
                aria-label={`Set a time for ${lead.name}`}
              />
              <button
                onClick={() => schedule(lead.id)}
                disabled={busy === lead.id || !(drafts[lead.id] || '').trim()}
                className="btn-red h-9 py-0 text-[10px] disabled:opacity-45"
              >
                {busy === lead.id ? <Loader2 size={13} className="animate-spin" /> : <CalendarCheck size={13} />}
                Set
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-10 md:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase">Test Drives</h1>
          <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {leads.length} request{leads.length === 1 ? '' : 's'} · {leads.filter((l) => l.status === 'scheduled').length} scheduled
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-[4px] p-1" style={{ background: 'var(--surface-2)' }}>
          {[
            ['calendar', 'Calendar', CalendarDays],
            ['list', 'List', List],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] transition ${
                view === key ? 'bg-crimson text-white' : ''
              }`}
              style={view === key ? undefined : { color: 'var(--muted)' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {dbError && (
        <p className="panel rounded-[5px] p-4 text-[12.5px]" style={{ color: 'var(--muted)' }}>
          Database not reachable — set <code>DATABASE_URL</code>. ({dbError})
        </p>
      )}

      {!dbError && leads.length === 0 && (
        <div className="panel rounded-[5px] p-16 text-center">
          <p className="font-display text-xl font-bold uppercase">No test drives requested yet</p>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
            Requests from a vehicle page, from Ava, or from Facebook land here.
          </p>
        </div>
      )}

      {!dbError && leads.length > 0 && view === 'calendar' && (
        <div className="flex flex-col gap-6">
          <div className="panel rounded-[6px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-black uppercase">{monthLabel}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  className="btn-ghost px-2 py-1.5"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => setCursor(new Date())} className="btn-ghost px-3 py-1.5 text-[11px]">
                  Today
                </button>
                <button
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  className="btn-ghost px-2 py-1.5"
                  aria-label="Next month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {DOW.map((d) => (
                <div key={d} className="pb-1 text-center text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>
                  {d}
                </div>
              ))}
              {weeks.map((d) => {
                const iso = isoDay(d);
                const inMonth = d.getMonth() === cursor.getMonth();
                const dayLeads = byDay[iso] || [];
                const isToday = iso === todayIso;
                const isSelected = iso === selected;
                return (
                  <button
                    key={iso}
                    onClick={() => setSelected(iso)}
                    className="flex min-h-[74px] flex-col rounded-[4px] p-1.5 text-left transition"
                    style={{
                      background: isSelected ? 'rgba(225,6,0,0.12)' : 'var(--surface-2)',
                      border: `1px solid ${isSelected ? 'var(--crimson, #E10600)' : isToday ? 'var(--muted)' : 'var(--line)'}`,
                      opacity: inMonth ? 1 : 0.4,
                    }}
                  >
                    <span className={`text-[11px] font-bold ${isToday ? 'text-crimson' : ''}`}>{d.getDate()}</span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {dayLeads.slice(0, 3).map((l) => {
                        const ch = CHANNELS[leadChannel(l.source)];
                        return (
                          <span
                            key={l.id}
                            className="truncate rounded-[2px] px-1 py-0.5 text-[9px] font-bold text-white"
                            style={{ background: ch.color }}
                            title={`${l.name} — ${l.vehicle_title || 'test drive'}`}
                          >
                            {l.name}
                          </span>
                        );
                      })}
                      {dayLeads.length > 3 && (
                        <span className="text-[9px] font-bold" style={{ color: 'var(--muted)' }}>
                          +{dayLeads.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {undated > 0 && (
              <p className="mt-3 text-[11px]" style={{ color: 'var(--muted)' }}>
                {undated} request{undated === 1 ? '' : 's'} with no preferred date — see the List view.
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-display text-[15px] font-black uppercase">
              {prettyDay(selected)} · {selectedLeads.length} booking{selectedLeads.length === 1 ? '' : 's'}
            </h2>
            {selectedLeads.length === 0 ? (
              <div className="panel rounded-[5px] p-8 text-center text-[13px]" style={{ color: 'var(--muted)' }}>
                Nothing booked for this day.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!dbError && leads.length > 0 && view === 'list' && (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </main>
  );
}
