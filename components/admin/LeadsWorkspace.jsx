'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Facebook, Globe, Phone, Mail, Clock, CalendarDays, MessageSquare, CheckCircle2, CircleDot,
  Trophy, ChevronDown, Filter, Zap, Loader2, Check,
} from 'lucide-react';
import { CHANNELS, leadChannel } from '@/lib/leads';
import { useAdmin } from './AdminShell';
import LeadDetailPanel from './LeadDetailPanel';
import { statusBadge, initials, dueLabel } from './theme';

const STATUS_TABS = ['', 'new', 'contacted', 'scheduled', 'showed', 'won', 'lost'];
const STATUS_TAB_LABELS = { '': 'All Leads', new: 'New', contacted: 'Contacted', scheduled: 'Scheduled', showed: 'Showed', won: 'Won', lost: 'Lost' };
const ACTION_ICONS = {
  Call: Phone,
  Text: MessageSquare,
  Email: Mail,
  'Follow Up': Clock,
  'Schedule Test Drive': CalendarDays,
  'Send Photos': Mail,
  'Confirm Availability': CheckCircle2,
  Other: CircleDot,
};

function shortAgo(iso) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

function prettyPreferred(lead) {
  if (!lead.preferred_date) return (lead.preferred_time || '').replace(/\s*\(.*\)\s*$/, '');
  const [y, mo, d] = lead.preferred_date.split('-').map(Number);
  const date = new Date(y, mo - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = lead.preferred_time ? lead.preferred_time.replace(/\s*\(.*\)\s*$/, '') : '';
  return [date, time].filter(Boolean).join(', ');
}

// What the Next Action column shows. A staff-set action wins; otherwise the
// cell suggests the obvious step from the lead's real state (shown muted so
// it doesn't read as something staff already committed to).
function nextActionFor(lead) {
  if (lead.next_action) {
    const overdue = lead.next_action_due && new Date(lead.next_action_due) < new Date() && !['won', 'lost'].includes(lead.status);
    return {
      icon: ACTION_ICONS[lead.next_action] || CircleDot,
      label: lead.next_action,
      sub: lead.next_action_due ? (overdue ? `Overdue · ${dueLabel(lead.next_action_due)}` : dueLabel(lead.next_action_due)) : 'No due time',
      tone: overdue ? 'urgent' : 'set',
    };
  }
  switch (lead.status) {
    case 'new':
      if (lead.phone) return { icon: Phone, label: 'Call', sub: 'ASAP', tone: 'urgent' };
      if (lead.email) return { icon: Mail, label: 'Email', sub: 'ASAP', tone: 'urgent' };
      return { icon: MessageSquare, label: 'Reply', sub: 'ASAP', tone: 'urgent' };
    case 'scheduled':
      return lead.preferred_date || lead.preferred_time
        ? { icon: CalendarDays, label: 'Test Drive', sub: prettyPreferred(lead), tone: 'set' }
        : { icon: CalendarDays, label: 'Confirm Time', sub: 'Not set', tone: 'suggest' };
    case 'contacted':
      return { icon: Clock, label: 'Follow Up', sub: 'Not scheduled', tone: 'suggest' };
    case 'showed':
      return { icon: Clock, label: 'Follow Up', sub: 'After visit', tone: 'suggest' };
    case 'won':
      return { icon: Trophy, label: 'Sold', sub: 'Closed', tone: 'suggest' };
    default:
      return { icon: Clock, label: 'Nurture', sub: 'No action', tone: 'suggest' };
  }
}

function SourcePill({ source }) {
  const key = leadChannel(source);
  const Icon = key === 'facebook' ? Facebook : Globe;
  return (
    <span
      className="adm-src-pill inline-flex h-[28px] items-center gap-1.5 rounded-[5px] px-2.5 text-[12.5px] font-medium text-[#e6eaed]"
      style={{ background: '#11161a', border: '1px solid var(--admin-border-strong)' }}
      title={CHANNELS[key].label}
      role="img"
      aria-label={CHANNELS[key].label}
    >
      {key === 'facebook' ? (
        <span className="grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full" style={{ background: '#1877f2' }}>
          <Icon size={10} strokeWidth={0} fill="#fff" />
        </span>
      ) : (
        <Icon size={15} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" />
      )}
      <span className="adm-src-label" aria-hidden="true">{CHANNELS[key].label}</span>
    </span>
  );
}

// Only displayed once the Source column collapses (see admin.css), so the
// channel is still visible on narrower desktops.
function AvatarChannel({ source }) {
  const key = leadChannel(source);
  return (
    <span
      className="adm-avatar-src absolute -bottom-1 -right-1 h-[17px] w-[17px] place-items-center rounded-full"
      style={{ background: key === 'facebook' ? '#1877f2' : '#2a3238', boxShadow: '0 0 0 2px var(--admin-surface)' }}
      role="img"
      aria-label={CHANNELS[key].label}
    >
      {key === 'facebook' ? <Facebook size={9} strokeWidth={0} fill="#fff" /> : <Globe size={10} className="text-[#d5dade]" />}
    </span>
  );
}

export function StatusBadge({ status }) {
  const b = statusBadge(status);
  return (
    <span className="adm-badge" style={{ color: b.fg, background: b.bg, borderColor: b.border }}>
      {b.label}
    </span>
  );
}

export default function LeadsWorkspace({
  initialLeads, counts, settings, showHero, lockChannel, heading, afterGrid, vehicleIndex, showSimulate,
}) {
  const router = useRouter();
  const { search } = useAdmin();
  const [leads, setLeads] = useState(initialLeads || []);
  const [selectedId, setSelectedId] = useState(null);
  const [userClosed, setUserClosed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [channel, setChannel] = useState(lockChannel || '');
  const [sort, setSort] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const filterRef = useRef(null);

  // router.refresh() (after a status change or a new lead) hands us fresh
  // server data; adopt it so the inbox, KPIs and sidebar badges agree.
  useEffect(() => {
    setLeads(initialLeads || []);
  }, [initialLeads]);

  // The detail panel fetches vehicle + timeline data when it mounts, so only
  // one copy exists: docked beside the table at xl, a drawer below that.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    setIsDesktop(mq.matches);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const statusCounts = useMemo(() => {
    const scoped = lockChannel ? leads.filter((l) => leadChannel(l.source) === lockChannel) : leads;
    const acc = { '': scoped.length };
    for (const l of scoped) acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, [leads, lockChannel]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = leads.filter((l) => {
      if (statusFilter && l.status !== statusFilter) return false;
      if (channel && leadChannel(l.source) !== channel) return false;
      if (term) {
        const v = vehicleIndex?.[String(l.vehicle_id)] || {};
        const haystack = [l.name, l.phone, l.email, l.vehicle_title, l.message, v.stock, v.vin]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sort === 'followup') {
        if (!a.next_action_due && !b.next_action_due) return new Date(b.created_at) - new Date(a.created_at);
        if (!a.next_action_due) return 1;
        if (!b.next_action_due) return -1;
        return new Date(a.next_action_due) - new Date(b.next_action_due);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [leads, statusFilter, channel, search, sort, vehicleIndex]);

  // Open on a live lead instead of an empty panel: newest needing a reply,
  // otherwise newest. Skipped once staff close the panel themselves.
  useEffect(() => {
    if (!isDesktop || userClosed || selectedId != null) return;
    const pick = filtered.find((l) => l.status === 'new') || filtered[0];
    if (pick) setSelectedId(pick.id);
  }, [isDesktop, userClosed, selectedId, filtered]);

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [filterOpen]);

  const selected = leads.find((l) => l.id === selectedId) || null;

  function select(id) {
    setSelectedId(id);
    setUserClosed(false);
  }

  function closePanel() {
    setSelectedId(null);
    setUserClosed(true);
  }

  function updateLeadInList(updated) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    router.refresh();
  }

  async function simulateFbLead() {
    setSimulating(true);
    await fetch('/api/admin/simulate-fb-lead', { method: 'POST' });
    router.refresh();
    setSimulating(false);
  }

  const panel = selected && (
    <LeadDetailPanel lead={selected} onClose={closePanel} onUpdate={updateLeadInList} settings={settings} />
  );

  return (
    <div className="p-4 min-[1600px]:p-5">
      {showHero && <div className="mb-4 flex flex-col gap-4">{showHero}</div>}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_412px] min-[1600px]:grid-cols-[minmax(0,1fr)_460px]">
        <section className="adm-card adm-table min-w-0 overflow-hidden" aria-label={heading || 'Leads Inbox'}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-1 pt-4">
            <h2 className="font-display text-[26px] font-semibold leading-none tracking-[0.01em] text-white">
              {heading || 'Leads Inbox'}
            </h2>
            <div className="flex items-center gap-2">
              {showSimulate && (
                <button onClick={simulateFbLead} disabled={simulating} className="adm-btn h-[36px] text-[12.5px]">
                  {simulating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Simulate FB lead
                </button>
              )}
              <label className="relative">
                <span className="sr-only">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort by"
                  className="adm-input h-[36px] w-[150px] cursor-pointer appearance-none bg-[#0b0f12] pr-8 text-[13px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="followup">Follow-up Due</option>
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#aab3ba]" />
              </label>
              {!lockChannel && (
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    className="relative grid h-[36px] w-[38px] place-items-center rounded-[5px] text-[#c9d0d5] transition hover:text-white"
                    style={{ background: '#0b0f12', border: `1px solid ${channel ? 'rgba(242,13,13,0.6)' : 'var(--admin-border-strong)'}` }}
                    aria-label="Filter by channel"
                    aria-expanded={filterOpen}
                  >
                    <Filter size={16} strokeWidth={1.8} />
                    {channel && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#f20d0d]" />}
                  </button>
                  {filterOpen && (
                    <div
                      className="absolute right-0 top-full z-30 mt-2 w-44 rounded-[6px] py-1"
                      style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border-strong)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.8)' }}
                    >
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-[#89939c]">Channel</p>
                      {['', 'facebook', 'website'].map((c) => (
                        <button
                          key={c || 'all'}
                          onClick={() => {
                            setChannel(c);
                            setFilterOpen(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-[#e6eaed] transition hover:bg-white/[0.04]"
                        >
                          {c ? CHANNELS[c].label : 'All channels'}
                          {channel === c && <Check size={14} className="text-[#ff4a42]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="adm-scroll flex overflow-x-auto px-3" role="tablist" aria-label="Lead status">
            {STATUS_TABS.map((s) => {
              const active = statusFilter === s;
              return (
                <button
                  key={s || 'all'}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(s)}
                  className="relative shrink-0 whitespace-nowrap px-2.5 py-3 text-[13px] font-medium transition min-[1600px]:px-3 min-[1600px]:text-[13.5px]"
                  style={{ color: active ? '#ff4a42' : '#c9d0d5' }}
                >
                  {STATUS_TAB_LABELS[s]} ({statusCounts[s] || 0})
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                      style={{ background: '#f20d0d', boxShadow: '0 0 10px rgba(242,13,13,0.9)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="adm-table-head adm-table-grid h-[42px] px-4 text-[12.5px] font-medium text-[#89939c]"
            style={{ borderTop: '1px solid var(--admin-border)', borderBottom: '1px solid var(--admin-border)' }}
          >
            <span className="adm-c-cust pl-[52px]">Customer</span>
            <span className="adm-c-src adm-h-src">Source</span>
            <span className="adm-c-veh">Vehicle</span>
            <span className="adm-c-msg">Message Preview</span>
            <span className="adm-c-status">Status</span>
            <span className="adm-c-next">Next Action</span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-[15px] font-semibold text-white">No leads match</p>
              <p className="mt-1 text-[13px] text-[#89939c]">
                {leads.length === 0 ? 'Leads from your site, Ava, and Facebook will show up here.' : 'Try a different status, channel, or search.'}
              </p>
            </div>
          ) : (
            <div className="px-1 pb-1">
              {filtered.map((lead) => {
                const na = nextActionFor(lead);
                const NaIcon = na.icon;
                const stock = vehicleIndex?.[String(lead.vehicle_id)]?.stock;
                const isSelected = lead.id === selectedId;
                return (
                  <button
                    key={lead.id}
                    onClick={() => select(lead.id)}
                    data-selected={isSelected}
                    aria-pressed={isSelected}
                    className="adm-row adm-table-grid"
                  >
                    <span className="adm-c-cust flex items-center gap-3">
                      <span
                        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-[#e6eaed]"
                        style={{ background: '#1a2025', border: '1px solid var(--admin-border-strong)' }}
                      >
                        {initials(lead.name)}
                        <AvatarChannel source={lead.source} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold text-white">{lead.name}</span>
                        <span className="block truncate text-[12px] text-[#89939c]">{shortAgo(lead.created_at)}</span>
                      </span>
                    </span>

                    <span className="adm-c-src">
                      <SourcePill source={lead.source} />
                    </span>

                    <span className="adm-c-veh">
                      {lead.vehicle_title ? (
                        <>
                          <span className="block truncate text-[13.5px] font-medium text-[#eef1f3]">{lead.vehicle_title}</span>
                          <span className="block truncate text-[12px] text-[#89939c]">
                            {stock ? `Stock #${stock}` : lead.type === 'vehicle_request' ? 'Car request' : ' '}
                          </span>
                        </>
                      ) : (
                        <span className="text-[13px] text-[#7c868e]">No vehicle</span>
                      )}
                    </span>

                    <span className="adm-c-msg line-clamp-2 text-[13px] leading-[1.4] text-[#c9d0d5]">
                      {lead.message || <span className="text-[#7c868e]">No message</span>}
                    </span>

                    <span className="adm-c-status">
                      <StatusBadge status={lead.status} />
                    </span>

                    <span className="adm-c-next flex items-center gap-2.5">
                      <NaIcon
                        size={18}
                        strokeWidth={1.8}
                        className="shrink-0"
                        style={{ color: na.tone === 'urgent' ? '#ff4a42' : na.tone === 'set' ? '#d5dade' : '#7c868e' }}
                      />
                      <span className="min-w-0">
                        <span
                          className="block truncate text-[13px] font-medium"
                          style={{ color: na.tone === 'suggest' ? '#aab3ba' : '#f5f7f8' }}
                        >
                          {na.label}
                        </span>
                        <span
                          className="block truncate text-[11.5px]"
                          style={{ color: na.tone === 'urgent' ? '#ff6a62' : '#89939c' }}
                        >
                          {na.sub}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {isDesktop && (
          <div className="sticky top-4 hidden xl:block">
            {panel || (
              <div className="adm-card grid h-[320px] place-items-center px-8 text-center">
                <div>
                  <p className="text-[15px] font-semibold text-white">{leads.length ? 'No lead selected' : 'No leads yet'}</p>
                  <p className="mt-1 text-[13px] text-[#89939c]">
                    {leads.length ? 'Pick a row to see contact actions, the vehicle, and history.' : 'New leads will open here automatically.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {afterGrid && <div className="mt-4">{afterGrid}</div>}

      {selected && !isDesktop && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <div className="absolute inset-0 bg-black/75" onClick={closePanel} />
          <div className="absolute inset-x-0 bottom-0 top-12 overflow-hidden rounded-t-[10px] md:left-auto md:top-0 md:w-[460px] md:rounded-none">
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}
