'use client';
import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

const CREDIT_RANGES = ['Excellent (720+)', 'Good (660-719)', 'Fair (600-659)', 'Rebuilding (below 600)', 'Not sure'];
const TIMES = ['Morning (9AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-7PM)'];

export default function LeadForm({
  type,
  vehicleId,
  vehicleTitle,
  source,
  submitLabel = 'Send Request',
  successTitle = 'Got it — we’ll be in touch.',
  successCopy = 'A real person from our team will reach out shortly.',
  fields = {},
  compact = false,
}) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setState('loading');
    setError('');

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, type, vehicleId, vehicleTitle, source }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong.');
      setState('done');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="panel flex flex-col items-start gap-2 rounded-[5px] p-6">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-crimson text-white">
          <Check size={18} />
        </span>
        <h3 className="font-display text-xl font-bold uppercase">{successTitle}</h3>
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          {successCopy}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className={compact ? 'grid gap-3' : 'grid gap-3 sm:grid-cols-2'}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Name
          </span>
          <input name="name" required minLength={2} className="field" placeholder="Your name" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Phone
          </span>
          <input name="phone" className="field" placeholder="(513) 555-0123" inputMode="tel" />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          Email
        </span>
        <input name="email" type="email" className="field" placeholder="you@email.com" />
      </label>

      {fields.schedule && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Preferred Date
            </span>
            <input name="preferredDate" type="date" className="field" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
              Preferred Time
            </span>
            <select name="preferredTime" className="field">
              <option value="">Any time</option>
              {TIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {fields.credit && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Credit Range
          </span>
          <select name="creditRange" className="field">
            <option value="">Prefer not to say</option>
            {CREDIT_RANGES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}

      {fields.trade && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
            Your Current Vehicle
          </span>
          <input name="tradeDetails" className="field" placeholder="Year, make, model, mileage, condition" />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          {fields.messageLabel || 'Message'}
        </span>
        <textarea
          name="message"
          rows={compact ? 3 : 4}
          className="field h-auto py-2.5 leading-relaxed"
          placeholder={fields.messagePlaceholder || 'Anything we should know?'}
        />
      </label>

      {error && (
        <p className="flex items-center gap-2 text-[12px] font-semibold text-crimson">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <button type="submit" disabled={state === 'loading'} className="btn-red mt-1 disabled:opacity-60">
        {state === 'loading' ? <Loader2 size={15} className="animate-spin" /> : null}
        {state === 'loading' ? 'Sending…' : submitLabel}
      </button>

      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
        We’ll only use your info to answer this request. No spam, no selling your data.
      </p>
    </form>
  );
}
