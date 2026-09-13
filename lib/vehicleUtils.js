export const CATEGORIES = [
  { key: 'car', label: 'Car', types: ['sedan', 'coupe', 'hatchback', 'wagon', 'convertible'] },
  { key: 'truck', label: 'Truck', types: ['truck'] },
  { key: 'suv', label: 'SUV', types: ['suv', 'crossover'] },
  { key: 'van', label: 'Van', types: ['van-minivan', 'van', 'minivan'] },
]

export const PRICE_BUCKETS = [
  { value: '8000', label: 'Under $8,000' },
  { value: '12000', label: 'Under $12,000' },
  { value: '16000', label: 'Under $16,000' },
  { value: '25000', label: 'Under $25,000' },
]

export const SORTS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'miles-asc', label: 'Mileage: Low to High' },
  { value: 'year-desc', label: 'Year: Newest First' },
]

export function categoryOf(vehicle) {
  const type = (vehicle.bodyType || '').trim().toLowerCase()
  return CATEGORIES.find((c) => c.types.includes(type))?.key || null
}

export function chipsFor(vehicle) {
  const chips = []
  const drive = (vehicle.drive || '').toUpperCase()
  if (drive === '4WD' || drive === 'AWD') chips.push(drive)
  if (vehicle.mileage && vehicle.mileage < 80000) chips.push('Low Miles')
  if (/v8/i.test(vehicle.engine || '')) chips.push('V8')
  else if (/turbo/i.test(vehicle.engine || '')) chips.push('Turbo')
  if (vehicle.year && vehicle.year >= 2021) chips.push('Late Model')
  return chips.slice(0, 3)
}

export function applyFilters(vehicles, { category, make, model, maxPrice, q } = {}) {
  const term = (q || '').trim().toLowerCase()
  return vehicles.filter((v) => {
    if (category && categoryOf(v) !== category) return false
    if (make && v.make !== make) return false
    if (model && v.model !== model) return false
    if (maxPrice) {
      if (!v.price || v.price > Number(maxPrice)) return false
    }
    if (term) {
      const haystack = [v.year, v.make, v.model, v.trim, v.bodyType, v.color, v.engine]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!term.split(/\s+/).every((word) => haystack.includes(word))) return false
    }
    return true
  })
}

export function sortVehicles(vehicles, sort) {
  const list = [...vehicles]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
    case 'price-desc':
      return list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
    case 'miles-asc':
      return list.sort((a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity))
    case 'year-desc':
      return list.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    default:
      return list
  }
}
