import { CheckCircle2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import LeadForm from '@/components/LeadForm'
import { ASSETS } from '@/lib/site'

export const metadata = {
  title: 'Financing | Affordable Car Sales',
  description: 'Flexible financing for every credit situation. Get pre-approved at Affordable Car Sales in Middletown, OH.',
}

const POINTS = [
  'All credit types welcome — good, rebuilding, or first-time buyer',
  'Real approvals from real lenders, not teaser rates',
  'Down payments that fit your budget, not a formula',
  'No hidden fees — the price on the glass is the price',
]

export default function FinancingPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Financing"
          title="Approved."
          accent="Not Judged."
          copy="Credit history is a chapter, not the whole story. Tell us where you're at and we'll find a payment that actually works."
          image={ASSETS.dealershipMustang}
        />

        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 lg:grid-cols-[1fr_460px]">
          <div>
            <h2 className="font-display text-2xl font-black uppercase">What to expect</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[14px] leading-relaxed">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-crimson" />
                  <span style={{ color: 'var(--muted)' }}>{point}</span>
                </li>
              ))}
            </ul>

            <div className="panel mt-8 rounded-[5px] p-6">
              <h3 className="font-display text-lg font-black uppercase">Bring these with you</h3>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                Driver&rsquo;s license, proof of income (recent pay stubs), proof of residence, and your insurance
                info. If you&rsquo;re trading something in, bring the title and both keys if you have them.
              </p>
            </div>
          </div>

          <div className="panel rounded-[5px] p-6">
            <h2 className="font-display text-xl font-black uppercase">Get Pre-Approved</h2>
            <p className="mb-5 mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
              No credit pull to start — this just opens the conversation.
            </p>
            <LeadForm
              type="financing"
              source="Financing page"
              fields={{
                credit: true,
                messageLabel: 'Anything we should know?',
                messagePlaceholder: 'Monthly budget, down payment, trade-in, timing…',
              }}
              submitLabel="Start My Approval"
              successTitle="Application started"
              successCopy="One of our finance folks will call you to walk through options."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
