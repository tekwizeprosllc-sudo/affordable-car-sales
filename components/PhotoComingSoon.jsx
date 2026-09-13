import { Camera } from 'lucide-react';

// Never substitute a stock photo of a different vehicle — a sports car on an
// SUV listing reads as fake and costs more trust than an empty frame.
export default function PhotoComingSoon({ vehicle, size = 'card' }) {
  const large = size === 'detail';
  const title = [vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(' ');

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden text-center"
      style={{ background: 'var(--surface-2)' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,rgba(225,6,0,0.12),transparent_70%)]" />
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(225,6,0,0.35),transparent)' }}
      />

      <span
        className="relative grid place-items-center rounded-full"
        style={{
          width: large ? 52 : 38,
          height: large ? 52 : 38,
          border: '1px solid rgba(225,6,0,0.45)',
          color: '#E10600',
        }}
      >
        <Camera size={large ? 22 : 16} />
      </span>

      <div className="relative px-4">
        <p
          className={`font-display font-bold uppercase leading-tight ${large ? 'text-[15px] tracking-[0.18em]' : 'text-[11px] tracking-[0.16em]'}`}
          style={{ color: 'var(--muted)' }}
        >
          Images Coming Soon
        </p>
        {title && (
          <p
            className={`mt-1 font-display font-black uppercase leading-tight ${large ? 'text-[22px]' : 'text-[13px]'}`}
          >
            {title}
          </p>
        )}
        {large && (
          <p className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>
            It&rsquo;s on the lot — call us for a walkaround or stop in and see it.
          </p>
        )}
      </div>
    </div>
  );
}
