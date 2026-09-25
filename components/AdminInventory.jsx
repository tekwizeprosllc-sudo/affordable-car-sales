'use client';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, EyeOff, Eye, Loader2, X, Search, ExternalLink, Car } from 'lucide-react';
import { VEHICLE_STATUSES, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS as STATUS_COLORS } from '@/lib/vehicles';

const BODY_TYPES = ['Sedan', 'Coupe', 'SUV', 'Truck', 'Van-Minivan', 'Wagon', 'Hatchback'];

function StatusPills({ value, onChange, disabled }) {
  return (
    <span className="flex flex-wrap gap-1">
      {VEHICLE_STATUSES.map((s) => (
        <button
          key={s}
          disabled={disabled || value === s}
          onClick={() => onChange(s)}
          className="rounded-[3px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] transition disabled:opacity-100"
          style={
            value === s
              ? { background: STATUS_COLORS[s] || 'var(--surface-2)', color: '#fff', border: '1px solid transparent' }
              : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }
          }
        >
          {VEHICLE_STATUS_LABELS[s]}
        </button>
      ))}
    </span>
  );
}

function Thumb({ src }) {
  return src ? (
    <img src={src} alt="" className="h-14 w-20 shrink-0 rounded-[4px] object-cover" />
  ) : (
    <div className="grid h-14 w-20 shrink-0 place-items-center rounded-[4px]" style={{ background: 'var(--surface-2)' }}>
      <Car size={18} style={{ color: 'var(--muted)' }} />
    </div>
  );
}

function matches(term, ...fields) {
  if (!term) return true;
  const haystack = fields.filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(term);
}

function normalizedSelectValue(name, value) {
  const text = String(value || '').toLowerCase();
  if (name === 'bodyType') {
    if (text.includes('sport utility') || text.includes('crossover')) return 'SUV';
    if (text.includes('pickup') || text.includes('truck')) return 'Truck';
    if (text.includes('minivan') || text.includes('van')) return 'Van-Minivan';
    if (text.includes('hatchback')) return 'Hatchback';
    if (text.includes('wagon')) return 'Wagon';
    if (text.includes('coupe')) return 'Coupe';
    if (text.includes('sedan') || text.includes('saloon')) return 'Sedan';
  }
  if (name === 'drive') {
    if (text.includes('all-wheel') || text === 'awd') return 'AWD';
    if (text.includes('front-wheel') || text === 'fwd') return 'FWD';
    if (text.includes('rear-wheel') || text === 'rwd') return 'RWD';
    if (text.includes('4wd') || text.includes('4-wheel') || text.includes('4x4')) return '4WD';
  }
  return value;
}

