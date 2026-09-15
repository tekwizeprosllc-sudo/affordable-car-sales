'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  X, MoreHorizontal, Phone, Mail, Calendar, Link2, Check, Loader2, Car, ChevronRight, Gauge,
  Facebook, Globe, CalendarClock, CheckCircle2, Tag, CircleDollarSign, HelpCircle, Send,
  StickyNote, RefreshCw, CreditCard, Pencil, Dot,
} from 'lucide-react';
import { leadChannel, NEXT_ACTIONS } from '@/lib/leads';
import { VEHICLE_STATUSES, VEHICLE_STATUS_LABELS } from '@/lib/vehicles';
import { statusBadge, AVAILABILITY_STYLE, initials, timeAgo, dueLabel } from './theme';

const STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'no-show', 'won', 'lost'];

const TYPE_LABELS = {
  test_drive: 'Test drive request',
  vehicle_inquiry: 'Vehicle question',
  financing: 'Financing',
  trade_in: 'Trade-in',
  vehicle_request: 'Car request',
  contact: 'General inquiry',
};

const AVAILABILITY_ICONS = { live: CheckCircle2, pending: Tag, sold: CircleDollarSign, unknown: HelpCircle };

const REPLY_TEXT = (status, defaultUnknown) =>
  ({
    live: 'Yes, it is available!',
    pending: 'It is currently pending sale.',
    sold: 'That one is no longer available.',
    unknown: defaultUnknown || 'Needs staff confirmation.',
  })[status] || defaultUnknown || 'Needs staff confirmation.';

const REPLY_CHIP = { live: 'Yes, it is available!', pending: 'Pending sale', sold: 'No longer available' };

const CHIP = 'inline-flex h-[32px] items-center gap-1.5 rounded-[5px] px-2.5 text-[12px] font-medium text-[#d5dade] transition hover:text-white';
const CHIP_STYLE = { background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border-strong)' };


function FbMark({ size = 22 }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, background: '#1877f2' }}>
      <Facebook size={size * 0.56} strokeWidth={0} fill="#fff" />
    </span>
  );
}

function Section({ children, className = '' }) {
  return (
    <div className={`px-5 py-3 ${className}`} style={{ borderBottom: '1px solid var(--admin-border)' }}>
      {children}
    </div>
  );
}

