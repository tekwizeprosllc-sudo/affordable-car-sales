import * as cheerio from 'cheerio'

const SOURCE_ORIGIN = 'https://affordablecarsalesoh.com'
const LIST_URL = `${SOURCE_ORIGIN}/inventory?clearall=1&pagesize=100`
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const PLACEHOLDER = /newarrivalphoto/i

function parseNumber(text) {
  if (!text) return null
  const digits = text.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : null
}

// Prices arrive as "$8,995.00" — strip separators but keep the decimal point.
function parsePrice(text) {
  if (!text) return null
  const match = text.replace(/,/g, '').match(/\d+(?:\.\d+)?/)
  return match ? Math.round(parseFloat(match[0])) : null
}

function slugify(v) {
  return [v.year, v.make, v.model, v.trim]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function fetchHtml(url, revalidate = 900) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, next: { revalidate } })
  if (!res.ok) throw new Error(`Source responded ${res.status} for ${url}`)
  return res.text()
}

export async function getInventory() {
  try {
    const $ = cheerio.load(await fetchHtml(LIST_URL))
    const vehicles = []

    $('.i11r-vehicle').each((_, el) => {
      const card = $(el)
      const href = card.find('h4.i11r_vehicleTitle a').first().attr('href') || ''
      const id = (href.match(/\/vdp\/(\d+)\//) || [])[1]
      if (!id) return

      const opt = (cls) =>
        card.find(`.${cls}`).first().clone().children('label').remove().end().text().replace(/ /g, ' ').trim()

      const year = parseInt(opt('i11r_optYear'), 10) || null
      const make = opt('i11r_optMake')
      const model = opt('i11r_optModel')
      if (!year || !make || !model) return

      const img = card.find('.i11r_image img').first()
      const rawImage = img.attr('data-src') || img.attr('src') || ''
      const image = rawImage.startsWith('http') && !PLACEHOLDER.test(rawImage) ? rawImage : null

      const vehicle = {
        id,
        year,
        make,
        model,
        trim: opt('i11r_optTrim'),
        stock: opt('i11r_optStock'),
        vin: opt('i11r_optVin'),
        mileage: parseNumber(opt('i11r_optMileage')),
        engine: opt('i11r_optEngine2') || opt('i11r_optEngine'),
        trans: opt('i11r_optTrans2') || opt('i11r_optTrans'),
        drive: opt('i11r_optDrive'),
        bodyType: opt('i11r_optBody'),
        fuel: opt('i11r_optFuel'),
        color: opt('i11r_optColor'),
        interiorColor: opt('i11r_optInteriorColor'),
        price: parsePrice(card.find('.retailWrap .price-2').first().text()),
        image,
      }
      vehicle.slug = slugify(vehicle)
      vehicles.push(vehicle)
    })

    if (!vehicles.length) throw new Error('No vehicles parsed')
    return { vehicles, live: true, fetchedAt: new Date().toISOString() }
  } catch (err) {
    return { vehicles: [], live: false, error: err.message, fetchedAt: new Date().toISOString() }
  }
}

// Public grid = live scrape (minus anything staff hid or marked sold) plus
// staff-added cars. Scrape stays the source of truth for the existing lot.
export async function getPublicInventory() {
  const base = await getInventory()
  let manual = []
  let overrides = {}
  try {
    const store = await import('./vehicles')
    const [m, o] = await Promise.all([store.listManualVehicles(), store.listOverrides()])
    manual = m.filter((v) => v.status === 'live')
    overrides = o
  } catch (err) {
    // No database configured — fall back to the scrape alone.
  }

  const scraped = base.vehicles.filter((v) => {
    const o = overrides[v.id]
    if (!o) return true
    return !o.hidden && o.status !== 'sold'
  })

  return { ...base, vehicles: [...manual, ...scraped] }
}

export async function getVehicle(id) {
  if (String(id).startsWith('m')) {
    try {
      const store = await import('./vehicles')
      const manual = await store.listManualVehicles()
      const found = manual.find((v) => v.id === String(id))
      if (found) return { ...found, photos: found.photos || [], description: found.description || '' }
    } catch (err) {
      return null
    }
    return null
  }
  return getScrapedVehicle(id)
}

async function getScrapedVehicle(id) {
  if (!/^\d+$/.test(String(id))) return null

  const { vehicles } = await getInventory()
  const base = vehicles.find((v) => v.id === String(id))
  if (!base) return null

  let photos = []
  let description = ''
  try {
    const $ = cheerio.load(await fetchHtml(`${SOURCE_ORIGIN}/vdp/${id}/vehicle`, 900))
    const seen = new Set()
    $('img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || ''
      if (!src.includes(`/Media/`) || !src.includes(`/${id}/`)) return
      if (PLACEHOLDER.test(src) || seen.has(src)) return
      seen.add(src)
      photos.push(src)
    })
    description = $('.i11r_comments, .vehicleComments, .inv-comments').first().text().trim()
  } catch (err) {
    photos = []
  }

  if (!photos.length && base.image) photos = [base.image]
  return { ...base, photos, description }
}
