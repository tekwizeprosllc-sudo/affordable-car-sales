'use client';
import { useState } from 'react';
import { Phone, Mail, Car, RefreshCw, MessageCircle, CalendarClock, ExternalLink, Facebook, Globe, Zap, Loader2, Trash2 } from 'lucide-react';
import { CHANNELS, leadChannel } from '@/lib/leads';

const STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'no-show', 'won', 'lost'];

const CHANNEL_ICONS = { facebook: Facebook, website: Globe };

const DEALER_TOOLS = [
  {
    href: '/dealer-suite/messenger.html',
    icon: MessageCircle,
    title: 'Messenger Simulator',
    desc: 'Auto-reply demo with live inventory and a decision trace.',
  },
  {
    href: '/dealer-suite/board.html',
    icon: CalendarClock,
    title: 'Lead & Test-Drive Board',
    desc: 'Calendar bookings, new-lead toasts, one-tap call / text / email.',
  },
  {
    href: '/dealer-suite/index.html',
    icon: ExternalLink,
    title: 'Tools Hub',
    desc: 'Landing page linking both dealer tools.',
  },
];

const TYPE_LABELS = {
  test_drive: 'Test Drive',
  vehicle_inquiry: 'Vehicle Question',
  financing: 'Financing',
  trade_in: 'Trade-In',
  contact: 'General',
};

const STATUS_COLORS = {
  new: '#E10600',
  contacted: '#E8A33D',
  scheduled: '#3D8BE8',
  showed: '#2F8FA9',
  'no-show': '#7A7F87',
  won: '#2FA96B',
  lost: '#7A7F87',
};

