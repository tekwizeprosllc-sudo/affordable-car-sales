import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, PlayCircle } from 'lucide-react'
import { isAuthed } from '@/lib/auth'
import AdminLogin from '@/components/AdminLogin'
import { getArticle } from '@/lib/playbook'
import PlaybookArt from '@/components/PlaybookArt'

export const dynamic = 'force-dynamic'

export const metadata = { robots: { index: false, follow: false } }

// Minimal markdown: headings, bold, lists, paragraphs. No user input reaches
// this, so a full parser would be weight we do not need.
function render(body) {
  const blocks = body.trim().split(/\n{2,}/)
  return blocks.map((block, i) => {
    const lines = block.split('\n')

    if (/^#{1,6}\s/.test(block)) {
      const level = block.match(/^#+/)[0].length
      const text = block.replace(/^#+\s*/, '')
      const Tag = level <= 2 ? 'h2' : 'h3'
      return (
        <Tag key={i} className={`font-display uppercase ${level <= 2 ? 'mt-8 text-2xl' : 'mt-6 text-lg'} font-black`}>
          {text}
        </Tag>
      )
    }

    if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
      return (
        <ul key={i} className="mt-4 flex list-disc flex-col gap-2 pl-5">
          {lines.map((l, j) => (
            <li key={j} className="text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {inline(l.replace(/^\s*[-*]\s/, ''))}
            </li>
          ))}
        </ul>
      )
    }

    if (lines.every((l) => /^\s*\d+\.\s/.test(l))) {
      return (
        <ol key={i} className="mt-4 flex list-decimal flex-col gap-2 pl-5">
          {lines.map((l, j) => (
            <li key={j} className="text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {inline(l.replace(/^\s*\d+\.\s/, ''))}
            </li>
          ))}
        </ol>
      )
    }

    return (
      <p key={i} className="mt-4 text-[14.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
        {inline(block)}
      </p>
    )
  })
}

function inline(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: 'var(--fg)' }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}

export default function ArticlePage({ params }) {
  if (!isAuthed()) return <AdminLogin />

  const article = getArticle(params.slug)
  if (!article) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/admin/playbook"
        className="mb-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] transition hover:text-crimson"
      >
        <ArrowLeft size={14} /> Playbook
      </Link>

      <article>
        <div className="mb-7 overflow-hidden rounded-[6px]">
          <PlaybookArt topic={article.topic} className="h-36" label={article.topic} />
        </div>

        <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-black uppercase leading-[0.95]">{article.title}</h1>
        <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
          {article.minutes} min read
        </p>
        {article.video && (
          <a
            href={article.video}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost mt-5 inline-flex"
          >
            <PlayCircle size={15} /> Watch the walkthrough
          </a>
        )}

        <div className="mt-6">{render(article.body)}</div>
      </article>
    </main>
  )
}
