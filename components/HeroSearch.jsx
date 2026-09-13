'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/site';

export default function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();

  function submit(e) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `${ROUTES.inventory}?q=${encodeURIComponent(query)}` : ROUTES.inventory);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <div
        className="flex flex-1 items-center gap-2 rounded-[4px] px-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--line-strong)' }}
      >
        <Search size={17} style={{ color: 'var(--muted)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search makes, models, or keywords…"
          aria-label="Search inventory"
          className="w-full bg-transparent py-3.5 text-[14px] outline-none placeholder:text-[color:var(--muted)]"
        />
      </div>
      <button type="submit" className="btn-red shrink-0">
        Search <ArrowRight size={15} />
      </button>
    </form>
  );
}
