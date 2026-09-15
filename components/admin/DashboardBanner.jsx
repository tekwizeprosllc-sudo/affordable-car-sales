import { ASSETS } from '@/lib/site';

export default function DashboardBanner() {
  return (
    <section
      className="relative isolate h-[136px] overflow-hidden rounded-[7px]"
      style={{ border: '1px solid var(--admin-border)' }}
    >
      <div className="absolute inset-0 -z-10 bg-[#050608]">
        <img
          src={ASSETS.dealershipDusk}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-[78%] object-cover"
          style={{ objectPosition: '50% 58%', filter: 'saturate(0.9) contrast(1.12) brightness(0.62)' }}
        />
        {/* Left fade into near-black so the title sits on a clean field. */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, #050608 0%, #050608 24%, rgba(5,6,8,0.86) 42%, rgba(5,6,8,0.35) 68%, rgba(5,6,8,0.55) 100%)' }}
        />
        {/* Controlled crimson dealership light, centered on the building. */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(38% 90% at 63% 38%, rgba(242,13,13,0.3), transparent 70%)', mixBlendMode: 'screen' }}
        />
        <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: 'linear-gradient(0deg, rgba(5,6,8,0.85), transparent)' }} />
      </div>

      <div className="flex h-full items-center justify-between gap-6 px-7 md:px-9">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,2.9vw,2.6rem)] font-extrabold italic uppercase leading-none tracking-[0.06em] text-white">
            Dealer Command Center
          </h1>
          <p className="mt-2.5 text-[12px] font-medium tracking-[0.2em] text-[#d5dade] md:text-[13px]">
            MORE LEADS. MORE TEST DRIVES. MORE HAPPY CUSTOMERS.
          </p>
        </div>
        <div className="hidden shrink-0 lg:block">
          <div className="mb-3 h-[3px] w-9" style={{ background: '#f20d0d', boxShadow: '0 0 10px rgba(242,13,13,0.8)' }} />
          <p className="text-[12.5px] font-medium leading-[1.7] tracking-[0.2em] text-[#e6eaed]">
            SAME CARS.
            <br />
            DIFFERENT EXPERIENCE.
          </p>
        </div>
      </div>
    </section>
  );
}
