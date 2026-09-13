'use client';
import Link from 'next/link';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { useCompare } from './CompareContext';

export default function CompareTray() {
  const { ids, clear, toggle } = useCompare();
  if (ids.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
      <div
        className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-[6px] px-4 py-3 shadow-lift"
        style={{ background: 'var(--surface)', border: '1px solid rgba(225,6,0,0.4)' }}
      >
        <span className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em]">
          <GitCompare size={15} className="text-crimson" />
          Compare
        </span>

        <div className="flex flex-1 flex-wrap gap-1.5">
          {ids.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition hover:text-crimson"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--muted)' }}
              aria-label={`Remove ${label} from compare`}
            >
              {label}
              <X size={11} />
            </button>
          ))}
        </div>

        <button onClick={clear} className="text-[10px] font-extrabold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
          Clear
        </button>

        {ids.length > 1 ? (
          <Link href={`/compare?ids=${ids.map((x) => x.id).join(',')}`} className="btn-red py-2.5 text-[11px]">
            Compare {ids.length} <ArrowRight size={13} />
          </Link>
        ) : (
          <span className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
            Pick one more
          </span>
        )}
      </div>
    </div>
  );
}
