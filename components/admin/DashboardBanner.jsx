import { ASSETS } from '@/lib/site';

export default function DashboardBanner() {
  return (
    <section className="relative isolate overflow-hidden rounded-[6px]" style={{ border: '1px solid var(--line)' }}>
      <div className="absolute inset-0 -z-10">
        <img src={ASSETS.dealershipDusk} alt="" className="h-full w-full object-cover" style={{ opacity: 0.55, filter: 'grayscale(0.15) contrast(1.1) brightness(0.6)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 10%, rgba(0,0,0,0.55) 55%, rgba(225,6,0,0.18) 100%)' }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-8 md:px-8 md:py-10">
        <div>
          <h1 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-black uppercase leading-[0.95] text-white">
            Dealer Command Center
          </h1>
          <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.75)' }}>
            More Leads. More Test Drives. More Happy Customers.
          </p>
        </div>
        <p className="text-right text-[12px] font-black uppercase leading-tight tracking-[0.1em] text-white">
          Same Cars.
          <br />
          Different Experience.
        </p>
      </div>
    </section>
  );
}
