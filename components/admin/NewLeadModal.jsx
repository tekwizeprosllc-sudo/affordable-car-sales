'use client';
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const TYPES = [
  { value: 'contact', label: 'General' },
  { value: 'vehicle_inquiry', label: 'Vehicle Question' },
  { value: 'test_drive', label: 'Test Drive' },
  { value: 'financing', label: 'Financing' },
  { value: 'trade_in', label: 'Trade-In' },
  { value: 'vehicle_request', label: 'Car Request' },
];

export default function NewLeadModal({ onClose, onCreated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'Staff added' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save that lead.');
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[6px] p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-black uppercase">New Lead</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: 'var(--muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="name" required minLength={2} className="field" placeholder="Name *" />
            <select name="type" defaultValue="contact" aria-label="Lead type" className="field">
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="phone" className="field" placeholder="Phone" inputMode="tel" />
            <input name="email" type="email" className="field" placeholder="Email" />
          </div>
          <input name="vehicleTitle" className="field" placeholder="Vehicle (optional)" />
          <textarea name="message" rows={3} className="field h-auto py-2.5" placeholder="Notes" />
        </div>

        {error && <p className="mt-3 text-[12px] font-semibold text-crimson">{error}</p>}

        <button type="submit" disabled={busy} className="btn-red mt-4 w-full disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : null}
          {busy ? 'Saving…' : 'Add Lead'}
        </button>
      </form>
    </div>
  );
}
