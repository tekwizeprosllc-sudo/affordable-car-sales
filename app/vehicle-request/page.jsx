import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import LeadForm from '@/components/LeadForm'
import { ASSETS } from '@/lib/site'

export const metadata = {
  title: 'Request A Vehicle | Affordable Car Sales',
  description: "Don't see what you want on our lot? Tell us and we'll go find it.",
}

const STEPS = [
  { n: '01', title: 'Tell us what you want', copy: 'Year, make, model, must-haves, and your budget. The more specific, the faster we can move.' },
  { n: '02', title: 'We go look', copy: 'We work our auction and trade channels to track down a real match — not a guess.' },
  { n: '03', title: 'You get first call', copy: "When we find it, you're the first person we call before it ever hits the lot." },
]

export default function VehicleRequestPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Vehicle Request"
          title="Don't See It?"
          accent="We'll Find It."
          copy="Our lot turns over fast, but it's not everything we can get. Tell us what you're after and we'll start looking today."
          image={ASSETS.dealershipMustang}
          focal="18% center"
        />

        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 lg:grid-cols-[1fr_460px]">
          <div>
            <h2 className="font-display text-2xl font-black uppercase">How it works</h2>
            <div className="mt-6 flex flex-col gap-5">
              {STEPS.map((step) => (
                <div key={step.n} className="flex gap-4">
                  <span className="font-display text-[26px] font-black leading-none text-crimson">{step.n}</span>
                  <div>
                    <h3 className="font-display text-[17px] font-bold uppercase">{step.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {step.copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel mt-8 rounded-[5px] p-6">
              <h3 className="font-display text-lg font-black uppercase">No obligation</h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Sending a request doesn&rsquo;t commit you to anything. If we find a match, we&rsquo;ll call —
                you decide from there.
              </p>
            </div>
          </div>

          <div className="panel rounded-[5px] p-6">
            <h2 className="font-display text-xl font-black uppercase">Request A Vehicle</h2>
            <p className="mb-5 mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
              Takes a minute. We&rsquo;ll reach out the moment we find a match.
            </p>
            <LeadForm
              type="vehicle_request"
              source="Vehicle request page"
              fields={{
                vehicleWanted: true,
                messageLabel: 'Anything else?',
                messagePlaceholder: 'Must-haves, timeline, trade-in, budget flexibility…',
              }}
              submitLabel="Send Request"
              successTitle="Request received"
              successCopy="We'll start looking and call you the moment we find a match."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
