import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import { ASSETS, DEALER, ROUTES } from '@/lib/site'

export const metadata = {
  title: 'About Us | Affordable Car Sales',
  description: 'A Middletown, Ohio family lot selling quality used cars with honest prices and straight answers.',
}

const VALUES = [
  { title: 'Hand-Selected', copy: 'We buy the cars we would put our own families in, then inspect them before they hit the line.' },
  { title: 'Priced Up Front', copy: 'The number on the glass is the number. No doc-fee surprises at the desk.' },
  { title: 'Straight Answers', copy: 'If a car has a flaw, we tell you about it. A returning customer beats a quick sale.' },
  { title: 'From Here', copy: 'We live in Middletown. You will see us at the grocery store, so we act like it.' },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="About Us"
          title="Real Cars. Real People."
          accent="Same Streets."
          copy="We're a Middletown lot, not a national chain with a call center. Ten-plus years of getting our neighbors into cars that actually make sense."
          image={ASSETS.storefrontNight}
          focal="center 40%"
        />

        <section className="mx-auto max-w-[1400px] px-6 py-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow mb-3">Our Story</p>
              <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] font-black uppercase leading-[0.95]">
                A better way to buy
                <br />
                <span className="text-crimson">a used car.</span>
              </h2>
              <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                <p>
                  Buying a used car shouldn&rsquo;t feel like a fight. Too many lots bury the price, pressure the
                  close, and hope you don&rsquo;t ask questions. We built this one on the opposite idea.
                </p>
                <p>
                  Every vehicle on our lot is hand-picked and inspected before it goes up for sale. Pricing is
                  posted plainly. Financing is available for every credit situation, including first-time buyers
                  and folks rebuilding. And if a car isn&rsquo;t right for you, we&rsquo;ll say so.
                </p>
                <p>
                  Come by {DEALER.address} in {DEALER.city}, or call {DEALER.phone} and talk to an actual person.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={ROUTES.inventory} className="btn-red">
                  See What&rsquo;s On The Lot <ArrowRight size={15} />
                </Link>
                <Link href={ROUTES.contact} className="btn-ghost">
                  Get Directions
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[6px]" style={{ border: '1px solid var(--line)' }}>
              <img src={ASSETS.dealershipMustang} alt={`${DEALER.name} lot in ${DEALER.city}, Ohio`} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-20">
          <div className="grid gap-px overflow-hidden rounded-[6px] md:grid-cols-2 lg:grid-cols-4" style={{ background: 'var(--line)' }}>
            {VALUES.map((value) => (
              <div key={value.title} className="p-7" style={{ background: 'var(--surface)' }}>
                <h3 className="font-display text-[17px] font-bold uppercase tracking-[0.06em]">{value.title}</h3>
                <div className="my-3 h-px w-10 bg-crimson" />
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {value.copy}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
