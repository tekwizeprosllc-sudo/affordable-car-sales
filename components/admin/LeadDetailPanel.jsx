'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X, Phone, Mail, Calendar, Link2, Check, Loader2, Car, ExternalLink,
  Clock, MessageSquare, StickyNote, CalendarCheck, RefreshCw, CreditCard, Facebook,
} from 'lucide-react';
import { CHANNELS, leadChannel, NEXT_ACTIONS, STATUS_COLORS } from '@/lib/leads';
import { VEHICLE_STATUSES, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from '@/lib/vehicles';

const STATUSES = ['new', 'contacted', 'scheduled', 'showed', 'won', 'lost'];

const EVENT_LABELS = {
  created: 'Lead created',
  status_change: 'Status changed',
  auto_reply: 'Auto reply sent',
  note: 'Staff note added',
  vehicle_status_change: 'Vehicle status changed',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

const REPLY_TEXT = (status, defaultUnknown) => ({
  live: 'Yes, it is available!',
  pending: 'It is currently pending sale.',
  sold: 'That one is no longer available.',
  unknown: defaultUnknown || 'Needs staff confirmation.',
}[status] || defaultUnknown || 'Needs staff confirmation.');

export default function LeadDetailPanel({ lead, onClose, onUpdate, settings }) {
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('timeline');
  const [noteDraft, setNoteDraft] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionDraft, setActionDraft] = useState({ action: '', due: '' });

  useEffect(() => {
    setTab('timeline');
    setScheduling(false);
    setActionDraft({ action: lead?.next_action || '', due: lead?.next_action_due ? lead.next_action_due.slice(0, 16) : '' });
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

  if (!lead) return null;

  const ch = CHANNELS[leadChannel(lead.source)];
  const isFacebook = leadChannel(lead.source) === 'facebook';

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
        return updated;
      }
    } finally {
      setBusy(false);
    }
    return null;
  }

  async function setStatus(status) {
    await patchLead({ status });
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
    await refreshEvents();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function scheduleLink() {
    const origin = settings?.websiteBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    const pattern = settings?.testDriveLinkPattern || '/inventory/{id}?action=test-drive';
    if (lead.vehicle_id) return `${origin}${pattern.replace('{id}', lead.vehicle_id)}`;
    return `${origin}/vehicle-request`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(scheduleLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const vehicleStatus = vehicle?.status || 'unknown';

  return (
    <aside
      className="flex h-full flex-col overflow-y-auto rounded-[6px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      <div className="flex items-start justify-between gap-3 p-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crimson text-[14px] font-extrabold text-white">
            {initials(lead.name)}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[18px] font-bold uppercase leading-tight">{lead.name}</h3>
              <span
                className="rounded-[2px] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-white"
                style={{ background: STATUS_COLORS[lead.status] || '#5C6066' }}
              >
                {lead.status}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px]" style={{ color: 'var(--muted)' }}>
              {timeAgo(lead.created_at)}
            </p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)' }} className="transition hover:text-crimson">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
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

        <div className="grid grid-cols-4 gap-2">
          <a href={lead.phone ? `tel:${lead.phone.replace(/[^0-9+]/g, '')}` : undefined} className="btn-red col-span-1 justify-center py-2 text-[10px]" aria-disabled={!lead.phone}>
            <Phone size={13} /> Call
          </a>
          <a href={lead.email ? `mailto:${lead.email}` : undefined} className="btn-ghost col-span-1 justify-center py-2 text-[10px]" aria-disabled={!lead.email}>
            <Mail size={13} /> Email
          </a>
          <button onClick={() => setScheduling((v) => !v)} className="btn-ghost col-span-1 justify-center py-2 text-[10px]">
            <Calendar size={13} /> Schedule
          </button>
          <button onClick={copyLink} className="btn-ghost col-span-1 justify-center py-2 text-[10px]">
            {copied ? <Check size={13} /> : <Link2 size={13} />} {copied ? 'Copied' : 'Send Link'}
          </button>
        </div>

        {scheduling && (
          <div className="flex gap-2">
            <input
              value={scheduleDraft}
              onChange={(e) => setScheduleDraft(e.target.value)}
              placeholder="e.g. Sat 2pm"
              aria-label="Schedule time"
              className="field h-9 flex-1 text-[12px]"
              autoFocus
            />
            <button onClick={schedule} disabled={busy || !scheduleDraft.trim()} className="btn-red h-9 py-0 text-[10px] disabled:opacity-45">
              {busy ? <Loader2 size={13} className="animate-spin" /> : <CalendarCheck size={13} />} Set
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={busy || lead.status === s}
              onClick={() => setStatus(s)}
              className="rounded-[3px] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.1em] transition disabled:opacity-40"
              style={
                lead.status === s
                  ? { background: STATUS_COLORS[s], color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {lead.vehicle_id && (
        <div className="p-5" style={{ borderBottom: '1px solid var(--line)' }}>
          {vehicleLoading ? (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--muted)' }}>
              <Loader2 size={14} className="animate-spin" /> Loading vehicle…
            </div>
          ) : vehicle ? (
            <div>
              <Link
                href={`/inventory/${lead.vehicle_id}`}
                target="_blank"
                className="flex gap-3 rounded-[5px] p-2 transition hover:bg-[var(--surface-2)]"
              >
                {vehicle.image ? (
                  <img src={vehicle.image} alt="" className="h-16 w-24 shrink-0 rounded-[4px] object-cover" />
                ) : (
                  <div className="grid h-16 w-24 shrink-0 place-items-center rounded-[4px]" style={{ background: 'var(--surface-2)' }}>
                    <Car size={20} style={{ color: 'var(--muted)' }} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 font-display text-[13.5px] font-bold uppercase leading-tight">
                    {vehicle.year} {vehicle.make} {vehicle.model} <ExternalLink size={11} className="shrink-0" style={{ color: 'var(--muted)' }} />
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {[vehicle.trim, vehicle.stock ? `Stock ${vehicle.stock}` : null].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-0.5 text-[13px] font-extrabold text-crimson">
                    {vehicle.price ? `$${vehicle.price.toLocaleString()}` : 'Call for price'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {[vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null, vehicle.engine, vehicle.drive, vehicle.color]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </Link>

              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                  Vehicle Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VEHICLE_STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={busy || vehicleStatus === s}
                      onClick={() => setVehicleStatus(s)}
                      className="rounded-[3px] px-2.5 py-1.5 text-[10px] font-bold transition disabled:opacity-100"
                      style={
                        vehicleStatus === s
                          ? { background: VEHICLE_STATUS_COLORS[s] || 'var(--surface-2)', color: '#fff', border: '1px solid transparent' }
                          : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }
                      }
                    >
                      {VEHICLE_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--muted)' }}>
              <Car size={14} /> {lead.vehicle_title || 'Vehicle no longer listed'}
            </p>
          )}
        </div>
      )}

      {isFacebook && (
        <div className="p-5" style={{ borderBottom: '1px solid var(--line)' }}>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            <Facebook size={12} /> Facebook Message
          </p>
          <p className="rounded-[5px] p-3 text-[13px] leading-relaxed" style={{ background: 'var(--surface-2)' }}>
            {lead.message || '—'}
          </p>

          <p className="mb-2 mt-4 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Facebook Auto Reply
          </p>
          <div className="flex flex-col gap-1.5">
            {VEHICLE_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => sendQuickReply(s)}
                disabled={!lead.vehicle_id && s !== 'unknown'}
                className="rounded-[4px] px-3 py-2 text-left text-[12px] font-semibold transition hover:border-crimson/60 disabled:opacity-40"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
              >
                {REPLY_TEXT(s, settings?.defaultUnknownReply)}
              </button>
            ))}
          </div>

          <button onClick={copyLink} className="btn-ghost mt-3 w-full py-2 text-[11px]">
            {copied ? <Check size={13} /> : <Link2 size={13} />} Schedule at this link
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Next Action
          </p>
          <div className="flex gap-2">
            <select
              value={actionDraft.action}
              onChange={(e) => setActionDraft((d) => ({ ...d, action: e.target.value }))}
              aria-label="Next action"
              className="field h-9 flex-1 text-[12px]"
            >
              <option value="">None</option>
              {NEXT_ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={actionDraft.due}
              onChange={(e) => setActionDraft((d) => ({ ...d, due: e.target.value }))}
              aria-label="Next action due"
              className="field h-9 text-[12px]"
            />
            <button onClick={saveNextAction} disabled={busy} className="btn-ghost h-9 py-0 text-[10px]">
              Save
            </button>
          </div>
        </div>

        <div className="mb-3 flex gap-1 rounded-[4px] p-1" style={{ background: 'var(--surface-2)' }}>
          {[
            ['timeline', 'Timeline', Clock],
            ['notes', 'Notes', StickyNote],
            ['test_drive', 'Test Drive', CalendarCheck],
            ['trade_in', 'Trade-In', RefreshCw],
            ['credit_app', 'Credit App', CreditCard],
          ].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex flex-1 items-center justify-center gap-1 rounded-[3px] px-2 py-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.06em] transition ${tab === key ? 'bg-crimson text-white' : ''}`}
              style={tab === key ? undefined : { color: 'var(--muted)' }}
            >
              <Icon size={11} /> {label}
            </button>
          ))}
        </div>

        {tab === 'timeline' && (
          <div className="flex flex-col gap-2.5">
            {events.length === 0 && <p className="text-[12px]" style={{ color: 'var(--muted)' }}>No activity yet.</p>}
            {events.map((ev) => (
              <div key={ev.id} className="flex gap-2 text-[12px]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
                <div>
                  <p className="font-semibold">{EVENT_LABELS[ev.kind] || ev.kind}</p>
                  {ev.text && <p style={{ color: 'var(--muted)' }}>{ev.text}</p>}
                  <p className="text-[10.5px]" style={{ color: 'var(--muted)' }}>{timeAgo(ev.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'notes' && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add a note…"
                aria-label="Add a note"
                className="field h-9 flex-1 text-[12px]"
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <button onClick={addNote} disabled={busy || !noteDraft.trim()} className="btn-red h-9 py-0 text-[10px] disabled:opacity-45">
                Add
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {events.filter((e) => e.kind === 'note').length === 0 && (
                <p className="text-[12px]" style={{ color: 'var(--muted)' }}>No notes yet.</p>
              )}
              {events.filter((e) => e.kind === 'note').map((ev) => (
                <div key={ev.id} className="rounded-[4px] p-2.5 text-[12px]" style={{ background: 'var(--surface-2)' }}>
                  <p>{ev.text}</p>
                  <p className="mt-1 text-[10.5px]" style={{ color: 'var(--muted)' }}>{timeAgo(ev.created_at)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'test_drive' && (
          <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
            <p>Requested: {[lead.preferred_date, lead.preferred_time].filter(Boolean).join(' · ') || 'No time given'}</p>
            {lead.notes && <p className="mt-1">{lead.notes}</p>}
          </div>
        )}

        {tab === 'trade_in' && (
          <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {lead.trade_details ? <p>{lead.trade_details}</p> : <p>No trade-in details on this lead.</p>}
          </div>
        )}

        {tab === 'credit_app' && (
          <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {lead.credit_range ? <p>Credit range: {lead.credit_range}</p> : <p>No credit application on this lead.</p>}
          </div>
        )}
      </div>
    </aside>
  );
}
