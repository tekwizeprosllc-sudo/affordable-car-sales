export const DEALER = {
  name: 'Affordable Car Sales',
  phone: '(513) 217-6880',
  phoneHref: 'tel:5132176880',
  address: '1290 Elliot Dr',
  city: 'Middletown',
  state: 'OH',
  zip: '45044',
  hoursDays: 'Mon–Fri',
  hoursTime: '11AM–5PM',
  hours: 'Mon–Fri: 11AM–5PM',
  hoursWeekend: 'Sat–Sun: By Appointment',
  coords: { lat: '39.5206° N', lon: '84.3988° W' },
  tagline: 'Great cars. Real people. A better way forward.',
}

export const ROUTES = {
  home: '/',
  inventory: '/inventory',
  vehicle: (id) => `/inventory/${id}`,
  financing: '/financing',
  tradeIn: '/trade-in',
  vehicleRequest: '/vehicle-request',
  about: '/about',
  contact: '/contact',
  admin: '/admin',
  privacy: '/privacy',
}

export const NAV = [
  { label: 'Inventory', href: ROUTES.inventory },
  { label: 'Financing', href: ROUTES.financing },
  { label: 'Trade-In', href: ROUTES.tradeIn },
  { label: 'About Us', href: ROUTES.about },
  { label: 'Contact', href: ROUTES.contact },
]

export const ASSETS = {
  logoDark: '/brand/logo-dark.png',
  logoLight: '/brand/logo-light.png',
  ava: '/brand/ava.png',
  dealershipDusk: '/photos/dealership-dusk.jpg',
  dealershipMustang: '/photos/dealership-mustang.jpg',
  storefrontNight: '/photos/storefront-night.jpg',
  lotGrid: '/photos/lot-grid.jpg',
}

export const STATS = [
  { value: '500+', label: 'Happy Customers' },
  { value: '4.8', label: 'Google Rating', stars: true },
  { value: '10+', label: 'Years in Business' },
  { value: '100%', label: 'Customer Focused' },
]
