'use client';
import { useState } from 'react';
import { Phone, Car, CalendarCheck, Loader2 } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'no-show'];

const STATUS_COLORS = {
  new: '#E10600',
  contacted: '#E8A33D',
  scheduled: '#3D8BE8',
  showed: '#2FA96B',
  'no-show': '#7A7F87',
};

function when(iso) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AdminTestDrives({ initialLeads, dbError }) {
  const [leads, setLeads] = useState(initialLeads || []);
  const [busy, setBusy] = useState(null);
  const [drafts, setDrafts] = useState({});

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
    const when = (drafts[id] || '').trim();
    if (!when) return;
    await patch(id, { status: 'scheduled', notes: `Scheduled: ${when}` });
    setDrafts((d) => ({ ...d, [id]: '' }));
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black uppercase">Test Drives</h1>
        <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
          {leads.length} request{leads.length === 1 ? '' : 's'} · {leads.filter((l) => l.status === 'scheduled').length} scheduled
        </p>
      </div>

      {dbError && (
        <p className="panel rounded-[5px] p-4 text-[12.5px]" style={{ color: 'var(--muted)' }}>
          Database not reachable — set <code>DATABASE_URL</code>. ({dbError})
        </p>
      )}

      {!dbError && leads.length === 0 ? (
        <div className="panel rounded-[5px] p-16 text-center">
          <p className="font-display text-xl font-bold uppercase">No test drives requested yet</p>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
            Requests from a vehicle page or from Ava land here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <article key={lead.id} className="panel rounded-[5px] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-[2px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white"
                      style={{ background: STATUS_COLORS[lead.status] || '#7A7F87' }}
                    >
                      {lead.status}
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
                  {lead.notes && (
                    <p className="mt-1 text-[12.5px] font-semibold text-accent">{lead.notes}</p>
                  )}
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
          ))}
        </div>
      )}
    </main>
  );
}
