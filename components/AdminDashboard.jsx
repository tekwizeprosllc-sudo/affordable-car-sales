'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Phone, Mail, Car, RefreshCw } from 'lucide-react';
import Logo from './Logo';

const STATUSES = ['new', 'contacted', 'scheduled', 'won', 'closed'];

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
  won: '#2FA96B',
  closed: '#7A7F87',
};

function when(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AdminDashboard({ initialLeads, counts }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(null);
  const router = useRouter();

  const visible = filter ? leads.filter((l) => l.status === filter) : leads;

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

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-4">
          <Logo className="h-9" />
          <span className="font-display text-[15px] font-bold uppercase tracking-[0.14em]">Leads</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="btn-ghost py-2 text-[11px]">
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={logout} className="btn-ghost py-2 text-[11px]">
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="panel rounded-[5px] p-5">
            <div className="font-display text-[32px] font-black leading-none text-crimson">{counts.total}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Total Leads
            </div>
          </div>
          <div className="panel rounded-[5px] p-5">
            <div className="font-display text-[32px] font-black leading-none text-crimson">{counts.today}</div>
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

        <div className="mt-6 flex flex-wrap gap-2">
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