export default function LeadDetailPanel({ lead, onClose, onUpdate, settings }) {
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('timeline');
  const [noteDraft, setNoteDraft] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(false);
  const [actionDraft, setActionDraft] = useState({ action: '', due: '' });
  const menuRef = useRef(null);

  useEffect(() => {
    setTab('timeline');
    setScheduling(false);
    setMenuOpen(false);
    setEditingAction(false);
    setActionDraft({ action: lead?.next_action || '', due: lead?.next_action_due ? toLocalInput(lead.next_action_due) : '' });
    if (!lead) return;

    if (lead.vehicle_id) {
      setVehicleLoading(true);
      fetch(`/api/admin/vehicle-lookup?id=${encodeURIComponent(lead.vehicle_id)}`)
        .then((r) => r.json())
        .then((j) => setVehicle(j.vehicle || null))
        .catch(() => setVehicle(null))
        .finally(() => setVehicleLoading(false));
    } else {
      setVehicle(null);
    }

    fetch(`/api/admin/lead-events?leadId=${lead.id}`)
      .then((r) => r.json())
      .then((j) => setEvents(j.events || []))
      .catch(() => setEvents([]));
    // Only re-fetch when the selected lead actually changes, not on every
    // parent re-render that hands us a new `lead` object with the same id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.id]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  if (!lead) return null;

  const isFacebook = leadChannel(lead.source) === 'facebook';
  const badge = statusBadge(lead.status);
  const vehicleStatus = vehicle?.status || 'unknown';
  const notes = events.filter((e) => e.kind === 'note');
  const repliesSent = events.filter((e) => e.kind === 'auto_reply').length;
  // Reply matching the vehicle's real status leads; an unknown vehicle only
  // offers the configured "needs confirmation" reply, never a guess.
  const recommendedReply = vehicle ? vehicleStatus : 'unknown';
  const alternateReplies = recommendedReply === 'unknown' ? [] : ['live', 'pending', 'sold'].filter((x) => x !== recommendedReply);
  const telHref = lead.phone ? `tel:${lead.phone.replace(/[^0-9+]/g, '')}` : undefined;

  function flash(key) {
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  async function refreshEvents() {
    const j = await fetch(`/api/admin/lead-events?leadId=${lead.id}`).then((r) => r.json()).catch(() => ({ events: [] }));
    setEvents(j.events || []);
  }

  async function patchLead(body) {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, ...body }),
      });
      if (res.ok) {
        const { lead: updated } = await res.json();
        onUpdate?.(updated);
        await refreshEvents();
        return updated;
      }
    } finally {
      setBusy(false);
    }
    return null;
  }

  async function addNote() {
    if (!noteDraft.trim()) return;
    setBusy(true);
    await fetch('/api/admin/lead-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id, kind: 'note', text: noteDraft.trim() }),
    });
    setNoteDraft('');
    await refreshEvents();
    setBusy(false);
  }

  async function schedule() {
    if (!scheduleDraft.trim()) return;
    await patchLead({ status: 'scheduled', notes: `Scheduled: ${scheduleDraft.trim()}` });
    setScheduleDraft('');
    setScheduling(false);
  }

  async function saveNextAction() {
    await patchLead({
      nextAction: actionDraft.action || undefined,
      nextActionDue: actionDraft.due ? new Date(actionDraft.due).toISOString() : undefined,
      clearNextAction: !actionDraft.action,
    });
    setEditingAction(false);
  }

  async function setVehicleStatus(status) {
    if (!vehicle) return;
    setBusy(true);
    const isManual = String(lead.vehicle_id).startsWith('m');
    await fetch('/api/admin/vehicles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isManual ? { id: vehicle.manualId, status } : { scrapedId: lead.vehicle_id, status }),
    });
    setVehicle((v) => ({ ...v, status }));
    await fetch('/api/admin/lead-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id, kind: 'vehicle_status_change', text: VEHICLE_STATUS_LABELS[status] }),
    });
    await refreshEvents();
    setBusy(false);
  }

  async function sendQuickReply(status) {
    const text = REPLY_TEXT(status, settings?.defaultUnknownReply);
    try {
      await navigator.clipboard?.writeText(text);
    } catch {}
    await fetch('/api/admin/lead-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: lead.id, kind: 'auto_reply', text }),
    });
    if (lead.status === 'new') await patchLead({ status: 'contacted' });
    else await refreshEvents();
    flash(`reply-${status}`);
  }

  function scheduleLink() {
    const origin = settings?.websiteBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const pattern = settings?.testDriveLinkPattern || '/inventory/{id}?action=test-drive';
    if (lead.vehicle_id) return `${origin}${pattern.replace('{id}', lead.vehicle_id)}`;
    return `${origin}/vehicle-request`;
  }

  async function copyLink(key) {
    try {
      await navigator.clipboard?.writeText(scheduleLink());
      flash(key);
    } catch {}
  }

  return (
    <aside
      className="adm-card adm-scroll flex h-full flex-col overflow-y-auto xl:max-h-[calc(100vh-64px-32px)]"
      aria-label={`Lead details for ${lead.name}`}
    >
      {/* Customer header */}
      <div className="flex items-start gap-3.5 px-5 pb-2 pt-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-[#e6eaed]"
          style={{ background: '#1a2025', border: '1px solid var(--admin-border-strong)' }}
        >
          {initials(lead.name)}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <h3 className="min-w-0 truncate font-sans text-[20px] font-semibold leading-tight text-white">{lead.name}</h3>
            <span className="adm-badge shrink-0 rounded-full px-3" style={{ color: badge.fg, background: badge.bg, borderColor: badge.border }}>
              {badge.label}
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#89939c]">{timeAgo(lead.created_at)}</p>
        </div>
        <div className="flex flex-col items-end gap-1" ref={menuRef}>
          <button onClick={onClose} aria-label="Close lead details" className="grid h-8 w-8 place-items-center rounded-[5px] text-[#aab3ba] transition hover:bg-white/[0.05] hover:text-white">
            <X size={20} strokeWidth={1.8} />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Lead actions"
              aria-expanded={menuOpen}
              className="grid h-8 w-8 place-items-center rounded-[5px] text-[#aab3ba] transition hover:bg-white/[0.05] hover:text-white"
            >
              <MoreHorizontal size={20} strokeWidth={1.8} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-30 mt-1 w-48 rounded-[6px] py-1"
                style={{ background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border-strong)', boxShadow: '0 18px 40px -12px rgba(0,0,0,0.85)' }}
              >
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-[#89939c]">Set status</p>
                {STATUSES.map((s) => {
                  const b = statusBadge(s);
                  return (
                    <button
                      key={s}
                      role="menuitemradio"
                      aria-checked={lead.status === s}
                      disabled={busy}
                      onClick={async () => {
                        setMenuOpen(false);
                        if (lead.status !== s) await patchLead({ status: s });
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[#e6eaed] transition hover:bg-white/[0.04]"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: b.fg }} />
                      <span className="flex-1">{b.label}</span>
                      {lead.status === s && <Check size={14} className="text-[#ff4a42]" />}
                    </button>
                  );
                })}
                <div className="my-1 h-px" style={{ background: 'var(--admin-border)' }} />
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setTab('timeline');
                    setEditingAction(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-[#e6eaed] transition hover:bg-white/[0.04]"
                >
                  <Pencil size={13} className="text-[#aab3ba]" /> Set next action
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact information */}
      <div className="space-y-2 px-5 pb-3.5 text-[14px] text-[#e6eaed]">
        {lead.phone && (
          <a href={telHref} className="flex items-center gap-3 transition hover:text-white">
            <Phone size={17} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" /> {lead.phone}
          </a>
        )}
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="flex min-w-0 items-center gap-3 transition hover:text-white">
            <Mail size={17} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" /> <span className="truncate">{lead.email}</span>
          </a>
        )}
        <p className="flex items-center gap-3">
          {isFacebook ? (
            <Facebook size={17} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" />
          ) : (
            <Globe size={17} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" />
          )}
          <span>
            {isFacebook ? 'Facebook' : 'Website'}
            <span className="px-2 text-[#7c868e]">|</span>
            {TYPE_LABELS[lead.type] || 'Inquiry'}
          </span>
        </p>
        {(lead.preferred_date || lead.preferred_time) && (
          <p className="flex items-center gap-3">
            <CalendarClock size={17} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" />
            <span>
              Requested: {[lead.preferred_date, lead.preferred_time].filter(Boolean).join(' · ')}
            </span>
          </p>
        )}
      </div>

      {/* Primary actions */}
      <div className="px-5 pb-3.5" style={{ borderBottom: '1px solid var(--admin-border)' }}>
        <div className="grid grid-cols-[0.85fr_0.95fr_1.1fr_1.1fr] gap-1.5 [&_svg]:shrink-0">
          <a
            href={telHref}
            aria-disabled={!lead.phone}
            className={`adm-btn adm-btn-red h-[44px] gap-1.5 px-1.5 text-[13px] ${lead.phone ? '' : 'pointer-events-none opacity-40'}`}
          >
            <Phone size={16} strokeWidth={2} /> Call
          </a>
          <a
            href={lead.email ? `mailto:${lead.email}` : undefined}
            aria-disabled={!lead.email}
            className={`adm-btn h-[44px] gap-1.5 px-1.5 text-[13px] ${lead.email ? '' : 'pointer-events-none opacity-40'}`}
          >
            <Mail size={16} strokeWidth={1.8} /> Email
          </a>
          <button onClick={() => setScheduling((v) => !v)} aria-expanded={scheduling} className="adm-btn h-[44px] gap-1.5 px-1.5 text-[13px]">
            <Calendar size={16} strokeWidth={1.8} /> Schedule
          </button>
          <button onClick={() => copyLink('link')} className="adm-btn h-[44px] gap-1.5 px-1.5 text-[13px]">
            {copied === 'link' ? <Check size={16} /> : <Link2 size={16} strokeWidth={1.8} />} {copied === 'link' ? 'Copied' : 'Send Link'}
          </button>
        </div>
        {scheduling && (
          <div className="mt-3 flex gap-2">
            <input
              value={scheduleDraft}
              onChange={(e) => setScheduleDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && schedule()}
              placeholder="Test drive time, e.g. Sat 2pm"
              aria-label="Schedule time"
              className="adm-input h-[38px]"
              autoFocus
            />
            <button onClick={schedule} disabled={busy || !scheduleDraft.trim()} className="adm-btn adm-btn-red h-[38px]">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Book
            </button>
          </div>
        )}
      </div>

      {/* Vehicle + availability */}
      {lead.vehicle_id ? (
        <Section>
          {vehicleLoading ? (
            <div className="flex h-[112px] items-center gap-2 text-[13px] text-[#89939c]">
              <Loader2 size={15} className="animate-spin" /> Loading vehicle…
            </div>
          ) : vehicle ? (
            <>
              <Link
                href={`/inventory/${lead.vehicle_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-[6px] p-2.5 transition hover:border-[rgba(242,13,13,0.45)]"
                style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)' }}
              >
                {vehicle.image ? (
                  <img src={vehicle.image} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} className="h-[80px] w-[120px] shrink-0 rounded-[5px] object-cover" />
                ) : (
                  <div className="grid h-[80px] w-[120px] shrink-0 place-items-center rounded-[5px]" style={{ background: 'var(--admin-surface-2)' }}>
                    <Car size={26} className="text-[#7c868e]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-tight text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="mt-0.5 truncate text-[12.5px] text-[#89939c]">
                    {[vehicle.trim, vehicle.stock ? `Stock #${vehicle.stock}` : null].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-1 font-display text-[26px] font-bold leading-none" style={{ color: '#ff2a22' }}>
                    {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Call for price'}
                  </p>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-snug text-[#c9d0d5]">
                    <Gauge size={13} className="mt-[1px] shrink-0 text-[#89939c]" />
                    <span className="flex flex-wrap gap-x-2">
                      {[shortEngine(vehicle.engine), vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null, titleCase(vehicle.color)]
                        .filter(Boolean)
                        .map((part, i) => (
                          <span key={part} className={`whitespace-nowrap ${i === 2 ? 'hidden min-[1600px]:inline' : ''}`}>
                            {i > 0 && <span className="mr-2 text-[#7c868e]">|</span>}
                            {part}
                          </span>
                        ))}
                    </span>
                  </p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-[#89939c] transition group-hover:text-white" />
              </Link>

              <p className="mb-2 mt-3 text-[13px] font-medium text-[#c9d0d5]">Vehicle Status</p>
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Vehicle status">
                {VEHICLE_STATUSES.map((s) => {
                  const on = vehicleStatus === s;
                  const st = AVAILABILITY_STYLE[s];
                  const Icon = AVAILABILITY_ICONS[s];
                  return (
                    <button
                      key={s}
                      disabled={busy}
                      aria-pressed={on}
                      onClick={() => !on && setVehicleStatus(s)}
                      className="flex h-[42px] items-center justify-center gap-1.5 rounded-[5px] text-[13px] font-medium transition disabled:cursor-wait"
                      style={
                        on
                          ? { color: st.fg, background: st.bg, border: `1px solid ${st.border}`, boxShadow: `0 0 16px -6px ${st.glow}` }
                          : { color: '#aab3ba', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)' }
                      }
                    >
                      <Icon size={15} strokeWidth={on ? 2.2 : 1.8} style={on ? { color: st.icon } : undefined} />
                      {VEHICLE_STATUS_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="flex items-center gap-2 text-[13px] text-[#89939c]">
              <Car size={16} /> {lead.vehicle_title || 'Vehicle'} — no longer listed in inventory
            </p>
          )}
        </Section>
      ) : lead.vehicle_title ? (
        <Section>
          <p className="flex items-center gap-2.5 text-[14px] text-[#e6eaed]">
            <Car size={17} strokeWidth={1.8} className="text-[#aab3ba]" /> {lead.vehicle_title}
          </p>
        </Section>
      ) : null}

      {/* Tabs */}
      <div className="flex shrink-0 overflow-x-auto px-3" role="tablist" aria-label="Lead history" style={{ borderBottom: '1px solid var(--admin-border)' }}>
        {[
          ['timeline', 'Timeline'],
          ['notes', `Notes${notes.length ? ` (${notes.length})` : ''}`],
          ['test_drive', 'Test Drive'],
          ['trade_in', 'Trade-In'],
          ['credit_app', 'Credit App'],
        ].map(([key, label]) => {
          const active = tab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className="relative flex-1 whitespace-nowrap px-2 py-3 text-[13.5px] font-medium transition"
              style={{ color: active ? '#ff4a42' : '#c9d0d5' }}
            >
              {label}
              {active && <span className="absolute inset-x-1 bottom-0 h-[2px] rounded-full" style={{ background: '#f20d0d', boxShadow: '0 0 10px rgba(242,13,13,0.9)' }} />}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-5 py-4">
        {tab === 'timeline' && (
          <div>
            {/* Next action, compact and editable */}
            <div className="mb-4 flex items-center gap-3 rounded-[5px] px-3 py-2" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
              {editingAction ? (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <select
                    value={actionDraft.action}
                    onChange={(e) => setActionDraft((d) => ({ ...d, action: e.target.value }))}
                    aria-label="Next action"
                    className="adm-input h-[32px] min-w-0 flex-1 text-[12.5px]"
                  >
                    <option value="">No next action</option>
                    {NEXT_ACTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={actionDraft.due}
                    onChange={(e) => setActionDraft((d) => ({ ...d, due: e.target.value }))}
                    aria-label="Next action due"
                    className="adm-input h-[32px] w-auto text-[12.5px] [color-scheme:dark]"
                  />
                  <button onClick={saveNextAction} disabled={busy} className="adm-btn adm-btn-red h-[32px] px-3 text-[12px]">Save</button>
                  <button onClick={() => setEditingAction(false)} className="adm-btn h-[32px] px-3 text-[12px]">Cancel</button>
                </div>
              ) : (
                <>
                  <CalendarClock size={16} strokeWidth={1.8} className="shrink-0 text-[#aab3ba]" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-[#c9d0d5]">
                    <span className="text-[#89939c]">Next action: </span>
                    {lead.next_action ? (
                      <>
                        <span className="font-medium text-white">{lead.next_action}</span>
                        {lead.next_action_due && (
                          <span
                            style={{ color: new Date(lead.next_action_due) < new Date() ? '#ff6a62' : '#89939c' }}
                          >
                            {' · '}
                            {dueLabel(lead.next_action_due)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#89939c]">Not set</span>
                    )}
                  </p>
                  <button onClick={() => setEditingAction(true)} className="shrink-0 text-[12.5px] font-medium text-[#ff4a42] transition hover:text-[#ff6a62]">
                    {lead.next_action ? 'Edit' : 'Set'}
                  </button>
                </>
              )}
            </div>

            <ol className="relative">
              {events.length === 0 && <li className="text-[13px] text-[#89939c]">No activity yet.</li>}
              {events.map((ev, i) => (
                <TimelineItem key={ev.id} ev={ev} lead={lead} isFacebook={isFacebook} last={i === events.length - 1 && !isFacebook} />
              ))}
            </ol>

            {isFacebook && (
              <div className="relative pl-9">
                <span className="absolute left-[11px] top-0 h-4 w-px" style={{ background: 'var(--admin-border-strong)' }} />
                <div className="rounded-[6px] p-3.5" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13.5px] font-semibold text-white">Facebook Auto Reply</p>
                      <p className="mt-0.5 text-[12px] text-[#89939c]">
                        {repliesSent
                          ? `Sent ${repliesSent} quick repl${repliesSent === 1 ? 'y' : 'ies'} to this lead`
                          : vehicle
                            ? `Vehicle is ${VEHICLE_STATUS_LABELS[vehicleStatus].toLowerCase()} · replies copy and log here`
                            : 'Vehicle not confirmed · replies copy and log here'}
                        {settings?.facebookAutomationEnabled === 'false' && ' · automation off'}
                      </p>
                    </div>
                    <Send size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-[#aab3ba]" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => sendQuickReply(recommendedReply)}
                      aria-label={REPLY_TEXT(recommendedReply, settings?.defaultUnknownReply)}
                      className={CHIP}
                      style={{ color: '#fff', background: 'rgba(242,13,13,0.16)', border: '1px solid #f20d0d', boxShadow: '0 0 14px -6px rgba(242,13,13,0.8)' }}
                    >
                      {copied === `reply-${recommendedReply}` && <Check size={13} />}
                      {recommendedReply === 'unknown' ? REPLY_TEXT('unknown', settings?.defaultUnknownReply) : REPLY_CHIP[recommendedReply]}
                    </button>
                    <button onClick={() => copyLink('fb-link')} className={CHIP} style={CHIP_STYLE}>
                      {copied === 'fb-link' ? <Check size={13} /> : <Link2 size={13} />}
                      Schedule at this link
                    </button>
                  </div>
                  {alternateReplies.length > 0 && (
                    <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#89939c]">
                      Other replies:
                      {alternateReplies.map((s, i) => (
                        <span key={s} className="flex items-center gap-2">
                          {i > 0 && <span className="text-[#7c868e]">·</span>}
                          <button
                            onClick={() => sendQuickReply(s)}
                            aria-label={REPLY_TEXT(s)}
                            className="font-medium text-[#d5dade] underline-offset-2 transition hover:text-white hover:underline"
                          >
                            {copied === `reply-${s}` ? 'Copied' : REPLY_CHIP[s]}
                          </button>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a note…"
                aria-label="Add a note"
                className="adm-input h-[38px]"
              />
              <button onClick={addNote} disabled={busy || !noteDraft.trim()} className="adm-btn adm-btn-red h-[38px]">
                <StickyNote size={14} /> Add
              </button>
            </div>
            {notes.length === 0 && <p className="text-[13px] text-[#89939c]">No notes yet.</p>}
            {[...notes].reverse().map((ev) => (
              <div key={ev.id} className="rounded-[5px] px-3 py-2.5" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}>
                <p className="text-[13px] leading-relaxed text-[#e6eaed]">{ev.text}</p>
                <p className="mt-1 text-[11.5px] text-[#89939c]">Staff · {timeAgo(ev.created_at)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'test_drive' && (
          <DetailBlock icon={CalendarClock} title="Test drive">
            <Row label="Requested" value={[lead.preferred_date, lead.preferred_time].filter(Boolean).join(' · ') || 'No time given'} />
            <Row label="Scheduling" value={lead.notes || (lead.status === 'scheduled' ? 'Confirmed' : 'Not confirmed by staff')} />
            <button onClick={() => setScheduling(true)} className="adm-btn mt-3 h-[34px] text-[12.5px]">
              <Calendar size={14} /> Schedule
            </button>
          </DetailBlock>
        )}

        {tab === 'trade_in' && (
          <DetailBlock icon={RefreshCw} title="Trade-in">
            <Row label="Vehicle" value={lead.trade_details || 'No trade-in details on this lead'} />
          </DetailBlock>
        )}

        {tab === 'credit_app' && (
          <DetailBlock icon={CreditCard} title="Credit application">
            <Row label="Credit range" value={lead.credit_range || 'No credit application on this lead'} />
          </DetailBlock>
        )}
      </div>
    </aside>
  );
}

// Scraped engine strings run long ("3.0L V6 DOHC 24V"); displacement +
// layout is what fits the card and what staff actually quote.
function shortEngine(engine) {
  if (!engine) return null;
  return engine.split(/\s+/).slice(0, 2).join(' ');
}

function titleCase(text) {
  return text ? text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : null;
}

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DetailBlock({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[13.5px] font-semibold text-white">
        <Icon size={16} strokeWidth={1.8} className="text-[#aab3ba]" /> {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3 py-1.5 text-[13px]" style={{ borderBottom: '1px solid var(--admin-border)' }}>
      <span className="w-24 shrink-0 text-[#89939c]">{label}</span>
      <span className="text-[#e6eaed]">{value}</span>
    </div>
  );
}

const EVENT_TITLES = {
  status_change: 'Status changed',
  note: 'Staff note added',
  vehicle_status_change: 'Vehicle status changed',
};

function TimelineItem({ ev, lead, isFacebook, last }) {
  const rail = !last && <span className="absolute bottom-0 left-[11px] top-7 w-px" style={{ background: 'var(--admin-border-strong)' }} />;

  if (ev.kind === 'created') {
    return (
      <li className="relative pb-4 pl-9">
        {rail}
        <span className="absolute left-0 top-0">
          {isFacebook ? (
            <FbMark size={23} />
          ) : (
            <span className="grid h-[23px] w-[23px] place-items-center rounded-full" style={{ background: '#1a2025', border: '1px solid var(--admin-border-strong)' }}>
              <Globe size={13} className="text-[#aab3ba]" />
            </span>
          )}
        </span>
        <p className="text-[13.5px]">
          <span className="font-semibold text-white">{isFacebook ? 'Facebook Message' : 'Website Inquiry'}</span>
          <span className="ml-2 text-[12px] text-[#89939c]">{timeAgo(ev.created_at)}</span>
        </p>
        {ev.text ? (
          <p className="mt-2 rounded-[6px] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#eef1f3]" style={{ background: '#161c20', border: '1px solid var(--admin-border)' }}>
            {ev.text}
          </p>
        ) : (
          <p className="mt-1 text-[12.5px] text-[#89939c]">Lead created{lead.vehicle_title ? ` · ${lead.vehicle_title}` : ''}</p>
        )}
      </li>
    );
  }

  if (ev.kind === 'auto_reply') {
    return (
      <li className="relative pb-4 pl-9">
        {rail}
        <span className="absolute left-0 top-0 grid h-[23px] w-[23px] place-items-center rounded-full" style={{ background: 'rgba(242,13,13,0.14)', border: '1px solid rgba(242,13,13,0.5)' }}>
          <Send size={11} className="text-[#ff4a42]" />
        </span>
        <p className="text-[13.5px]">
          <span className="font-semibold text-white">Auto Reply Sent</span>
          <span className="ml-2 text-[12px] text-[#89939c]">{timeAgo(ev.created_at)}</span>
        </p>
        <p className="mt-2 inline-block rounded-[6px] px-3.5 py-2 text-[13px] text-[#eef1f3]" style={{ background: 'rgba(242,13,13,0.08)', border: '1px solid rgba(242,13,13,0.3)' }}>
          {ev.text}
        </p>
      </li>
    );
  }

  return (
    <li className="relative pb-4 pl-9">
      {rail}
      <span className="absolute left-[4px] top-[3px] grid h-[15px] w-[15px] place-items-center rounded-full" style={{ background: 'var(--admin-bg)', border: '1px solid var(--admin-border-strong)' }}>
        <Dot size={14} className="text-[#aab3ba]" />
      </span>
      <p className="text-[13px]">
        <span className="font-medium text-[#e6eaed]">{EVENT_TITLES[ev.kind] || ev.kind}</span>
        <span className="ml-2 text-[12px] text-[#89939c]">{timeAgo(ev.created_at)}</span>
      </p>
      {ev.text && <p className="mt-0.5 text-[12.5px] text-[#aab3ba]">{ev.text}</p>}
    </li>
  );
}
