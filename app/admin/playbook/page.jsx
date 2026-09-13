import Link from 'next/link'
import { ArrowRight, BookOpen, CalendarDays, PlayCircle } from 'lucide-react'
import { isAuthed } from '@/lib/auth'
import AdminLogin from '@/components/AdminLogin'
import { listArticles, weeklyArticle, weekLabel } from '@/lib/playbook'
import PlaybookArt from '@/components/PlaybookArt'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Playbook | Affordable Car Sales',
  robots: { index: false, follow: false },
}

export default function PlaybookPage() {
  if (!isAuthed()) return <AdminLogin />

  const articles = listArticles()
  const pick = weeklyArticle()

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black uppercase">Playbook</h1>
        <p className="mt-1 text-[12.5px]" style={{ color: 'var(--muted)' }}>
          {articles.length} article{articles.length === 1 ? '' : 's'} · one featured each week · {weekLabel()}
        </p>
      </div>

      {pick && (
        <Link
          href={`/admin/playbook/${pick.slug}`}
          className="mb-8 block overflow-hidden rounded-[6px] transition hover:border-crimson/50"
          style={{ background: 'var(--surface)', border: '1px solid rgba(225,6,0,0.35)' }}
        >
          <PlaybookArt topic={pick.topic} className="h-28" label={pick.topic} />
          <div className="p-7">
          <span className="eyebrow flex items-center gap-2">
            <CalendarDays size={12} /> This week&rsquo;s pick · {weekLabel()}
          </span>
          <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight">{pick.title}</h2>
          {pick.summary && (
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              {pick.summary}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent">
            Read it · {pick.minutes} min <ArrowRight size={13} />
          </span>
          </div>
        </Link>
      )}

      {articles.length === 0 ? (
        <div className="panel rounded-[5px] p-16 text-center">
          <BookOpen size={24} className="mx-auto text-crimson" />
          <p className="mt-3 font-display text-xl font-bold uppercase">No articles yet</p>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--muted)' }}>
            Drop markdown files into <code>content/playbook/</code> and they show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/admin/playbook/${a.slug}`}
              className="panel flex flex-col overflow-hidden rounded-[5px] transition hover:-translate-y-0.5"
            >
              <PlaybookArt topic={a.topic} className="h-24" />
              <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-[17px] font-bold uppercase leading-tight">{a.title}</h3>
              {a.summary && (
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {a.summary}
                </p>
              )}
              <span className="mt-4 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: 'var(--muted)' }}>
                {a.minutes} min read
                {a.video && (
                  <span className="inline-flex items-center gap-1 text-accent">
                    <PlayCircle size={12} /> Video
                  </span>
                )}
              </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
