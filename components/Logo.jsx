import { ASSETS, DEALER } from '@/lib/site';

export default function Logo({ className = 'h-11' }) {
  return (
    <span className={`relative block ${className}`} style={{ aspectRatio: '900 / 299' }}>
      <img
        src={ASSETS.logoDark}
        alt={DEALER.name}
        className="absolute inset-0 hidden h-full w-full object-contain object-left dark:block"
      />
      <img
        src={ASSETS.logoLight}
        alt={DEALER.name}
        className="absolute inset-0 block h-full w-full object-contain object-left dark:hidden"
      />
    </span>
  );
}
