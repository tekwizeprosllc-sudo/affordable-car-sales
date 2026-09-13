'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ImageOff } from 'lucide-react';

export default function VehicleGallery({ photos = [], title }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(() => new Set());

  const usable = photos.filter((p) => !failed.has(p));

  if (usable.length === 0) {
    return (
      <div
        className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-[5px]"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
      >
        <ImageOff size={26} style={{ color: 'var(--muted)' }} />
        <p className="font-display text-[15px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
          Photos coming soon
        </p>
        <p className="text-[12px]" style={{ color: 'var(--muted)' }}>
          Call us for a walkaround or stop by the lot.
        </p>
      </div>
    );
  }

  const current = usable[Math.min(index, usable.length - 1)];
  const move = (dir) => setIndex((i) => (i + dir + usable.length) % usable.length);
  const onError = (src) => setFailed((prev) => new Set(prev).add(src));

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-[5px]"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
      >
        <img src={current} alt={title} className="h-full w-full object-cover" onError={() => onError(current)} />

        {usable.length > 1 && (
          <>
            <button
              onClick={() => move(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-crimson"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => move(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-crimson"
            >
              <ArrowRight size={16} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-[2px] bg-black/65 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur">
              {Math.min(index, usable.length - 1) + 1} / {usable.length}
            </span>
          </>
        )}
      </div>

      {usable.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {usable.map((p, i) => (
            <button
              key={p}
              onClick={() => setIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className="h-16 w-24 shrink-0 overflow-hidden rounded-[3px] transition"
              style={{
                border: i === Math.min(index, usable.length - 1) ? '2px solid #E10600' : '1px solid var(--line)',
                opacity: i === Math.min(index, usable.length - 1) ? 1 : 0.6,
              }}
            >
              <img src={p} alt="" className="h-full w-full object-cover" onError={() => onError(p)} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
