import fs from 'fs'
import path from 'path'

const DIR = path.join(process.cwd(), 'content', 'playbook')

function parse(raw, slug) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  const meta = {}
  let body = raw

  if (match) {
    body = raw.slice(match[0].length)
    for (const line of match[1].split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    }
  }

  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug,
    title: meta.title || slug,
    summary: meta.summary || '',
    topic: meta.topic || 'floor',
    video: meta.video || '',
    minutes: Math.max(1, Math.round(words / 220)),
    words,
    body,
  }
}

export function listArticles() {
  if (!fs.existsSync(DIR)) return []
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => parse(fs.readFileSync(path.join(DIR, f), 'utf8'), f.replace(/\.md$/, '')))
}

export function getArticle(slug) {
  const file = path.join(DIR, `${path.basename(slug)}.md`)
  if (!fs.existsSync(file)) return null
  return parse(fs.readFileSync(file, 'utf8'), slug)
}

// ISO week number, so the featured pick is stable for everyone all week and
// moves on its own each Monday — a different article every load just looked
// broken to staff who opened the page twice.
function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
}

export function weeklyArticle(date = new Date()) {
  const all = listArticles()
  if (!all.length) return null
  return all[isoWeek(date) % all.length]
}

export function weekLabel(date = new Date()) {
  return `Week ${isoWeek(date)}`
}
