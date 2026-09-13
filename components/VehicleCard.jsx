'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowRight, GitCompare } from 'lucide-react';
import { ROUTES } from '@/lib/site';
import { chipsFor } from '@/lib/vehicleUtils';
import PhotoComingSoon from './PhotoComingSoon';
import { useCompare } from './CompareContext';

export default function VehicleCard({ vehicle, className = '' }) {
  const { has, toggle: toggleCompare, full } = useCompare();
  const comparing = has(vehicle.id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('acs_saved') || '[]');
      setSaved(list.includes(vehicle.id));
    } catch (e) {}
  }, [vehicle.id]);

  const toggleSaved = () => {
    setSaved((was) => {
      const next = !was;
      try {
        const list = JSON.parse(localStorage.getItem('acs_saved') || '[]');
        const updated = next ? [...new Set([...list, vehicle.id])] : list.filter((id) => id !== vehicle.id);
        localStorage.setItem('acs_saved', JSON.stringify(updated));
      } catch (e) {}
      return next;
    });
  };
  const [broken, setBroken] = useState(false);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const chips = chipsFor(vehicle);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[5px] transition duration-300 hover:-translate-y-1 ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
    >
      <Link href={ROUTES.vehicle(vehicle.id)} className="relative block aspect-[16/10] overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        {vehicle.image && !broken ? (
          <img
            src={vehicle.image}
            alt={title}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-500 [filter:saturate(0.85)_contrast(1.05)] group-hover:scale-[1.05] group-hover:[filter:saturate(1)_contrast(1.05)]"
          />
        ) : (
          <PhotoComingSoon vehicle={vehicle} />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
      </Link>

      <button
        onClick={toggleSaved}
        aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-crimson"
      >
        <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-bold uppercase leading-tight">{title}</h3>
            <p className="mt-0.5 truncate text-[11.5px] font-semibold" style={{ color: 'var(--muted)' }}>
              {[vehicle.trim, vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null, vehicle.bodyType]
                .filter(Boolean)
                .join('  ·  ')}
            </p>
          </div>
          <div className="shrink-0 text-right font-display text-[22px] font-black leading-none text-crimson">
            {vehicle.price ? `$${vehicle.price.toLocaleString()}` : <span className="text-accent text-[13px]">Call</span>}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-[2px] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em]"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 pt-0 [margin-top:auto]">
          <Link
            href={ROUTES.vehicle(vehicle.id)}
            className="btn-ghost flex-1 justify-center py-2.5 text-[11px]"
          >
            View Details <ArrowRight size={13} />
          </Link>
          <button
            onClick={() => toggleCompare(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
            disabled={!comparing && full}
            title={!comparing && full ? 'Compare holds three at a time' : 'Add to compare'}
            aria-pressed={comparing}
            className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[3px] transition disabled:opacity-40 ${
              comparing ? 'bg-crimson text-white' : 'hover:text-crimson'
            }`}
            style={comparing ? undefined : { background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
          >
            <GitCompare size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
