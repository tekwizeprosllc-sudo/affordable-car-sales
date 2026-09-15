'use client';
import { useEffect, useMemo, useState } from 'react';
import { Facebook, Globe, Car, Phone, Mail, CalendarClock, Zap, Loader2, SlidersHorizontal } from 'lucide-react';
import { CHANNELS, leadChannel, STATUS_COLORS } from '@/lib/leads';
import AdminTopbar from './AdminTopbar';
import LeadDetailPanel from './LeadDetailPanel';
import NewLeadModal from './NewLeadModal';

const STATUS_TABS = ['', 'new', 'contacted', 'scheduled', 'showed', 'won', 'lost'];
const STATUS_TAB_LABELS = { '': 'All Leads', new: 'New', contacted: 'Contacted', scheduled: 'Scheduled', showed: 'Showed', won: 'Won', lost: 'Lost' };
const CHANNEL_ICONS = { facebook: Facebook, website: Globe };

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

function nextActionDisplay(lead) {
  if (!lead.next_action) return null;
  const overdue = lead.next_action_due && new Date(lead.next_action_due) < new Date();
  return { text: lead.next_action, due: lead.next_action_due, overdue };
}

export default function LeadsWorkspace({ initialLeads, counts, settings, showHero, lockChannel, heading, afterGrid }) {
  const [leads, setLeads] = useState(initialLeads || []);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [channel, setChannel] = useState(lockChannel || '');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // The detail panel is expensive to mount (it fetches vehicle + timeline data),
  // so only one copy exists at a time — desktop sidebar or mobile drawer.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const statusCounts = useMemo(() => {
    const acc = { '': leads.length };
    for (const l of leads) acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, [leads]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (channel && leadChannel(l.source) !== channel) return false;
      if (term) {
        const haystack = [l.name, l.phone, l.email, l.vehicle_title, l.message].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'followup') {
        if (!a.next_action_due && !b.next_action_due) return new Date(b.created_at) - new Date(a.created_at);
        if (!a.next_action_due) return 1;
        if (!b.next_action_due) return -1;
        return new Date(a.next_action_due) - new Date(b.next_action_due);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return list;
  }, [leads, statusFilter, channel, search, sort]);

  const selected = leads.find((l) => l.id === selectedId) || null;

  function updateLeadInList(updated) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  async function simulateFbLead() {
    setSimulating(true);
    await fetch('/api/admin/simulate-fb-lead', { method: 'POST' });
    const res = await fetch('/api/admin/leads');
    const json = await res.json();
    setLeads(json.leads || []);
    setSimulating(false);
  }

  return (
    <div className="flex h-screen flex-col">
      <AdminTopbar
        search={search}
        onSearch={setSearch}
        needsReplyCount={counts?.needsReply}
        onNewLead={() => setNewLeadOpen(true)}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {showHero && (
          <div className="mb-5 flex flex-col gap-5">
            {showHero}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
          <div className="flex min-w-0 flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-black uppercase">{heading || 'Leads Inbox'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={simulateFbLead} disabled={simulating} className="btn-ghost py-1.5 text-[10px] disabled:opacity-50">
                  {simulating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} Simulate FB Reply
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by" className="field h-9 w-auto text-[11px]">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="followup">Follow-up Due</option>
                </select>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              {STATUS_TABS.map((s) => (
                <button
                  key={s || 'all'}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-[3px] px-2.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] transition ${statusFilter === s ? 'bg-crimson text-white' : ''}`}
                  style={statusFilter === s ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                >
                  {STATUS_TAB_LABELS[s]} ({statusCounts[s] || 0})
                </button>
              ))}
            </div>

            {!lockChannel && (
            <div className="mb-4 flex items-center gap-1.5">
              <SlidersHorizontal size={12} style={{ color: 'var(--muted)' }} />
              {['', 'facebook', 'website'].map((c) => (
                <button
                  key={c || 'all'}
                  onClick={() => setChannel(c)}
                  className={`rounded-[3px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] transition ${channel === c ? 'bg-crimson text-white' : ''}`}
                  style={channel === c ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                >
                  {c === '' ? 'All Channels' : CHANNELS[c].label}
                </button>
              ))}
            </div>
            )}

            {filtered.length === 0 ? (
              <div className="panel flex-1 rounded-[6px] p-12 text-center">
                <p className="font-display text-lg font-bold uppercase">No leads match</p>
                <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                  {leads.length === 0 ? 'Leads from your site, Ava, and Facebook will show up here.' : 'Try a different filter or search.'}
                </p>
              </div>
            ) : (
              <div className="panel overflow-hidden rounded-[6px]">
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                  {filtered.map((lead) => {
                    const ch = CHANNELS[leadChannel(lead.source)];
                    const Icon = CHANNEL_ICONS[ch.key];
                    const na = nextActionDisplay(lead);
                    const isSelected = lead.id === selectedId;
                    return (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedId(lead.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition"
                        style={{
                          borderBottom: '1px solid var(--line)',
                          background: isSelected ? 'rgba(225,6,0,0.1)' : 'transparent',
                          boxShadow: isSelected ? 'inset 3px 0 0 #E10600' : na?.overdue ? 'inset 3px 0 0 rgba(225,6,0,0.5)' : 'inset 3px 0 0 transparent',
                        }}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crimson text-[11px] font-extrabold text-white">
                          {initials(lead.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-[13.5px] font-bold">{lead.name}</span>
                            <span className="inline-flex items-center gap-1 rounded-[2px] px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-[0.08em] text-white" style={{ background: ch.color }}>
                              <Icon size={9} /> {ch.short}
                            </span>
                            <span className="text-[10.5px]" style={{ color: 'var(--muted)' }}>{timeAgo(lead.created_at)}</span>
                          </div>
                          {lead.vehicle_title && (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px]" style={{ color: 'var(--muted)' }}>
                              <Car size={10} /> {lead.vehicle_title}
                            </p>
                          )}
                          {lead.message && (
                            <p className="mt-0.5 truncate text-[11.5px]" style={{ color: 'var(--muted)' }}>{lead.message}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className="rounded-[2px] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white"
                            style={{ background: STATUS_COLORS[lead.status] || '#5C6066' }}
                          >
                            {lead.status}
                          </span>
                          {na && (
                            <span
                              className="flex items-center gap-1 text-[10px] font-bold"
                              style={{ color: na.overdue ? '#E10600' : 'var(--muted)' }}
                            >
                              <CalendarClock size={10} /> {na.text}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            {selected && isDesktop ? (
              <div className="sticky top-6">
                <LeadDetailPanel lead={selected} onClose={() => setSelectedId(null)} onUpdate={updateLeadInList} settings={settings} />
              </div>
            ) : (
              <div className="panel grid h-64 place-items-center rounded-[6px] text-center">
                <div>
                  <p className="font-display text-[15px] font-bold uppercase" style={{ color: 'var(--muted)' }}>
                    Select a lead
                  </p>
                  <p className="mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>
                    Click any row to see details, contact actions, and history.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {afterGrid && <div className="mt-6">{afterGrid}</div>}
      </div>

      {selected && !isDesktop && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedId(null)} />
          <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[10px]">
            <LeadDetailPanel lead={selected} onClose={() => setSelectedId(null)} onUpdate={updateLeadInList} settings={settings} />
          </div>
        </div>
      )}

      {newLeadOpen && (
        <NewLeadModal
          onClose={() => setNewLeadOpen(false)}
          onCreated={async () => {
            const res = await fetch('/api/admin/leads');
            const json = await res.json();
            setLeads(json.leads || []);
          }}
        />
      )}
    </div>
  );
}
