import { Navigation } from 'lucide-react';
import { DEALER } from '@/lib/site';

const FULL_ADDRESS = `${DEALER.address}, ${DEALER.city}, ${DEALER.state} ${DEALER.zip}`;

const MAPS_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&z=15&output=embed`;

const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FULL_ADDRESS)}`;

export default function MiddletownPanel() {
  return (
    <aside className="relative isolate flex flex-col justify-between overflow-hidden px-7 py-10" style={{ background: 'var(--surface)' }}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_45%_at_42%_48%,rgba(225,6,0,0.15),transparent_70%)]" />

      <div className="flex items-start justify-between gap-4">
        <div className="relative mt-1 h-3 w-3">
          <span className="absolute inset-0 rounded-full bg-crimson" />
          <span className="absolute inset-0 animate-ping2 rounded-full bg-crimson" />
        </div>
        <div className="text-right">
          <div className="font-display text-[15px] font-bold uppercase tracking-[0.2em]">{DEALER.city}</div>
          <div className="font-display text-[15px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
            Ohio
          </div>
        </div>
      </div>

      <p className="my-6 -rotate-2 font-script text-[38px] leading-[0.95]">
        We&rsquo;re
        <br />
        From Here.
      </p>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-[5px]" style={{ border: '1px solid var(--line)' }}>
          <iframe
            src={MAPS_EMBED_URL}
            title={`Map to ${DEALER.name}`}
            className="h-[150px] w-full grayscale contrast-125 brightness-90"
            style={{ border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="font-display text-[15px] font-bold uppercase leading-snug tracking-[0.08em]">
          Real cars. Real people.
          <br />
          Same streets.
        </p>
        <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-red w-full">
          Get Directions <Navigation size={14} />
        </a>
      </div>
    </aside>
  );
}
