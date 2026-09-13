import Link from 'next/link'
import { ArrowRight, Gift, PackageSearch, Users, HeartHandshake } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import FeaturedInventory from '@/components/FeaturedInventory'
import MiddletownPanel from '@/components/MiddletownPanel'
import { getPublicInventory } from '@/lib/inventory'
import { ROUTES } from '@/lib/site'

// Page is dynamic so staff changes show at once; the upstream scrape itself
// stays cached for 15 minutes inside lib/inventory's fetch.
export const dynamic = 'force-dynamic'

const PROMISES = [
  { icon: PackageSearch, title: 'More Inventory', copy: 'New arrivals weekly' },
  { icon: Users, title: 'More Support', copy: 'From real people' },
  { icon: HeartHandshake, title: 'More Opportunities', copy: 'Financing for every journey' },
]

export default async function Home() {
  const { vehicles } = await getPublicInventory()
  // A strip full of "images coming soon" costs more trust than a shorter strip.
  const withPhotos = vehicles.filter((v) => v.image)
  const featured = (withPhotos.length >= 4 ? withPhotos : vehicles).slice(0, 10)

  return (
    <>
      <Header overlay />
      <main>
        <Hero />
        <StatsBar />
        <FeaturedInventory vehicles={featured} total={vehicles.length} />

        <section className="mx-auto max-w-[1400px] px-6 pb-16">
          <div
            className="grid items-center gap-8 rounded-[6px] p-8 lg:grid-cols-[1.1fr_auto]"
            style={{ background: 'var(--surface)', border: '1px solid rgba(225,6,0,0.35)' }}
          >
            <div className="grid gap-7 md:grid-cols-[auto_1fr] md:items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-crimson/50 text-crimson">
                <Gift size={24} />
              </span>
              <div>
                <h2 className="font-display text-2xl font-black uppercase">Let&rsquo;s get you on the road.</h2>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
                  Quality vehicles. Real support. A brighter tomorrow.
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
                  {PROMISES.map(({ icon: Icon, title, copy }) => (
                    <div key={title} className="flex items-start gap-2.5">
                      <Icon size={18} className="mt-0.5 shrink-0 text-crimson" />
                      <div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em]">{title}</div>
                        <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{copy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link href={ROUTES.inventory} className="btn-red whitespace-nowrap">
              Shop All Inventory <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20">
          <div className="grid gap-px overflow-hidden rounded-[6px] lg:grid-cols-[1fr_340px]" style={{ background: 'var(--line)' }}>
            <div className="flex flex-col justify-center gap-4 p-10" style={{ background: 'var(--surface)' }}>
              <p className="eyebrow">Why Affordable</p>
              <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] font-black uppercase leading-[0.95]">
                More than a dealership.
                <br />
                <span className="text-crimson">A better driving experience.</span>
              </h2>
              <p className="max-w-lg text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                We&rsquo;re a Middletown lot, not a national chain. Every vehicle is hand-picked and inspected,
                every price is on the glass, and every question gets a straight answer from someone who works here.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href={ROUTES.about} className="btn-ghost">Our Story</Link>
                <Link href={ROUTES.financing} className="btn-red">Get Pre-Approved <ArrowRight size={14} /></Link>
              </div>
            </div>
            <MiddletownPanel />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
