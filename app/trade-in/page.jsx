import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import LeadForm from '@/components/LeadForm'
import { ASSETS } from '@/lib/site'

export const metadata = {
  title: 'Trade-In | Affordable Car Sales',
  description: 'Get a real trade-in offer on your current vehicle from Affordable Car Sales in Middletown, OH.',
}

const STEPS = [
  { n: '01', title: 'Tell us about it', copy: 'Year, make, model, mileage, and honest condition. Photos help.' },
  { n: '02', title: 'We look it over', copy: 'A quick in-person appraisal at the lot — usually under 20 minutes.' },
  { n: '03', title: 'You get a real number', copy: 'A written offer you can take or leave. No pressure, no games.' },
]

export default function TradeInPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Trade-In"
          title="Your Trade."
          accent="Real Numbers."
          copy="We'd rather give you a fair number than waste your afternoon. Tell us what you're driving and we'll get you an honest offer."
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
              <h3 className="font-display text-lg font-black uppercase">Still making payments?</h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                That&rsquo;s normal and it&rsquo;s not a dealbreaker. Bring your payoff amount and we&rsquo;ll
                show you exactly where you stand — positive equity or not.
              </p>
            </div>
          </div>

          <div className="panel rounded-[5px] p-6">
            <h2 className="font-display text-xl font-black uppercase">Get Your Offer</h2>
            <p className="mb-5 mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
              Takes a minute. We&rsquo;ll follow up with a real number.
            </p>
            <LeadForm
              type="trade_in"
              source="Trade-in page"
              fields={{
                trade: true,
                messageLabel: 'Condition notes',
                messagePlaceholder: 'Accidents, mechanical issues, cosmetic wear, payoff amount…',
              }}
              submitLabel="Value My Trade"
              successTitle="Appraisal requested"
              successCopy="We'll reach out to set up a quick look and get you a number."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
