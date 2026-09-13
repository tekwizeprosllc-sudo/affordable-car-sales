// The dealer feed carries no fuel economy at all, so MPG comes from the EPA's
// public fueleconomy.gov service. Free, no key, and citable — which matters,
// because inventing an MPG figure is exactly the kind of claim we refuse to make.
const BASE = 'https://www.fueleconomy.gov/ws/rest/vehicle'
const DAY = 60 * 60 * 24

async function epa(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/xml' },
    next: { revalidate: DAY * 30 },
  })
  if (!res.ok) throw new Error(`EPA responded ${res.status}`)
  return res.text()
}

function tags(xml, tag) {
  const out = []
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'g')
  let m
  while ((m = re.exec(xml))) out.push(m[1])
  return out
}

function firstTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`))
  return m ? m[1] : null
}

// EPA model names carry the drivetrain ("Patriot 4WD"), so an exact match on
// the dealer's "Patriot" never hits. Match on prefix, then prefer the variant
// whose drivetrain agrees with the listing.
function pickModel(models, model, drive) {
  const want = (model || '').trim().toLowerCase()
  if (!want) return null

  const candidates = models.filter((m) => {
    const low = m.toLowerCase()
    return low === want || low.startsWith(`${want} `)
  })
  if (!candidates.length) return null
  if (candidates.length === 1) return candidates[0]

  const d = (drive || '').toUpperCase()
  const wants4 = d === '4WD' || d === 'AWD'
  const match = candidates.find((m) => (wants4 ? /4WD|AWD/i.test(m) : /FWD|2WD|RWD/i.test(m)))
  return match || candidates[0]
}

export async function getMpg({ year, make, model, drive }) {
  if (!year || !make || !model) return null

  try {
    const modelsXml = await epa(
      `/menu/model?year=${year}&make=${encodeURIComponent(make)}`
    )
    const chosen = pickModel(tags(modelsXml, 'text'), model, drive)
    if (!chosen) return null

    const optionsXml = await epa(
      `/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(chosen)}`
    )
    const id = tags(optionsXml, 'value')[0]
    if (!id) return null

    const detail = await epa(`/${id}`)
    const city = parseInt(firstTag(detail, 'city08'), 10)
    const highway = parseInt(firstTag(detail, 'highway08'), 10)
    const combined = parseInt(firstTag(detail, 'comb08'), 10)
    if (!city || !highway) return null

    return { city, highway, combined: combined || null, epaModel: chosen }
  } catch (err) {
    return null
  }
}
