'use client';
import { useState } from 'react';
import { MapPin, Phone, Clock, Check, Loader2 } from 'lucide-react';
import { DEALER } from '@/lib/site';

export default function AdminSettings({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="p-4 md:p-6">
        <h1 className="mb-5 font-display text-xl font-black uppercase">Settings</h1>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="panel rounded-[6px] p-6">
            <h2 className="mb-1 font-display text-[14px] font-black uppercase tracking-[0.06em]">Dealership Info</h2>
            <p className="mb-4 text-[11.5px]" style={{ color: 'var(--muted)' }}>
              Set in code (<code>lib/site.js</code>) so it stays in sync with the public site — edit there to change it.
            </p>
            <div className="space-y-3 text-[13px]">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-crimson" /> {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-crimson" /> {DEALER.phone}
              </p>
              <p className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 shrink-0 text-crimson" />
                <span>
                  {DEALER.hours}
                  <br />
                  {DEALER.hoursWeekend}
                </span>
              </p>
            </div>
          </section>

          <section className="panel rounded-[6px] p-6">
            <h2 className="mb-4 font-display text-[14px] font-black uppercase tracking-[0.06em]">Facebook Automation</h2>

            <label className="mb-4 flex items-center justify-between gap-3">
              <span className="text-[12.5px] font-semibold">Enable quick-reply automation</span>
              <button
                onClick={() => set('facebookAutomationEnabled', settings.facebookAutomationEnabled === 'true' ? 'false' : 'true')}
                className="relative h-6 w-11 shrink-0 rounded-full transition"
                style={{ background: settings.facebookAutomationEnabled === 'true' ? '#E10600' : 'var(--surface-2)', border: '1px solid var(--line)' }}
                aria-pressed={settings.facebookAutomationEnabled === 'true'}
              >
                <span
                  className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition"
                  style={{ left: settings.facebookAutomationEnabled === 'true' ? '22px' : '2px' }}
                />
              </button>
            </label>

            <label className="mb-4 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                Default reply when vehicle status is unknown
              </span>
              <input
                value={settings.defaultUnknownReply || ''}
                onChange={(e) => set('defaultUnknownReply', e.target.value)}
                className="field"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                Test-drive link pattern <span className="normal-case">(use {'{id}'} for the vehicle id)</span>
              </span>
              <input
                value={settings.testDriveLinkPattern || ''}
                onChange={(e) => set('testDriveLinkPattern', e.target.value)}
                className="field"
              />
            </label>
          </section>

          <section className="panel rounded-[6px] p-6">
            <h2 className="mb-4 font-display text-[14px] font-black uppercase tracking-[0.06em]">Website</h2>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                Website base URL <span className="normal-case">(used to build links in staff replies)</span>
              </span>
              <input
                value={settings.websiteBaseUrl || ''}
                onChange={(e) => set('websiteBaseUrl', e.target.value)}
                placeholder="https://affordablecarsalesoh.com"
                className="field"
              />
            </label>
          </section>
        </div>

        <button onClick={save} disabled={busy} className="btn-red mt-5 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
          {busy ? 'Saving…' : saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
