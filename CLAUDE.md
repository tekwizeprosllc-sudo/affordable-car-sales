# Affordable Car Sales — dev notes

## Canonical directory
This directory (`/home/me/affordable-car-sales`) is the one connected to
`origin/main` on GitHub and is the one to edit. There are other similarly-named
directories on this machine (`/home/me/projects/affordable-car-sales`,
`/home/me/affordable-ai-dealership`, `/home/me/websites/affordable`) — they are
NOT this repo. Don't assume they're in sync with this one.

## Dev server
Launch config name is `acs-main-dev` (renamed from the generic
`affordable-car-sales-dev` because the `/home/me/projects/affordable-car-sales`
duplicate had an identical name and port 3000, which caused `preview_start`
to sometimes attach to the wrong directory's server). If a preview ever shows
content that doesn't match the source on disk, check `fuser 3000/tcp` and
`ls -la /proc/<pid>/cwd` before debugging further — it's probably pointed at
the wrong process, not a caching bug.

## Git push
`git push` over the default HTTPS remote fails in this sandbox — no stored
credentials (`fatal: could not read Username for 'https://github.com'`).
SSH auth to GitHub as `tekwizeprosllc-sudo` already works. Push with:

```bash
git push git@github.com:tekwizeprosllc-sudo/affordable-car-sales.git main
```

(This doesn't change the configured `origin` remote, which stays HTTPS.)

## Before pushing
Always `git fetch` and check how far behind `origin/main` the local branch is
first — this repo has had long-lived local checkouts fall many commits behind,
including at least one security fix. Merge/rebase onto latest main rather than
force-pushing a stale branch.

## Don't run `npm run build` while the dev server is running
Both `next dev` and `next build` write to the same `.next/` directory. Running
a build while a `next dev` process is up corrupts its in-memory asset manifest
— the dev server keeps responding 200 to page requests but 404s on CSS/JS
chunks, and the page renders as unstyled raw content. If that happens: kill
the dev process, `rm -rf .next`, and start it fresh. If you need to run a
build to verify compilation, stop the dev server first (or accept you'll need
to restart it after).

## Local dev database (no DATABASE_URL set)
Without `DATABASE_URL`/`ADMIN_PASSWORD` in the environment, `lib/db.js` falls
back to an embedded PGlite database at `./data/pgdata`. That directory is
gitignored and does NOT exist in a fresh checkout — PGlite's client doesn't
auto-create the parent `data/` folder, so the first lead-form submission
fails with `ENOENT: no such file or directory, mkdir '.../data/pgdata'`.
Fix: `mkdir data` once. Also note `getDevClient()` caches a *rejected* promise
in memory on first failure and never retries it — creating the directory
after a failed attempt isn't enough, the dev server process must be restarted
too. `/admin` requires `ADMIN_PASSWORD` to be set (by design, see `lib/auth.js`
— no fallback password) — set it only for local verification, don't commit it.
