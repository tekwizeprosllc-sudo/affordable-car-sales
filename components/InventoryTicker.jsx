'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Pause, Play } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { ROUTES } from '@/lib/site';

// A conveyor, not a slideshow. Rotating banners swap slides out from under the
// reader; this moves continuously, pauses the moment anyone hovers, focuses a
// card, or asks for reduced motion, and never hides a card behind a timer.
export default function InventoryTicker({ vehicles, total }) {
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  if (!vehicles.length) return null;

  // Duplicated once so translating the track by half its width loops seamlessly.
  const loop = [...vehicles, ...vehicles];
  const seconds = Math.max(40, vehicles.length * 5);

  return (
    <section className="py-14">
      <div className="mx-auto mb-7 flex max-w-[1400px] flex-wrap items-end justify-between gap-4 px-6">
        <div>
          <p className="eyebrow mb-3">Fresh From The Lot</p>
          <h2 className="font-display text-[clamp(2.2rem,4.4vw,3.2rem)] font-black uppercase leading-[0.9]">
            On The Lot <span className="text-crimson">Right Now</span>
          </h2>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
            {vehicles.length} with photos · {total} total · synced live
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume scrolling' : 'Pause scrolling'}
            className="grid h-9 w-9 place-items-center rounded-full border transition hover:border-crimson hover:text-crimson"
            style={{ borderColor: 'var(--line-strong)' }}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <Link
            href={ROUTES.inventory}
            className="group inline-flex items-center gap-2 border-b pb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] transition hover:text-crimson"
            style={{ borderColor: 'var(--line-strong)' }}
          >
            View All {total} Vehicles
            <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className={`ticker-viewport relative overflow-hidden ${paused ? 'is-paused' : ''}`}>
        <div
          ref={trackRef}
          className="ticker-track flex w-max items-stretch gap-5 px-6"
          style={{ animationDuration: `${seconds}s` }}
        >
          {loop.map((v, i) => (
            <VehicleCard
              key={`${v.id}-${i}`}
              vehicle={v}
              className="w-[280px] shrink-0 sm:w-[300px]"
              aria-hidden={i >= vehicles.length}
            />
          ))}
        </div>

        <div className="ticker-fade pointer-events-none absolute inset-y-0 left-0 w-16" />
        <div className="ticker-fade-r pointer-events-none absolute inset-y-0 right-0 w-16" />
      </div>
    </section>
  );
}
