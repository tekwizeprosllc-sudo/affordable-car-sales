import Link from 'next/link';
import { ArrowRight, ShieldCheck, BadgeDollarSign, HeartHandshake, Car } from 'lucide-react';
import { ASSETS, ROUTES } from '@/lib/site';
import HeroSearch from './HeroSearch';

const TRUST = [
  { icon: ShieldCheck, title: 'Quality Inspected', copy: 'Checked before it lists' },
  { icon: BadgeDollarSign, title: 'Transparent Pricing', copy: 'No Hidden Fees' },
  { icon: HeartHandshake, title: 'Flexible Financing', copy: 'All Credit Types Welcome' },
  { icon: Car, title: 'Trade-Ins Welcome', copy: 'Get a Real Offer Today' },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-10 pt-28 lg:pt-32">
      <div className="absolute inset-0 -z-10">
        <img src={ASSETS.dealershipDusk} alt="" className="hero-photo h-full w-full object-cover object-center" />
        <div className="hero-glow absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--scrim))_2%,rgba(var(--scrim),0.9)_30%,rgba(var(--scrim),0.45)_55%,rgba(var(--scrim),0.75)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(var(--scrim),0.92)_0%,transparent_26%,transparent_58%,rgb(var(--scrim))_100%)]" />
        <div className="noise absolute inset-0" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6">
        <div>
          <div className="pt-6">
            <p className="mb-4 text-[11px] font-extrabold uppercase tracking-eyebrow">
              Great Cars. Real People. <span className="text-accent">A Better Way Forward.</span>
            </p>
            <h1 className="font-display text-[clamp(3rem,7.2vw,5.6rem)] font-black uppercase leading-[0.86]">
              <span className="chrome-text block">Drive More.</span>
              <span className="block text-crimson [text-shadow:0_0_46px_rgba(225,6,0,0.45)]">Worry Less.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Quality used cars, trucks, and SUVs at honest prices. Flexible financing, fair trade-in values,
              and test drives that fit your schedule.
            </p>

            <div className="mt-7 max-w-2xl">
              <HeroSearch />
            </div>

            <div className="mt-9 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
              {TRUST.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="flex items-start gap-2.5">
                  <Icon size={20} className="mt-0.5 shrink-0 text-crimson" />
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.1em]">{title}</div>
                    <div className="text-[11px]" style={{ color: 'var(--muted)' }}>
                      {copy}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ROUTES.tradeIn} className="btn-ghost">
                Value Your Trade <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
