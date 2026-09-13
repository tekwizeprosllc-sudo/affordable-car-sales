'use client';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { CATEGORIES, PRICE_BUCKETS, SORTS, applyFilters, sortVehicles } from '@/lib/vehicleUtils';

const EMPTY = { q: '', category: '', make: '', model: '', maxPrice: '' };

export default function InventoryBrowser({ vehicles, initialQuery = '' }) {
  const [filters, setFilters] = useState({ ...EMPTY, q: initialQuery });
  const [sort, setSort] = useState('price-asc');

  const makes = useMemo(() => [...new Set(vehicles.map((v) => v.make).filter(Boolean))].sort(), [vehicles]);
  const models = useMemo(
    () =>
      [
        ...new Set(
          vehicles.filter((v) => !filters.make || v.make === filters.make).map((v) => v.model).filter(Boolean)
        ),
      ].sort(),
    [vehicles, filters.make]
  );

  const results = useMemo(
    () => sortVehicles(applyFilters(vehicles, filters), sort),
    [vehicles, filters, sort]
  );

  const set = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value, ...(key === 'make' ? { model: '' } : {}) }));

  const active = Object.entries(filters).filter(([, v]) => v);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-12 lg:grid-cols-[270px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="panel rounded-[5px] p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-[15px] font-bold uppercase tracking-[0.14em]">
            <SlidersHorizontal size={15} className="text-crimson" /> Filters
          </h2>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-[3px] px-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              <Search size={15} style={{ color: 'var(--muted)' }} />
              <input
                value={filters.q}
                onChange={(e) => set('q', e.target.value)}
                placeholder="Search inventory…"
                aria-label="Search inventory"
                className="w-full bg-transparent py-2.5 text-[13px] outline-none placeholder:text-[color:var(--muted)]"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map(({ key, label }) => {
                const on = filters.category === key;
                return (
                  <button
                    key={key}
                    onClick={() => set('category', on ? '' : key)}
                    className={`min-h-[40px] rounded-[3px] px-1 py-2 text-[10px] font-extrabold uppercase tracking-[0.08em] transition ${
                      on ? 'bg-crimson text-white' : 'hover:text-crimson'
                    }`}
                    style={on ? undefined : { background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <select className="field" value={filters.make} onChange={(e) => set('make', e.target.value)} aria-label="Make">
              <option value="">All Makes</option>
              {makes.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select className="field" value={filters.model} onChange={(e) => set('model', e.target.value)} aria-label="Model">
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select className="field" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} aria-label="Max price">
              <option value="">Max Price</option>
              {PRICE_BUCKETS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>

            <select className="field" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {active.length > 0 && (
              <button
                onClick={() => setFilters({ ...EMPTY })}
                className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-crimson"
              >
                <X size={13} /> Clear All Filters
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          Showing {results.length} of {vehicles.length} vehicles
        </p>

        {results.length === 0 ? (
          <div className="panel flex flex-col items-center gap-3 rounded-[5px] px-6 py-20 text-center">
            <p className="font-display text-2xl font-bold uppercase">Nothing matches that search</p>
            <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
              Inventory turns over fast — try widening your filters.
            </p>
            <button onClick={() => setFilters({ ...EMPTY })} className="btn-ghost mt-1">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
