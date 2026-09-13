import { isAuthed } from '@/lib/auth'
import AdminLogin from '@/components/AdminLogin'
import AdminInventory from '@/components/AdminInventory'
import { getInventory } from '@/lib/inventory'
import { listManualVehicles, listOverrides } from '@/lib/vehicles'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Inventory | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default async function AdminInventoryPage() {
  if (!isAuthed()) return <AdminLogin />

  const { vehicles } = await getInventory()

  let manual = []
  let overrides = {}
  let dbError = false
  try {
    ;[manual, overrides] = await Promise.all([listManualVehicles(), listOverrides()])
  } catch (err) {
    dbError = true
  }

  return <AdminInventory initialManual={manual} scraped={vehicles} initialOverrides={overrides} dbError={dbError} />
}