function when(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AdminDashboard({ initialLeads, counts }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState('');
  const [channel, setChannel] = useState('');
  const [busy, setBusy] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const visible = leads.filter(
    (l) => (!filter || l.status === filter) && (!channel || leadChannel(l.source) === channel)
  );

  const channelCount = (key) => leads.filter((l) => leadChannel(l.source) === key).length;
  const isDemo = (l) => /\(demo\)/i.test(l.source || '');
  const demoCount = leads.filter(isDemo).length;
  const todayStr = new Date().toDateString();
  const todayCount = leads.filter((l) => new Date(l.created_at).toDateString() === todayStr).length;

  async function setStatus(id, status) {
    setBusy(id);
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const { lead } = await res.json();
      setLeads((prev) => prev.map((l) => (l.id === id ? lead : l)));
    }
    setBusy(null);
  }

  async function refresh() {
    const res = await fetch('/api/admin/leads');
    if (res.ok) setLeads((await res.json()).leads);
  }

  // Demo: fire the "auto-reply captured a lead" flow and watch it land up top.
  async function simulateFb() {
    setSimulating(true);
    const res = await fetch('/api/admin/simulate-fb-lead', { method: 'POST' });
    if (res.ok) {
      const { lead } = await res.json();
      setLeads((prev) => [lead, ...prev]);
      setChannel('facebook');
    }
    setSimulating(false);
  }

  async function clearDemo() {
    if (!confirm('Remove all simulated (demo) Facebook leads? Real leads are kept.')) return;
    setSimulating(true);
    const res = await fetch('/api/admin/simulate-fb-lead', { method: 'DELETE' });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => !isDemo(l)));
      setChannel('');
    }
    setSimulating(false);
  }

  return (
    <main>
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-black uppercase">Leads</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={simulateFb}
              disabled={simulating}
              title="Demo: simulate a Facebook Messenger auto-reply capturing a lead"
              className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white transition disabled:opacity-60"
              style={{ background: CHANNELS.facebook.color }}
            >
              {simulating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              {simulating ? 'Sending…' : 'Simulate FB Reply'}
            </button>
            {demoCount > 0 && (
              <button
                onClick={clearDemo}
                disabled={simulating}
                title="Delete all simulated demo leads (real leads are kept)"
                className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.1em] transition disabled:opacity-60"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
              >
                <Trash2 size={13} /> Clear Demo ({demoCount})
              </button>
            )}
            <button onClick={refresh} className="btn-ghost py-2 text-[11px]">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel rounded-[5px] p-5">
            <div className="font-display text-[32px] font-black leading-none text-crimson">{leads.length}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Total Leads
            </div>
          </div>
          <div className="panel rounded-[5px] p-5">
            <div className="font-display text-[32px] font-black leading-none text-crimson">{todayCount}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Today
            </div>
          </div>
          <div className="panel rounded-[5px] p-5">
            <div className="font-display text-[32px] font-black leading-none text-crimson">
              {leads.filter((l) => l.status === 'new').length}
            </div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Needs Follow-Up
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-[13px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
            Dealer Tools
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {DEALER_TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="panel group flex flex-col rounded-[5px] p-5 transition hover:-translate-y-0.5"
                style={{ borderColor: 'var(--line)' }}
              >
                <div className="flex items-center justify-between">
                  <tool.icon size={20} className="text-crimson" />
                  <ExternalLink size={13} className="opacity-40 transition group-hover:opacity-90" />
                </div>
                <h3 className="mt-3 font-display text-[16px] font-bold uppercase">{tool.title}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {tool.desc}
                </p>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Channel
          </span>
          <button
            onClick={() => setChannel('')}
            className={`rounded-[3px] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              !channel ? 'bg-crimson text-white' : ''
            }`}
            style={channel ? { background: 'var(--surface-2)', color: 'var(--muted)' } : undefined}
          >
            All ({leads.length})
          </button>
          {Object.values(CHANNELS).map((c) => {
            const Icon = CHANNEL_ICONS[c.key];
            const active = channel === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setChannel(c.key)}
                className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition"
                style={active ? { background: c.color } : { background: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                <Icon size={12} style={active ? undefined : { color: c.color }} />
                {c.label} ({channelCount(c.key)})
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`rounded-[3px] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
              !filter ? 'bg-crimson text-white' : ''
            }`}
            style={filter ? { background: 'var(--surface-2)', color: 'var(--muted)' } : undefined}
          >
            All ({leads.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-[3px] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
                filter === s ? 'bg-crimson text-white' : ''
              }`}
              style={filter === s ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)' }}
            >
              {s} ({leads.filter((l) => l.status === s).length})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="panel mt-6 rounded-[5px] p-16 text-center">
            <p className="font-display text-xl font-bold uppercase">No leads here yet</p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
              Test drive requests, financing applications, and messages will land here.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {visible.map((lead) => (
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
                      {(() => {
                        const ch = CHANNELS[leadChannel(lead.source)];
                        const Icon = CHANNEL_ICONS[ch.key];
                        return (
                          <span
                            className="inline-flex items-center gap-1 rounded-[2px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white"
                            style={{ background: ch.color }}
                            title={lead.source ? `Source: ${lead.source}` : ch.label}
                          >
                            <Icon size={10} /> {ch.label}
                          </span>
                        );
                      })()}
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                        {TYPE_LABELS[lead.type] || lead.type}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                        {when(lead.created_at)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-[19px] font-bold uppercase">{lead.name}</h3>

                    <div className="mt-1.5 flex flex-wrap gap-4 text-[13px]">
                      {lead.phone && (
                        <a href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 transition hover:text-crimson">
                          <Phone size={13} className="text-crimson" /> {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 transition hover:text-crimson">
                          <Mail size={13} className="text-crimson" /> {lead.email}
                        </a>
                      )}
                    </div>

                    {lead.vehicle_title && (
                      <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold">
                        <Car size={13} className="text-crimson" /> {lead.vehicle_title}
                      </p>
                    )}

                    {(lead.preferred_date || lead.preferred_time) && (
                      <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                        Preferred: {[lead.preferred_date, lead.preferred_time].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {lead.credit_range && (
                      <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                        Credit: {lead.credit_range}
                      </p>
                    )}
                    {lead.trade_details && (
                      <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                        Trade: {lead.trade_details}
                      </p>
                    )}
                    {lead.message && (
                      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                        “{lead.message}”
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={busy === lead.id || lead.status === s}
                        onClick={() => setStatus(lead.id, s)}
                        className="rounded-[3px] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] transition disabled:opacity-40"
                        style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
