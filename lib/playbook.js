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

export function randomArticle() {
  const all = listArticles()
  return all.length ? all[Math.floor(Math.random() * all.length)] : null
}
