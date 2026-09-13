import Link from 'next/link'
import { ArrowLeft, Check, Minus } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PhotoComingSoon from '@/components/PhotoComingSoon'
import { getVehicle } from '@/lib/inventory'
import { ROUTES, DEALER } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Compare Vehicles | Affordable Car Sales',
  description: 'Put two or three of our vehicles side by side.',
}

const ROWS = [
  { label: 'Price', get: (v) => (v.price ? `$${v.price.toLocaleString()}` : 'Call for price'), emphasis: true },
  { label: 'Mileage', get: (v) => (v.mileage ? `${v.mileage.toLocaleString()} mi` : null) },
  { label: 'Body style', get: (v) => v.bodyType },
  { label: 'Drivetrain', get: (v) => v.drive },
  { label: 'Engine', get: (v) => v.engine },
  { label: 'Transmission', get: (v) => v.trans },
  { label: 'Fuel', get: (v) => v.fuel },
  { label: 'Exterior', get: (v) => v.color },
  { label: 'Interior', get: (v) => v.interiorColor },
  { label: 'Stock #', get: (v) => v.stock },
  { label: 'VIN', get: (v) => v.vin },
]

export default async function ComparePage({ searchParams }) {
  const ids = String(searchParams?.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)

  const vehicles = (await Promise.all(ids.map((id) => getVehicle(id)))).filter(Boolean)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] px-6 pb-32 pt-10">
        <Link
          href={ROUTES.inventory}
          className="mb-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] transition hover:text-crimson"
        >
          <ArrowLeft size={14} /> Back to Inventory
        </Link>

        <h1 className="font-display text-[clamp(2.2rem,5vw,3.2rem)] font-black uppercase leading-[0.95]">
          Side <span className="text-crimson">by side</span>
        </h1>

        {vehicles.length < 2 ? (
          <div className="panel mt-8 rounded-[5px] p-14 text-center">
            <p className="font-display text-xl font-bold uppercase">Pick at least two vehicles</p>
            <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
              Tick the compare box on any vehicle card and they will collect here.
            </p>
            <Link href={ROUTES.inventory} className="btn-red mt-5">
              Browse Inventory
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="w-32" />
                  {vehicles.map((v) => (
                    <th key={v.id} className="p-2 align-bottom text-left">
                      <Link href={ROUTES.vehicle(v.id)} className="group block">
                        <div
                          className="mb-3 aspect-[16/10] overflow-hidden rounded-[5px]"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}
                        >
                          {v.image || v.photos?.[0] ? (
                            <img
                              src={v.photos?.[0] || v.image}
                              alt={`${v.year} ${v.make} ${v.model}`}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <PhotoComingSoon vehicle={v} />
                          )}
                        </div>
                        <div className="font-display text-[17px] font-bold uppercase leading-tight">
                          {v.year} {v.make} {v.model}
                        </div>
                        {v.trim && (
                          <div className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>
                            {v.trim}
                          </div>
                        )}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const values = vehicles.map((v) => row.get(v))
                  if (values.every((x) => !x)) return null
                  const allSame = values.every((x) => x === values[0])
                  return (
                    <tr key={row.label} style={{ borderTop: '1px solid var(--line)' }}>
                      <td
                        className="py-3 pr-3 align-top text-[10px] font-extrabold uppercase tracking-[0.14em]"
                        style={{ color: 'var(--muted)' }}
                      >
                        {row.label}
                      </td>
                      {values.map((val, i) => (
                        <td
                          key={i}
                          className={`p-2 align-top ${
                            row.emphasis ? 'font-display text-[24px] font-black text-crimson' : 'text-[13px] font-semibold'
                          }`}
                        >
                          {val || <Minus size={14} style={{ color: 'var(--muted)' }} />}
                          {!row.emphasis && val && allSame && vehicles.length > 1 && (
                            <Check size={12} className="ml-1.5 inline text-green-600 dark:text-green-500" aria-label="same on both" />
                          )}
                        </td>
                      ))}
                    </tr>
                  )
                })}
                <tr style={{ borderTop: '1px solid var(--line)' }}>
                  <td />
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-2 pt-4">
                      <Link href={ROUTES.vehicle(v.id)} className="btn-red w-full py-2.5 text-[11px]">
                        View Details
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <p className="mt-6 text-[12px]" style={{ color: 'var(--muted)' }}>
              Want them pulled up front together? Call {DEALER.phone} and we&rsquo;ll have both ready.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
