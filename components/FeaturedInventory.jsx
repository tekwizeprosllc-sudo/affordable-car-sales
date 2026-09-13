'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { ROUTES } from '@/lib/site';

export default function FeaturedInventory({ vehicles, total }) {
  const rail = useRef(null);

  const scrollBy = (dir) => {
    if (!rail.current) return;
    rail.current.scrollBy({ left: dir * rail.current.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Fresh From The Lot</p>
          <h2 className="font-display text-[clamp(2.2rem,4.4vw,3.2rem)] font-black uppercase leading-[0.9]">
            Browse <span className="text-crimson">Inventory</span>
          </h2>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
            {total} vehicles · updated live from our lot
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.inventory}
            className="group inline-flex items-center gap-2 border-b pb-1 text-[11px] font-extrabold uppercase tracking-[0.16em] transition hover:text-crimson"
            style={{ borderColor: 'var(--line-strong)' }}
          >
            View All {total} Vehicles
            <ArrowRight size={14} className="transition group-hover:translate-x-1" />
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous vehicles"
              className="grid h-9 w-9 place-items-center rounded-full border transition hover:border-crimson hover:text-crimson"
              style={{ borderColor: 'var(--line-strong)' }}
            >
              <ArrowLeft size={15} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next vehicles"
              className="grid h-9 w-9 place-items-center rounded-full border transition hover:border-crimson hover:text-crimson"
              style={{ borderColor: 'var(--line-strong)' }}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <div ref={rail} className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} className="w-[280px] shrink-0 snap-start sm:w-[300px]" />
        ))}
      </div>
    </section>
  );
}
