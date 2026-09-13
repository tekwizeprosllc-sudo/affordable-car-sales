import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Phone, MessageSquare, Gauge, Cog, Fuel, Palette, Hash, Car } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VehicleGallery from '@/components/VehicleGallery'
import LeadForm from '@/components/LeadForm'
import PaymentEstimator from '@/components/PaymentEstimator'
import { getVehicle } from '@/lib/inventory'
import { chipsFor } from '@/lib/vehicleUtils'
import { DEALER, ROUTES } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const vehicle = await getVehicle(params.id)
  if (!vehicle) return { title: 'Vehicle not found | Affordable Car Sales' }
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim()
  const description = `${title} for sale in Middletown, OH. ${
    vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles.` : ''
  } ${vehicle.price ? `$${vehicle.price.toLocaleString()}.` : ''}`.trim()
  const image = vehicle.photos?.[0] || vehicle.image || null

  return {
    title: `${title} | Affordable Car Sales`,
    description,
    openGraph: {
      title: `${title} — $${vehicle.price ? vehicle.price.toLocaleString() : 'Call'}`,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${title} | Affordable Car Sales`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

function Spec({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
      <Icon size={15} className="mt-0.5 shrink-0 text-crimson" />
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          {label}
        </div>
        <div className="text-[13px] font-semibold">{value}</div>
      </div>
    </div>
  )
}

export default async function VehiclePage({ params }) {
  const vehicle = await getVehicle(params.id)
  if (!vehicle) notFound()

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  const chips = chipsFor(vehicle)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 py-10">
        <Link
          href={ROUTES.inventory}
          className="mb-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] transition hover:text-crimson"
        >
          <ArrowLeft size={14} /> Back to Inventory
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr]">
          <div className="min-w-0">
            <VehicleGallery photos={vehicle.photos} title={title} vehicle={vehicle} />

            <div className="mt-8">
              <h2 className="mb-1 font-display text-xl font-black uppercase">Vehicle Details</h2>
              <div className="grid gap-x-8 sm:grid-cols-2">
                <Spec icon={Gauge} label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null} />
                <Spec icon={Cog} label="Engine" value={vehicle.engine} />
                <Spec icon={Cog} label="Transmission" value={vehicle.trans} />
                <Spec icon={Car} label="Drivetrain" value={vehicle.drive} />
                <Spec icon={Car} label="Body Style" value={vehicle.bodyType} />
                <Spec icon={Fuel} label="Fuel" value={vehicle.fuel} />
                <Spec icon={Palette} label="Exterior" value={vehicle.color} />
                <Spec icon={Palette} label="Interior" value={vehicle.interiorColor} />
                <Spec icon={Hash} label="Stock #" value={vehicle.stock} />
                <Spec icon={Hash} label="VIN" value={vehicle.vin} />
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-8">
                <h2 className="mb-2 font-display text-xl font-black uppercase">About This Vehicle</h2>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {vehicle.description}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <div className="panel rounded-[5px] p-6">
              <h1 className="font-display text-[30px] font-black uppercase leading-[0.95]">{title}</h1>
              {vehicle.trim && (
                <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
                  {vehicle.trim}
                </p>
              )}

              <div className="mt-4 font-display text-[40px] font-black leading-none text-crimson">
                {vehicle.price ? `$${vehicle.price.toLocaleString()}` : <span className="text-[24px]">Call For Price</span>}
              </div>

              {chips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-[2px] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em]"
                      style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--line)' }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <a href={DEALER.phoneHref} className="btn-red mt-5 w-full">
                <Phone size={14} /> Call for a walkaround
              </a>
              <a
                href={`sms:${DEALER.phoneHref.replace('tel:', '')}?&body=${encodeURIComponent(
                  `Hi — I'm interested in the ${title}${vehicle.stock ? ` (stock ${vehicle.stock})` : ''}. Is it still available?`
                )}`}
                className="btn-ghost mt-2 w-full"
              >
                <MessageSquare size={14} /> Text me about this car
              </a>
            </div>

            <PaymentEstimator price={vehicle.price} />

            <div className="panel rounded-[5px] p-6">
              <h2 className="font-display text-lg font-black uppercase">Schedule a Test Drive</h2>
              <p className="mb-4 mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
                Pick a time that works and we&rsquo;ll have it pulled up front and ready.
              </p>
              <LeadForm
                type="test_drive"
                vehicleId={vehicle.id}
                vehicleTitle={`${title}${vehicle.trim ? ` ${vehicle.trim}` : ''}`}
                source={`VDP ${vehicle.id}`}
                compact
                fields={{
                  schedule: true,
                  messageLabel: 'Questions about this vehicle',
                  messagePlaceholder: 'Anything you want us to check before you come in?',
                }}
                submitLabel="Request Test Drive"
                successTitle="Test drive requested"
                successCopy="We'll confirm your time by phone or email shortly."
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
