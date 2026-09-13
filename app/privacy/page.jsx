import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { DEALER } from '@/lib/site'

export const metadata = {
  title: 'Privacy | Affordable Car Sales',
  description: 'How Affordable Car Sales handles the information you send us.',
}

const SECTIONS = [
  {
    h: 'What we collect',
    p: `Only what you type into a form or tell Ava: your name, phone number, email if you give one, and details about the vehicle or trade you asked about. We do not ask for a Social Security number or a date of birth on this website.`,
  },
  {
    h: 'Why we collect it',
    p: `To answer your question and, if you asked for one, to arrange a test drive, a trade appraisal, or a financing conversation. That is the whole purpose.`,
  },
  {
    h: 'Who sees it',
    p: `Our staff. If you asked about financing, the lenders we submit applications to see what is needed for that application. We do not sell your information, and we do not hand it to a lead broker.`,
  },
  {
    h: 'Credit',
    p: `Nothing on this site is a credit decision or an offer of credit. Payment figures shown on a vehicle page are estimates you control, not quotes. All credit types are considered; approval and terms are set by the lender.`,
  },
  {
    h: 'Making us stop',
    p: `Call ${DEALER.phone} or reply to any text and say stop. We will remove you from follow-up. Ask us to delete what we hold and we will.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-display text-[clamp(2.2rem,5vw,3.2rem)] font-black uppercase leading-[0.95]">Privacy</h1>
        <p className="mt-3 text-[13px]" style={{ color: 'var(--muted)' }}>
          Plain version. {DEALER.address}, {DEALER.city}, {DEALER.state} {DEALER.zip} · {DEALER.phone}
        </p>

        {SECTIONS.map((s) => (
          <section key={s.h} className="mt-8">
            <h2 className="font-display text-xl font-black uppercase">{s.h}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {s.p}
            </p>
          </section>
        ))}
      </main>
      <Footer />
    </>
  )
}
