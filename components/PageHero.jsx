import { ASSETS } from '@/lib/site';

export default function PageHero({ eyebrow, title, accent, copy, image = ASSETS.storefrontNight, focal = 'center' }) {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={image} alt="" className="hero-photo h-full w-full object-cover"
          style={{ objectPosition: focal }} />
        <div className="hero-glow absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--scrim))_5%,rgba(var(--scrim),0.86)_45%,rgba(var(--scrim),0.6)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(var(--scrim),0.7)_0%,transparent_45%,rgb(var(--scrim))_100%)]" />
        <div className="noise absolute inset-0" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-20">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-[clamp(2.4rem,5.4vw,4rem)] font-black uppercase leading-[0.9]">
          <span className="chrome-text">{title}</span>{' '}
          {accent && <span className="text-crimson">{accent}</span>}
        </h1>
        {copy && (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>
            {copy}
          </p>
        )}
      </div>
    </section>
  );
}