function fillFormField(form, name, value) {
  const field = form?.elements?.[name];
  if (!field || value == null || value === '') return;
  field.value = normalizedSelectValue(name, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
}

export default function AdminInventory({ initialManual, scraped, initialOverrides, dbError }) {
  const [manual, setManual] = useState(initialManual || []);
  const [overrides, setOverrides] = useState(initialOverrides || {});
  const [busy, setBusy] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [vinBusy, setVinBusy] = useState(false);
  const [vinNotice, setVinNotice] = useState('');
  const vehicleFormRef = useRef(null);
  const [q, setQ] = useState('');

  const term = q.trim().toLowerCase();
  const filteredManual = useMemo(
    () => manual.filter((v) => matches(term, v.year, v.make, v.model, v.trim, v.stock, v.vin)),
    [manual, term]
  );
  const filteredScraped = useMemo(
    () => scraped.filter((v) => matches(term, v.year, v.make, v.model, v.stock, v.vin)),
    [scraped, term]
  );

  async function decodeVin() {
    const form = vehicleFormRef.current;
    const vin = String(form?.elements?.vin?.value || '').trim().toUpperCase();
    setVinNotice('');
    if (vin.length !== 17) {
      setVinNotice('Enter all 17 VIN characters first.');
      return;
    }
    setVinBusy(true);
    try {
      const res = await fetch(`/api/admin/vin/${encodeURIComponent(vin)}`);
      const json = await res.json();
      if (!res.ok) {
        setVinNotice(json.error || 'VIN lookup failed.');
        return;
      }

      ['year', 'make', 'model', 'trim', 'bodyType', 'drive', 'engine', 'trans', 'vin']
        .forEach((name) => fillFormField(form, name, json[name]));

      const duplicateMessage = json.duplicate
        ? `Already in inventory: ${json.duplicate.title || json.duplicate.id}. Details were still filled for review.`
        : '';
      setVinNotice(duplicateMessage || json.warning || 'VIN decoded. Confirm all equipment and options before saving.');
    } catch {
      setVinNotice('VIN lookup could not connect. Try again.');
    } finally {
      setVinBusy(false);
    }
  }

  async function addVehicle(e) {
    e.preventDefault();
    setBusy('new');
    setError('');
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.photos = (payload.photos || '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    payload.badges = (payload.badges || '').split(',').map((s) => s.trim()).filter(Boolean);

    const res = await fetch('/api/admin/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok) {
      setManual((prev) => [json.vehicle, ...prev]);
      setAdding(false);
      e.target.reset();
    } else setError(json.error || 'Could not save that vehicle.');
    setBusy(null);
  }

  async function setManualStatus(id, status) {
    setBusy(id);
    const res = await fetch('/api/admin/vehicles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const { vehicle } = await res.json();
      setManual((prev) => prev.map((v) => (v.manualId === id ? vehicle : v)));
    }
    setBusy(null);
  }

  async function removeVehicle(id) {
    setBusy(id);
    const res = await fetch(`/api/admin/vehicles?id=${id}`, { method: 'DELETE' });
    if (res.ok) setManual((prev) => prev.filter((v) => v.manualId !== id));
    setBusy(null);
  }

  async function overrideScraped(vehicleId, patch) {
    setBusy(vehicleId);
    const res = await fetch('/api/admin/vehicles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scrapedId: vehicleId, ...patch }),
    });
    if (res.ok) {
      setOverrides((prev) => ({ ...prev, [vehicleId]: { ...prev[vehicleId], ...patch } }));
    }
    setBusy(null);
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase">Inventory</h1>
          <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {scraped.length} vehicles syncing live from the lot · {manual.length} added by staff
          </p>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn-red">
          {adding ? <X size={15} /> : <Plus size={15} />} {adding ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      <div
        className="mb-6 flex items-center gap-2 rounded-[3px] px-3"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
      >
        <Search size={15} style={{ color: 'var(--muted)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search make, model, stock #, or VIN…"
          aria-label="Search inventory"
          className="w-full max-w-md bg-transparent py-2.5 text-[13px] outline-none placeholder:text-[color:var(--muted)]"
        />
      </div>

      {dbError && (
        <p className="panel mb-5 rounded-[5px] p-4 text-[12.5px]" style={{ color: 'var(--muted)' }}>
          Staff-managed inventory needs a database. Set <code>DATABASE_URL</code> to enable adding and hiding vehicles.
        </p>
      )}

      {adding && (
        <form ref={vehicleFormRef} onSubmit={addVehicle} className="panel mb-6 rounded-[5px] p-5">
          <h2 className="mb-4 font-display text-lg font-black uppercase">New Vehicle</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input name="year" className="field" placeholder="Year" inputMode="numeric" />
            <input name="make" className="field" placeholder="Make *" required />
            <input name="model" className="field" placeholder="Model *" required />
            <input name="trim" className="field" placeholder="Trim" />
            <input name="price" className="field" placeholder="Price" inputMode="numeric" />
            <input name="mileage" className="field" placeholder="Miles" inputMode="numeric" />
            <select name="bodyType" className="field" defaultValue="">
              <option value="">Body type</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select name="drive" className="field" defaultValue="">
              <option value="">Drivetrain</option>
              {['FWD', 'RWD', 'AWD', '4WD'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input name="engine" className="field" placeholder="Engine" />
            <input name="trans" className="field" placeholder="Transmission" />
            <div className="flex gap-2">
              <input name="vin" className="field min-w-0 flex-1 uppercase" placeholder="17-character VIN" maxLength={17} />
              <button type="button" onClick={decodeVin} disabled={vinBusy} className="btn-red shrink-0 px-3">
                {vinBusy ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Decode
              </button>
            </div>
            <input name="stock" className="field" placeholder="Stock #" />
          </div>
          <div className="mt-3 grid gap-3">
            <input name="badges" className="field" placeholder="Badges, comma separated (One Owner, Clean Carfax)" />
            <textarea name="description" rows={3} className="field h-auto py-2.5" placeholder="Description" />
            <textarea
              name="photos"
              rows={2}
              className="field h-auto py-2.5"
              placeholder="Photo URLs, one per line (Vercel Blob uploads land here once BLOB_READ_WRITE_TOKEN is set)"
            />
          </div>
          {vinNotice && <p className="mt-3 text-[12px] font-semibold" style={{ color: 'var(--muted)' }}>{vinNotice}</p>}
          {error && <p className="mt-3 text-[12px] font-semibold text-crimson">{error}</p>}
          <button type="submit" disabled={busy === 'new'} className="btn-red mt-4">
            {busy === 'new' ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Save Vehicle
          </button>
        </form>
      )}

      {filteredManual.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
            Staff-added
          </h2>
          <div className="flex flex-col gap-2">
            {filteredManual.map((v) => (
              <article key={v.id} className="panel flex flex-wrap items-center gap-4 rounded-[5px] p-4">
                <Thumb src={v.image} />
                <div className="min-w-0 flex-1">
                  <Link href={`/inventory/${v.id}`} target="_blank" className="inline-flex items-center gap-1.5 transition hover:text-crimson">
                    <h3 className="font-display text-[16px] font-bold uppercase">
                      {v.year} {v.make} {v.model} {v.trim}
                    </h3>
                    <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
                  </Link>
                  <p className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
                    {[
                      v.price ? `$${v.price.toLocaleString()}` : 'No price',
                      v.mileage ? `${v.mileage.toLocaleString()} mi` : null,
                      v.bodyType,
                      v.vin ? `VIN ${v.vin}` : null,
                      `${v.photos.length} photo${v.photos.length === 1 ? '' : 's'}`,
                    ]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </p>
                </div>
                <StatusPills value={v.status} disabled={busy === v.manualId} onChange={(s) => setManualStatus(v.manualId, s)} />
                <button
                  onClick={() => removeVehicle(v.manualId)}
                  disabled={busy === v.manualId}
                  aria-label="Delete vehicle"
                  className="grid h-8 w-8 place-items-center rounded-[3px] transition hover:text-crimson"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-[13px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--muted)' }}>
          Live from the lot
        </h2>
        <div className="flex flex-col gap-2">
          {filteredScraped.map((v) => {
            const o = overrides[v.id] || {};
            const hidden = !!o.hidden || o.status === 'sold';
            return (
              <article key={v.id} className="panel flex flex-wrap items-center gap-4 rounded-[5px] p-4" style={hidden ? { opacity: 0.55 } : undefined}>
                <Thumb src={v.image} />
                <div className="min-w-0 flex-1">
                  <Link href={`/inventory/${v.id}`} target="_blank" className="inline-flex items-center gap-1.5 transition hover:text-crimson">
                    <h3 className="font-display text-[16px] font-bold uppercase">
                      {v.year} {v.make} {v.model}
                    </h3>
                    <ExternalLink size={12} style={{ color: 'var(--muted)' }} />
                  </Link>
                  <p className="text-[11.5px]" style={{ color: 'var(--muted)' }}>
                    {[
                      v.price ? `$${v.price.toLocaleString()}` : 'Call for price',
                      v.mileage ? `${v.mileage.toLocaleString()} mi` : null,
                      `Stock ${v.stock}`,
                      v.vin ? `VIN ${v.vin}` : null,
                    ]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </p>
                </div>
                <StatusPills
                  value={o.status || 'live'}
                  disabled={busy === v.id || dbError}
                  onChange={(s) => overrideScraped(v.id, { status: s })}
                />
                <button
                  onClick={() => overrideScraped(v.id, { hidden: !o.hidden })}
                  disabled={busy === v.id || dbError}
                  aria-label={o.hidden ? 'Show on site' : 'Hide from site'}
                  className="grid h-8 w-8 place-items-center rounded-[3px] transition hover:text-crimson disabled:opacity-45"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
                >
                  {o.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </article>
            );
          })}
          {filteredScraped.length === 0 && (
            <p className="panel rounded-[5px] p-8 text-center text-[13px]" style={{ color: 'var(--muted)' }}>
              No vehicles match that search.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
