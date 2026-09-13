import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import LeadForm from '@/components/LeadForm'
import { ASSETS, DEALER } from '@/lib/site'

export const metadata = {
  title: 'Contact | Affordable Car Sales',
  description: 'Visit Affordable Car Sales at 1290 Elliot Dr, Middletown, OH 45044. Call (513) 424-0304.',
}

const MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${DEALER.address}, ${DEALER.city}, ${DEALER.state} ${DEALER.zip}`
)}`

export default function ContactPage({ searchParams }) {
  const q = typeof searchParams?.q === 'string' ? searchParams.q : ''

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Come See Us."
          accent="We're Local."
          copy="Questions, directions, or you just want to talk to a person before driving over — we're here six days a week."
          image={ASSETS.storefrontNight}
        />

        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 lg:grid-cols-[1fr_460px]">
          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="panel rounded-[5px] p-6">
                <MapPin size={18} className="mb-3 text-crimson" />
                <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.1em]">Visit The Lot</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {DEALER.address}
                  <br />
                  {DEALER.city}, {DEALER.state} {DEALER.zip}
                </p>
                <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-4 w-full py-2.5 text-[11px]">
                  <Navigation size={13} /> Get Directions
                </a>
              </div>

              <div className="panel rounded-[5px] p-6">
                <Phone size={18} className="mb-3 text-crimson" />
                <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.1em]">Call Or Text</h3>
                <a href={DEALER.phoneHref} className="mt-2 block font-display text-[26px] font-black leading-none text-crimson">
                  {DEALER.phone}
                </a>
                <p className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                  <Clock size={14} className="text-crimson" /> {DEALER.hours}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[5px]" style={{ border: '1px solid var(--line)' }}>
              <img src={ASSETS.dealershipDusk} alt={`${DEALER.name} storefront`} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="panel rounded-[5px] p-6 lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-xl font-black uppercase">Send Us A Message</h2>
            <p className="mb-5 mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
              A real person reads these — usually answered same day.
            </p>
            <LeadForm
              type="contact"
              source={q ? `Contact page (asked: ${q})` : 'Contact page'}
              compact
              fields={{
                messageLabel: 'How can we help?',
                messagePlaceholder: q || 'Ask about a vehicle, hours, financing, anything…',
              }}
              submitLabel="Send Message"
              successTitle="Message sent"
              successCopy="We'll get back to you shortly — usually the same day."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
