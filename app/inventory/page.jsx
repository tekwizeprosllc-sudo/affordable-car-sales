import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import InventoryBrowser from '@/components/InventoryBrowser'
import { getInventory } from '@/lib/inventory'
import { ASSETS } from '@/lib/site'

export const revalidate = 900

export const metadata = {
  title: 'Inventory | Affordable Car Sales',
  description: 'Browse every quality used car, truck, SUV, and van on our Middletown, Ohio lot.',
}

export default async function InventoryPage({ searchParams }) {
  const { vehicles, live } = await getInventory()
  const q = typeof searchParams?.q === 'string' ? searchParams.q : ''

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={live ? `${vehicles.length} vehicles on the lot` : 'Our inventory'}
          title="Browse"
          accent="Inventory"
          copy="Every vehicle here is on our lot in Middletown right now — hand-picked, inspected, and priced up front."
          image={ASSETS.lotGrid}
        />
        {vehicles.length === 0 ? (
          <div className="mx-auto max-w-[1400px] px-6 py-20">
            <div className="panel rounded-[5px] p-10 text-center">
              <h2 className="font-display text-2xl font-bold uppercase">Inventory is syncing</h2>
              <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
                We couldn&rsquo;t load the lot just now. Give us a call and we&rsquo;ll tell you exactly what&rsquo;s available.
              </p>
            </div>
          </div>
        ) : (
          <InventoryBrowser vehicles={vehicles} initialQuery={q} />
        )}
      </main>
      <Footer />
    </>
  )
}
